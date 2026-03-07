import json
from datetime import datetime
from sqlalchemy import create_engine, text

POSTGRES_URL = "postgresql+pg8000://postgres:wEjdpFVmshEyMLXAvuZnQUkMJYwZaZCt@shortline.proxy.rlwy.net:49218/railway"

engine = create_engine(POSTGRES_URL)

tables = ['users', 'series', 'boats', 'races', 'finishes', 'registrations']
backup = {}

with engine.connect() as conn:
    for table in tables:
        result = conn.execute(text(f"SELECT * FROM {table}"))
        rows = []
        for row in result.mappings():
            row_dict = {}
            for key, value in row.items():
                # Convert datetime objects to strings
                if hasattr(value, 'isoformat'):
                    value = value.isoformat()
                row_dict[key] = value
            rows.append(row_dict)
        backup[table] = rows
        print(f"Backed up {len(rows)} rows from {table}")

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"sailscore_backup_{timestamp}.json"

with open(filename, 'w') as f:
    json.dump(backup, f, indent=2)

print(f"\nBackup saved to {filename}")
