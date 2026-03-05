import os
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

# ── Public Registration (no auth required) ────────────────────────────────────

@app.get("/register/{series_id}/info")
def registration_info(series_id: int, db: Session = Depends(get_db)):
    from models import Series
    series = db.query(Series).filter(Series.id == series_id).first()
    if not series:
        raise HTTPException(404, "Series not found")
    return {"series_id": series.id, "series_name": series.name, "season": series.season}

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
        return result
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(500, str(e))
@app.get("/series/{series_id}/registrations", response_model=List[schemas.RegistrationOut])
def list_registrations(series_id: int, db: Session = Depends(get_db),
                       current_user=Depends(auth.get_current_user)):
    return crud.get_registrations(db, series_id)