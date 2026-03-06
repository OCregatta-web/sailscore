import os
import threading
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from database import get_db, engine
import models, schemas, crud, scoring, auth
import io, csv

app = FastAPI(title="SailScore API", version="1.0.0")

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

models.Base.metadata.create_all(bind=engine)
# ── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(400, "Email already registered")
    return crud.create_user(db, user)

@app.post("/auth/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    token = auth.create_access_token({"sub": str(user.id)}, timedelta(days=7))
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user=Depends(auth.get_current_user)):
    return current_user

# ── Series ────────────────────────────────────────────────────────────────────

@app.post("/series", response_model=schemas.SeriesOut)
def create_series(series: schemas.SeriesCreate, num_races: int = 0, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    new_series = crud.create_series(db, series, current_user.id)
    for i in range(1, num_races + 1):
        crud.create_race(db, schemas.RaceCreate(race_number=i, name=f"Race {i}"), new_series.id)
    return new_series

@app.get("/series", response_model=List[schemas.SeriesOut])
def list_series(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.get_series_for_user(db, current_user.id)

@app.get("/series/{series_id}", response_model=schemas.SeriesOut)
def get_series(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    s = crud.get_series(db, series_id)
    if not s:
        raise HTTPException(404, "Series not found")
    return s

@app.put("/series/{series_id}", response_model=schemas.SeriesOut)
def update_series(series_id: int, series: schemas.SeriesCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.update_series(db, series_id, series)

@app.delete("/series/{series_id}")
def delete_series(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    crud.delete_series(db, series_id)
    return {"ok": True}

# ── Boats ─────────────────────────────────────────────────────────────────────

@app.post("/series/{series_id}/boats", response_model=schemas.BoatOut)
def add_boat(series_id: int, boat: schemas.BoatCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.create_boat(db, boat, series_id)

@app.get("/series/{series_id}/boats", response_model=List[schemas.BoatOut])
def list_boats(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.get_boats(db, series_id)

@app.put("/boats/{boat_id}", response_model=schemas.BoatOut)
def update_boat(boat_id: int, boat: schemas.BoatCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.update_boat(db, boat_id, boat)

@app.delete("/boats/{boat_id}")
def delete_boat(boat_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    crud.delete_boat(db, boat_id)
    return {"ok": True}

# ── Races ─────────────────────────────────────────────────────────────────────

@app.post("/series/{series_id}/races", response_model=schemas.RaceOut)
def create_race(series_id: int, race: schemas.RaceCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.create_race(db, race, series_id)

@app.get("/series/{series_id}/races", response_model=List[schemas.RaceOut])
def list_races(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.get_races(db, series_id)

@app.get("/races/{race_id}", response_model=schemas.RaceOut)
def get_race(race_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    r = crud.get_race(db, race_id)
    if not r:
        raise HTTPException(404, "Race not found")
    return r

@app.put("/races/{race_id}", response_model=schemas.RaceOut)
def update_race(race_id: int, race: schemas.RaceCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.update_race(db, race_id, race)

@app.delete("/races/{race_id}")
def delete_race(race_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    crud.delete_race(db, race_id)
    return {"ok": True}

def send_fleet_results_email(race, series_name: str, fleet_name: str, results, registrations):
    api_key = os.environ.get("SENDGRID_API_KEY")
    from_email = os.environ.get("SENDGRID_FROM_EMAIL")
    if not api_key or not from_email:
        return

    # Get emails for boats in this fleet that have an email
    fleet_emails = [
        r.email for r in registrations
        if r.fleet == fleet_name and r.email
    ]
    if not fleet_emails:
        return

    # Build results table
    rows = ""
    for r in results:
        rows += f"  {r.position or '-':<4} {r.sail_number:<10} {r.boat_name:<20} {r.skipper:<20} {r.elapsed_display or '-':<12} {r.corrected_display or '-':<12} {r.status:<6} {int(r.points)}\n"

    body = f"""Race {race.race_number} Results — {series_name} ({fleet_name} Fleet)

{'Pos':<4} {'Sail #':<10} {'Boat':<20} {'Skipper':<20} {'Elapsed':<12} {'Corrected':<12} {'Status':<6} Points
{'-'*90}
{rows}
Results are Time-on-Time corrected using PHRF rating (650 / (650 + rating)).
"""

    try:
        import urllib.request, json
        for email in fleet_emails:
            payload = json.dumps({
                "personalizations": [{"to": [{"email": email}]}],
                "from": {"email": from_email},
                "subject": f"Race {race.race_number} Results — {series_name} {fleet_name} Fleet",
                "content": [{"type": "text/plain", "value": body}]
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=payload,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req) as response:
                print(f"Results email sent to {email}, status: {response.status}")
    except Exception as e:
        print(f"Failed to send results email: {e}")

# ── Finishes ──────────────────────────────────────────────────────────────────

@app.post("/races/{race_id}/finishes", response_model=schemas.FinishOut)
def record_finish(race_id: int, finish: schemas.FinishCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    result = crud.upsert_finish(db, finish, race_id)

    def notify():
        try:
            race = crud.get_race(db, race_id)
            series = crud.get_series(db, race.series_id)
            boats = crud.get_boats(db, race.series_id)
            finishes = crud.get_finishes(db, race_id)
            registrations = crud.get_registrations(db, race.series_id)

            # Group boats by fleet and send one email per fleet
            fleets = {}
            for boat in boats:
                fleet = boat.fleet or "NFS"
                if fleet not in fleets:
                    fleets[fleet] = []
                fleets[fleet].append(boat)

            for fleet_name, fleet_boats in fleets.items():
                fleet_results = scoring.compute_race_results(finishes, fleet_boats)
                threading.Thread(
                    target=send_fleet_results_email,
                    args=(race, series.name, fleet_name, fleet_results, registrations),
                    daemon=True
                ).start()
        except Exception as e:
            print(f"Error sending results notifications: {e}")

    threading.Thread(target=notify, daemon=True).start()
    return result

@app.get("/races/{race_id}/finishes", response_model=List[schemas.FinishOut])
def list_finishes(race_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.get_finishes(db, race_id)

@app.delete("/finishes/{finish_id}")
def delete_finish(finish_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    crud.delete_finish(db, finish_id)
    return {"ok": True}

@app.get("/races/{race_id}/results", response_model=List[schemas.RaceResult])
def race_results(race_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    race = crud.get_race(db, race_id)
    if not race:
        raise HTTPException(404, "Race not found")
    finishes = crud.get_finishes(db, race_id)
    boats = crud.get_boats(db, race.series_id)
    return scoring.compute_race_results(finishes, boats)

@app.get("/series/{series_id}/standings", response_model=schemas.SeriesStandings)
def series_standings(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    series = crud.get_series(db, series_id)
    if not series:
        raise HTTPException(404, "Series not found")
    races = crud.get_races(db, series_id)
    boats = crud.get_boats(db, series_id)
    all_finishes = {r.id: crud.get_finishes(db, r.id) for r in races}
    return scoring.compute_series_standings(series, races, boats, all_finishes)

@app.get("/series/{series_id}/export/csv")
def export_csv(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    series = crud.get_series(db, series_id)
    races = crud.get_races(db, series_id)
    boats = crud.get_boats(db, series_id)
    all_finishes = {r.id: crud.get_finishes(db, r.id) for r in races}
    standings = scoring.compute_series_standings(series, races, boats, all_finishes)
    output = io.StringIO()
    writer = csv.writer(output)
    race_headers = [f"R{r.race_number}" for r in races]
    writer.writerow(["Pos", "Sail #", "Boat", "Skipper", "Rating"] + race_headers + ["Net Pts", "Total Pts"])
    for row in standings.rows:
        race_pts = [row.race_points.get(r.id, {}).get("display", "-") for r in races]
        writer.writerow([row.position, row.sail_number, row.boat_name, row.skipper, row.phrf_rating] + race_pts + [row.net_points, row.total_points])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=series_{series_id}_standings.csv"})

def send_registration_email(reg, series_name: str):
    api_key = os.environ.get("SENDGRID_API_KEY")
    from_email = os.environ.get("SENDGRID_FROM_EMAIL")
    if not api_key or not from_email:
        print("SendGrid not configured, skipping notification")
        return
    try:
        import urllib.request
        import json
        body = f"""
New boat registration received for {series_name}:

Boat Name:   {reg.boat_name}
Sail Number: {reg.sail_number}
Skipper:     {reg.skipper}
Club:        {reg.club or 'N/A'}
PHRF Rating: {reg.phrf_rating}
Email:       {reg.email or 'N/A'}
Phone:       {reg.phone or 'N/A'}
Fleet:       {reg.fleet}
Boat Class:  {reg.boat_class or 'N/A'}
"""
        payload = json.dumps({
            "personalizations": [{"to": [{"email": from_email}]}],
            "from": {"email": from_email},
            "subject": f"New Registration: {reg.boat_name} - {series_name}",
            "content": [{"type": "text/plain", "value": body}]
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.sendgrid.com/v3/mail/send",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            print(f"Registration email sent, status: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"Failed to send email: {e.code} {e.reason}")
        print(f"SendGrid error body: {e.read().decode()}")
    except Exception as e:
        print(f"Failed to send email: {e}")
# ── Public Registration (no auth required) ────────────────────────────────────

@app.get("/register/{series_id}/info")
def registration_info(series_id: int, db: Session = Depends(get_db)):
    from models import Series
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(404, "Series not found")
    return {"series_id": series.id, "series_name": series.name, "season": series.season}

@app.get("/register/{series_id}/registrations")
def public_registrations(series_id: int, db: Session = Depends(get_db)):
    return crud.get_registrations(db, series_id)

@app.post("/register/{series_id}")
async def submit_registration(series_id: int, reg: schemas.RegistrationCreate, db: Session = Depends(get_db)):
    try:
        from models import Series
        print(f"Registration attempt for series {series_id}")
        series = db.query(Series).filter(Series.id == series_id).first()
        print(f"Series found: {series}")
        if not series:
            raise HTTPException(404, "Series not found")
        result = crud.create_registration(db, reg, series_id)
        print(f"Registration created: {result.id}")
        threading.Thread(target=send_registration_email, args=(reg, series.name), daemon=True).start()
        return result
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(500, str(e))
@app.get("/backup")
def backup_database(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    import json
    from sqlalchemy import text
    from datetime import datetime
    from fastapi.responses import Response

    tables = ['users', 'series', 'boats', 'races', 'finishes', 'registrations']
    backup = {}

    with engine.connect() as conn:
        for table in tables:
            result = conn.execute(text(f"SELECT * FROM {table}"))
            rows = []
            for row in result.mappings():
                row_dict = {}
                for key, value in row.items():
                    if hasattr(value, 'isoformat'):
                        value = value.isoformat()
                    row_dict[key] = value
                rows.append(row_dict)
            backup[table] = rows

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sailscore_backup_{timestamp}.json"
    content = json.dumps(backup, indent=2)

    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.delete("/series/{series_id}/registrations")
def clear_registrations(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    db.query(models.Registration).filter(models.Registration.series_id == series_id).delete()
    db.commit()
    return {"ok": True}

@app.get("/series/{series_id}/registrations", response_model=List[schemas.RegistrationOut])
def list_registrations(series_id: int, db: Session = Depends(get_db),
                       current_user=Depends(auth.get_current_user)):
    return crud.get_registrations(db, series_id)