from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
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

    IS_PG = True
else:
    import sqlite3

    DB = os.environ.get("DB_PATH", "/tmp/maurydb.db")

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

    IS_PG = False

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


class RegistroInput(BaseModel):
    fecha: str
    peso: float


class ConfigInput(BaseModel):
    meta: float | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/registros")
def get_registros():
    rows = _exec("SELECT * FROM registros ORDER BY fecha ASC")
    return rows or []


@app.post("/registros")
def add_registro(data: RegistroInput):
    try:
        if IS_PG:
            _exec(
                "INSERT INTO registros (fecha, peso) VALUES (%s, %s) "
                "ON CONFLICT (fecha) DO UPDATE SET peso = EXCLUDED.peso",
                (data.fecha, float(data.peso))
            )
        else:
            _exec(
                "INSERT OR REPLACE INTO registros (fecha, peso) VALUES (?, ?)",
                (data.fecha, float(data.peso))
            )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/registros/{id}")
def delete_registro(id: int):
    if IS_PG:
        _exec("DELETE FROM registros WHERE id = %s", (id,))
    else:
        _exec("DELETE FROM registros WHERE id = ?", (id,))
    return {"ok": True}


@app.delete("/registros")
def delete_all_registros():
    _exec("DELETE FROM registros")
    return {"ok": True}


@app.get("/config")
def get_config():
    rows = _exec("SELECT clave, valor FROM config") or []
    return {r["clave"]: r["valor"] for r in rows}


@app.post("/config")
def set_config(data: dict):
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
    return {"ok": True}
