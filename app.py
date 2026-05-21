from flask import Flask, request, jsonify, render_template
import os

app = Flask(__name__)

if "DATABASE_URL" in os.environ:
    import psycopg2
    import psycopg2.extras

    def get_db():
        conn = psycopg2.connect(os.environ["DATABASE_URL"], cursor_factory=psycopg2.extras.RealDictCursor)
        conn.autocommit = True
        return conn

    def init_db():
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS registros (
                        id SERIAL PRIMARY KEY,
                        fecha TEXT NOT NULL UNIQUE,
                        peso REAL NOT NULL
                    )
                """)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS config (
                        clave TEXT PRIMARY KEY,
                        valor TEXT
                    )
                """)

    def rows_to_dicts(cursor):
        return [dict(r) for r in cursor.fetchall()]

    PH = "%s"
else:
    import sqlite3

    DB = os.environ.get("DB_PATH", "maurydb.db")

    def get_db():
        conn = sqlite3.connect(DB)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db():
        with get_db() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS registros (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fecha TEXT NOT NULL UNIQUE,
                    peso REAL NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS config (
                    clave TEXT PRIMARY KEY,
                    valor TEXT
                )
            """)
            conn.commit()

    def rows_to_dicts(rows):
        return [dict(r) for r in rows]

    PH = "?"

IS_PG = "DATABASE_URL" in os.environ

init_db()


def _exec(sql, params=None):

    with get_db() as conn:
        if IS_PG:
            with conn.cursor() as cur:
                cur.execute(sql, params or ())
                if cur.description:
                    return rows_to_dicts(cur)
        else:
            if params:
                rows = conn.execute(sql, params)
            else:
                rows = conn.execute(sql)
            if rows.description:
                return rows_to_dicts(rows)
            conn.commit()

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/registros", methods=["GET"])
def get_registros():
    rows = _exec("SELECT * FROM registros ORDER BY fecha ASC")
    return jsonify(rows or [])


@app.route("/api/registros", methods=["POST"])
def add_registro():
    data = request.json
    fecha = data.get("fecha")
    peso = data.get("peso")
    if not fecha or peso is None:
        return jsonify({"error": "Faltan datos"}), 400
    try:
        if IS_PG:
            _exec(
                "INSERT INTO registros (fecha, peso) VALUES (%s, %s) "
                "ON CONFLICT (fecha) DO UPDATE SET peso = EXCLUDED.peso",
                (fecha, float(peso))
            )
        else:
            _exec(
                "INSERT OR REPLACE INTO registros (fecha, peso) VALUES (?, ?)",
                (fecha, float(peso))
            )
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/registros/<int:id>", methods=["DELETE"])
def delete_registro(id):
    _exec("DELETE FROM registros WHERE id = " + PH, (id,))
    return jsonify({"ok": True})


@app.route("/api/registros", methods=["DELETE"])
def delete_all_registros():
    _exec("DELETE FROM registros")
    return jsonify({"ok": True})


@app.route("/api/config", methods=["GET"])
def get_config():
    rows = _exec("SELECT clave, valor FROM config") or []
    return jsonify({r["clave"]: r["valor"] for r in rows})


@app.route("/api/config", methods=["POST"])
def set_config():
    data = request.json
    for clave, valor in data.items():
        if IS_PG:
            _exec(
                "INSERT INTO config (clave, valor) VALUES (%s, %s) "
                "ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor",
                (clave, str(valor))
            )
        else:
            _exec(
                "INSERT OR REPLACE INTO config (clave, valor) VALUES (?, ?)",
                (clave, str(valor))
            )
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    print("[OK] Servidor iniciado en http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
