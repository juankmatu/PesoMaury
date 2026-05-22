from flask import Flask, request, jsonify, render_template
import os
import psycopg2
import psycopg2.extras

app = Flask(__name__)


def get_db():
    conn = psycopg2.connect(
        os.environ["DATABASE_URL"],
        cursor_factory=psycopg2.extras.RealDictCursor,
    )
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


init_db()


def _exec(sql, params=None):
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            if cur.description:
                return [dict(r) for r in cur.fetchall()]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/grafico")
def grafico():
    return render_template("grafico.html")


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
        _exec(
            "INSERT INTO registros (fecha, peso) VALUES (%s, %s) "
            "ON CONFLICT (fecha) DO UPDATE SET peso = EXCLUDED.peso",
            (fecha, float(peso)),
        )
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/registros/<int:id>", methods=["DELETE"])
def delete_registro(id):
    _exec("DELETE FROM registros WHERE id = %s", (id,))
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
        _exec(
            "INSERT INTO config (clave, valor) VALUES (%s, %s) "
            "ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor",
            (clave, str(valor)),
        )
    return jsonify({"ok": True})


if __name__ == "__main__":
    print("[OK] Servidor iniciado en http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
