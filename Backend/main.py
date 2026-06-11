import os
import threading
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse, JSONResponse, Response
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime
from database import get_db, engine
import models, schemas, crud, scoring, auth
import io, csv, time

app = FastAPI(title="SailScore API", version="1.0.0")

def _demo_reset_scheduler():
    """Resets demo data every 24 hours at midnight."""
    while True:
        now = datetime.now()
        # Sleep until next midnight
        next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        sleep_secs = (next_midnight - now).total_seconds()
        time.sleep(sleep_secs)
        try:
            from database import SessionLocal
            db = SessionLocal()
            seed_demo(db)
            db.close()
        except Exception as e:
            print(f"Demo reset failed: {e}")

threading.Thread(target=_demo_reset_scheduler, daemon=True).start()

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

# ── Series Fleets ─────────────────────────────────────────────────────────────

@app.get("/series/{series_id}/fleets")
def list_fleets(series_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.get_series_fleets(db, series_id)

@app.get("/public/series/{series_id}/fleets")
def public_list_fleets(series_id: int, db: Session = Depends(get_db)):
    return crud.get_series_fleets(db, series_id)

@app.post("/series/{series_id}/fleets")
def create_fleet(series_id: int, body: dict, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "Fleet name required")
    return crud.create_series_fleet(db, series_id, name)

@app.put("/series/{series_id}/fleets/{fleet_id}")
def rename_fleet(series_id: int, fleet_id: int, body: dict, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(400, "Fleet name required")
    result = crud.rename_series_fleet(db, fleet_id, name, series_id)
    if not result:
        raise HTTPException(404, "Fleet not found")
    return result

@app.delete("/series/{series_id}/fleets/{fleet_id}")
def delete_fleet(series_id: int, fleet_id: int, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    crud.delete_series_fleet(db, fleet_id, series_id)
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

# ── Finishes ──────────────────────────────────────────────────────────────────

@app.post("/races/{race_id}/finishes", response_model=schemas.FinishOut)
def record_finish(race_id: int, finish: schemas.FinishCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.upsert_finish(db, finish, race_id)

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

# ── Public Results (no auth required) ────────────────────────────────────────

@app.get("/public/series")
def public_series_list(db: Session = Depends(get_db)):
    series = db.query(models.Series).order_by(models.Series.id.desc()).all()
    return [{"id": s.id, "name": s.name, "season": s.season} for s in series]

@app.get("/public/series/{series_id}/standings")
def public_standings(series_id: int, db: Session = Depends(get_db)):
    series = crud.get_series(db, series_id)
    if not series:
        raise HTTPException(404, "Series not found")
    races = crud.get_races(db, series_id)
    boats = crud.get_boats(db, series_id)
    all_finishes = {r.id: crud.get_finishes(db, r.id) for r in races}
    standings = scoring.compute_series_standings(series, races, boats, all_finishes)
    return {
        "series": {"id": series.id, "name": series.name, "season": series.season, "throwouts": series.throwouts},
        "races": [{"id": r.id, "race_number": r.race_number, "name": r.name, "race_date": str(r.race_date) if r.race_date else None} for r in races],
        "standings": standings
    }

@app.get("/public/races/{race_id}/results")
def public_race_results(race_id: int, db: Session = Depends(get_db)):
    race = crud.get_race(db, race_id)
    if not race:
        raise HTTPException(404, "Race not found")
    finishes = crud.get_finishes(db, race_id)
    boats = crud.get_boats(db, race.series_id)
    # Score each fleet separately so positions are per-fleet
    fleets = {}
    for boat in boats:
        fleet = boat.fleet or "NFS"
        if fleet not in fleets:
            fleets[fleet] = []
        fleets[fleet].append(boat)
    all_results = []
    for fleet_boats in fleets.values():
        all_results.extend(scoring.compute_race_results(finishes, fleet_boats))
    return all_results

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

def send_registration_email(reg, series_name: str):
    api_key = os.environ.get("SENDGRID_API_KEY")
    from_email = os.environ.get("SENDGRID_FROM_EMAIL")
    if not api_key or not from_email:
        print("SendGrid not configured, skipping registration notification")
        return
    try:
        import urllib.request, json
        body = f"""New boat registration received for {series_name}:

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
            "subject": f"New Registration: {reg.boat_name} — {series_name}",
            "content": [{"type": "text/plain", "value": body}]
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.sendgrid.com/v3/mail/send",
            data=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            print(f"Registration email sent, status: {response.status}")
    except Exception as e:
        print(f"Failed to send registration email: {e}")
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
    regs = db.query(models.Registration).filter(models.Registration.series_id == series_id).all()
    for reg in regs:
        db.delete(reg)
    db.commit()
    return {"ok": True}

@app.get("/series/{series_id}/registrations", response_model=List[schemas.RegistrationOut])
def list_registrations(series_id: int, db: Session = Depends(get_db),
                       current_user=Depends(auth.get_current_user)):
    return crud.get_registrations(db, series_id)

# ── Demo Reset ────────────────────────────────────────────────────────────────
DEMO_SERIES_NAME = "Lake Breeze Open Regatta"
DEMO_SERIES_SEASON = "2026"
DEMO_RESET_KEY = os.environ.get("DEMO_RESET_KEY", "sailscore-demo-2026")

DEMO_BOATS = [
    {"sail_number": "74111", "boat_name": "Wind Dancer", "skipper": "Sarah Mitchell", "phrf_rating": 72,  "fleet": "FS",       "boat_class": "J35",          "club": "Lake Breeze SC"},
    {"sail_number": "34201", "boat_name": "Blue Horizon", "skipper": "Tom Reeves",    "phrf_rating": 118, "fleet": "FS",       "boat_class": "C&C 38",       "club": "Royal Harbour YC"},
    {"sail_number": "55432", "boat_name": "Pegasus",      "skipper": "Kim Andrews",   "phrf_rating": 132, "fleet": "FS",       "boat_class": "C&C 33",       "club": "Lake Breeze SC"},
    {"sail_number": "22019", "boat_name": "Sea Whisper",  "skipper": "Dave Conroy",   "phrf_rating": 150, "fleet": "FS",       "boat_class": "CS 33",        "club": "Westport SC"},
    {"sail_number": "3301",  "boat_name": "Midnight Run", "skipper": "Paul Hartley",  "phrf_rating": 162, "fleet": "NFS",      "boat_class": "C&C 30 MkII",  "club": "Royal Harbour YC"},
    {"sail_number": "4821",  "boat_name": "Tempest",      "skipper": "Jane Fowler",   "phrf_rating": 178, "fleet": "NFS",      "boat_class": "CS 30",        "club": "Lake Breeze SC"},
    {"sail_number": "9944",  "boat_name": "Osprey",       "skipper": "Rick Tanaka",   "phrf_rating": 191, "fleet": "NFS",      "boat_class": "C&C 29 MkII",  "club": "Westport SC"},
    {"sail_number": "11203", "boat_name": "Silver Arrow",  "skipper": "Lena Park",    "phrf_rating": 219, "fleet": "NFS",      "boat_class": "Ranger 22",    "club": "Royal Harbour YC"},
    {"sail_number": "15044", "boat_name": "Resolute",     "skipper": "Mark Evans",    "phrf_rating": 82,  "fleet": "Distance", "boat_class": "N/A 40",       "club": "Lake Breeze SC"},
    {"sail_number": "52600", "boat_name": "Aurora",       "skipper": "Chris Bell",    "phrf_rating": 54,  "fleet": "Distance", "boat_class": "Beneteau 40.7","club": "Westport SC"},
    {"sail_number": "4501",  "boat_name": "Endeavour",    "skipper": "Greg Santos",   "phrf_rating": 165, "fleet": "Distance", "boat_class": "CS 30",        "club": "Royal Harbour YC"},
    {"sail_number": "CAN 88","boat_name": "Meridian",     "skipper": "Amy Zhao",      "phrf_rating": 0,   "fleet": "1-Design", "boat_class": "Etchells",     "club": "Lake Breeze SC"},
    {"sail_number": "CAN 42","boat_name": "Phantom",      "skipper": "Bill Russo",    "phrf_rating": 0,   "fleet": "1-Design", "boat_class": "Etchells",     "club": "Westport SC"},
]

DEMO_RACES = [
    {"race_number": 1, "name": "",          "race_date": "2026-08-15", "start_time": "11:00:00"},
    {"race_number": 2, "name": "",          "race_date": "2026-08-15", "start_time": "13:00:00"},
    {"race_number": 3, "name": "Distance Race", "race_date": "2026-08-15", "start_time": "10:00:00"},
]

# Finish times in seconds elapsed (None = DNS)
DEMO_FINISHES = {
    1: {
        "Wind Dancer":  {"elapsed": 4210, "status": "FIN"},
        "Blue Horizon": {"elapsed": 4890, "status": "FIN"},
        "Pegasus":      {"elapsed": 5320, "status": "FIN"},
        "Sea Whisper":  {"elapsed": 5890, "status": "FIN"},
        "Midnight Run": {"elapsed": 5100, "status": "FIN"},
        "Tempest":      {"elapsed": 5430, "status": "FIN"},
        "Osprey":       {"elapsed": 5780, "status": "FIN"},
        "Silver Arrow": {"elapsed": 6210, "status": "FIN"},
        "Meridian":     {"elapsed": 4650, "status": "FIN"},
        "Phantom":      {"elapsed": 4820, "status": "FIN"},
    },
    2: {
        "Wind Dancer":  {"elapsed": 4050, "status": "FIN"},
        "Blue Horizon": {"elapsed": 4720, "status": "FIN"},
        "Pegasus":      {"elapsed": 5100, "status": "FIN"},
        "Sea Whisper":  {"elapsed": 5600, "status": "FIN"},
        "Midnight Run": {"elapsed": 4980, "status": "FIN"},
        "Tempest":      {"elapsed": 5250, "status": "FIN"},
        "Osprey":       {"elapsed": 5620, "status": "DNS"},
        "Silver Arrow": {"elapsed": None, "status": "DNS"},
        "Meridian":     {"elapsed": 4530, "status": "FIN"},
        "Phantom":      {"elapsed": 4710, "status": "FIN"},
    },
    3: {
        "Resolute": {"elapsed": 12600, "status": "FIN"},
        "Aurora":   {"elapsed": 11400, "status": "FIN"},
        "Endeavour":{"elapsed": 14100, "status": "FIN"},
    },
}

DEMO_FLEETS = ["FS", "NFS", "Distance", "1-Design"]

def seed_demo(db: Session):
    from auth import get_password_hash
    # Find or create demo user
    demo_user = db.query(models.User).filter(models.User.email == "demo@sailscore.app").first()
    if not demo_user:
        demo_user = models.User(
            email="demo@sailscore.app",
            name="Demo Race Officer",
            hashed_password=get_password_hash("demo1234"),
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    # Remove existing demo series
    old = db.query(models.Series).filter(
        models.Series.name == DEMO_SERIES_NAME,
        models.Series.owner_id == demo_user.id
    ).first()
    if old:
        db.delete(old)
        db.commit()

    # Create series
    series = models.Series(
        name=DEMO_SERIES_NAME,
        season=DEMO_SERIES_SEASON,
        throwouts=1,
        owner_id=demo_user.id,
    )
    db.add(series)
    db.commit()
    db.refresh(series)

    # Create fleets
    for i, fname in enumerate(DEMO_FLEETS):
        db.add(models.SeriesFleet(series_id=series.id, name=fname, sort_order=i))
    db.commit()

    # Create boats
    boat_map = {}
    for b in DEMO_BOATS:
        boat = models.Boat(series_id=series.id, **b)
        db.add(boat)
        db.commit()
        db.refresh(boat)
        boat_map[b["boat_name"]] = boat

    # Create races and finishes
    for rd in DEMO_RACES:
        race = models.Race(series_id=series.id, **rd)
        db.add(race)
        db.commit()
        db.refresh(race)

        finishes = DEMO_FINISHES.get(rd["race_number"], {})
        for boat_name, f in finishes.items():
            boat = boat_map.get(boat_name)
            if not boat:
                continue
            elapsed = f["elapsed"]
            corrected = None
            if f["status"] == "FIN" and elapsed:
                corrected = elapsed * (566.431 / (401.431 + boat.phrf_rating)) if boat.phrf_rating > 0 else elapsed
            db.add(models.Finish(
                race_id=race.id,
                boat_id=boat.id,
                elapsed_seconds=elapsed,
                status=f["status"],
                corrected_seconds=corrected,
            ))
    db.commit()
    return series.id

@app.post("/demo/reset")
def reset_demo(key: str, db: Session = Depends(get_db)):
    if key != DEMO_RESET_KEY:
        raise HTTPException(status_code=403, detail="Invalid reset key")
    series_id = seed_demo(db)
    return {"ok": True, "series_id": series_id, "message": "Demo reset successfully"}

@app.get("/demo/info")
def demo_info(db: Session = Depends(get_db)):
    from auth import get_password_hash
    demo_user = db.query(models.User).filter(models.User.email == "demo@sailscore.app").first()
    if not demo_user:
        return {"ready": False}
    series = db.query(models.Series).filter(
        models.Series.name == DEMO_SERIES_NAME,
        models.Series.owner_id == demo_user.id
    ).first()
    return {
        "ready": series is not None,
        "series_id": series.id if series else None,
        "login_email": "demo@sailscore.app",
        "login_password": "demo1234",
    }