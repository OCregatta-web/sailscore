from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
from database import get_db, engine
import models, schemas, crud, scoring, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SailScore API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/series", response_model=schemas.SeriesOut)
def create_series(series: schemas.SeriesCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    return crud.create_series(db, series, current_user.id)

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
    from fastapi.responses import StreamingResponse
    import io, csv
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