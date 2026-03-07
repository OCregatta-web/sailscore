from sqlalchemy import create_engine, text

POSTGRES_URL = "postgresql+pg8000://postgres:wEjdpFVmshEyMLXAvuZnQUkMJYwZaZCt@shortline.proxy.rlwy.net:49218/railway"

engine = create_engine(POSTGRES_URL)

with engine.begin() as conn:
    tables = ['users', 'series', 'boats', 'races', 'finishes', 'registrations']
    for table in tables:
        conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), MAX(id)) FROM {table}"))
        print(f'Reset sequence for {table}')

print('Done!')
