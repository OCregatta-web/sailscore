from sqlalchemy.orm import Session
import models, schemas, auth

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed,
        boat_name=user.boat_name,
        skipper=user.skipper,
        club=user.club,
        phrf_rating=user.phrf_rating,
        fleet=user.fleet,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_series(db: Session, series: schemas.SeriesCreate, owner_id: int):
    db_series = models.Series(**series.model_dump(), owner_id=owner_id)
    db.add(db_series)
    db.commit()
    db.refresh(db_series)
    return db_series

def get_series_for_user(db: Session, owner_id: int):
    return db.query(models.Series).filter(models.Series.owner_id == owner_id).all()

def get_series(db: Session, series_id: int):
    return db.query(models.Series).filter(models.Series.id == series_id).first()

def update_series(db: Session, series_id: int, series: schemas.SeriesCreate):
    db_series = get_series(db, series_id)
    for k, v in series.model_dump().items():
        setattr(db_series, k, v)
    db.commit()
    db.refresh(db_series)
    return db_series

def delete_series(db: Session, series_id: int):
    db_series = get_series(db, series_id)
    db.delete(db_series)
    db.commit()

def create_boat(db: Session, boat: schemas.BoatCreate, series_id: int):
    db_boat = models.Boat(**boat.model_dump(), series_id=series_id)
    db.add(db_boat)
    db.commit()
    db.refresh(db_boat)
    return db_boat

def get_boats(db: Session, series_id: int):
    return db.query(models.Boat).filter(models.Boat.series_id == series_id).all()

def get_boat(db: Session, boat_id: int):
    return db.query(models.Boat).filter(models.Boat.id == boat_id).first()

def update_boat(db: Session, boat_id: int, boat: schemas.BoatCreate):
    db_boat = get_boat(db, boat_id)
    for k, v in boat.model_dump().items():
        setattr(db_boat, k, v)
    db.commit()
    db.refresh(db_boat)
    return db_boat

def delete_boat(db: Session, boat_id: int):
    db_boat = get_boat(db, boat_id)
    db.delete(db_boat)
    db.commit()

def create_race(db: Session, race: schemas.RaceCreate, series_id: int):
    db_race = models.Race(**race.model_dump(), series_id=series_id)
    db.add(db_race)
    db.commit()
    db.refresh(db_race)
    return db_race

def get_races(db: Session, series_id: int):
    return db.query(models.Race).filter(models.Race.series_id == series_id)\
             .order_by(models.Race.race_number).all()

def get_race(db: Session, race_id: int):
    return db.query(models.Race).filter(models.Race.id == race_id).first()

def update_race(db: Session, race_id: int, race: schemas.RaceCreate):
    db_race = get_race(db, race_id)
    for k, v in race.model_dump().items():
        setattr(db_race, k, v)
    db.commit()
    db.refresh(db_race)
    return db_race

def delete_race(db: Session, race_id: int):
    db_race = get_race(db, race_id)
    db.delete(db_race)
    db.commit()

def upsert_finish(db: Session, finish: schemas.FinishCreate, race_id: int):
    existing = db.query(models.Finish).filter(
        models.Finish.race_id == race_id,
        models.Finish.boat_id == finish.boat_id
    ).first()
    corrected = None
    if finish.status == "FIN" and finish.elapsed_seconds is not None:
        boat = get_boat(db, finish.boat_id)
        if boat:
            corrected = finish.elapsed_seconds * (650 / (650 + boat.phrf_rating))
    if existing:
        existing.elapsed_seconds = finish.elapsed_seconds
        existing.status = finish.status
        existing.corrected_seconds = corrected
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_finish = models.Finish(
            race_id=race_id, boat_id=finish.boat_id,
            elapsed_seconds=finish.elapsed_seconds,
            status=finish.status, corrected_seconds=corrected
        )
        db.add(db_finish)
        db.commit()
        db.refresh(db_finish)
        return db_finish

def get_finishes(db: Session, race_id: int):
    return db.query(models.Finish).filter(models.Finish.race_id == race_id).all()

def delete_finish(db: Session, finish_id: int):
    f = db.query(models.Finish).filter(models.Finish.id == finish_id).first()
    db.delete(f)
    db.commit()
def create_registration(db: Session, reg: schemas.RegistrationCreate, series_id: int):
    # Check for existing registration with same sail number
    existing_reg = db.query(models.Registration).filter(
        models.Registration.series_id == series_id,
        models.Registration.sail_number == reg.sail_number
    ).first()

    if existing_reg:
        # Update existing registration
        for k, v in reg.model_dump().items():
            setattr(existing_reg, k, v)
        db.commit()
        db.refresh(existing_reg)
        db_reg = existing_reg
    else:
        # Create new registration
        db_reg = models.Registration(
            series_id=series_id, **reg.model_dump()
        )
        db.add(db_reg)
        db.commit()
        db.refresh(db_reg)

    # Update or create boat in fleet
    existing_boat = db.query(models.Boat).filter(
        models.Boat.series_id == series_id,
        models.Boat.sail_number == reg.sail_number
    ).first()

    if existing_boat:
        existing_boat.boat_name = reg.boat_name
        existing_boat.skipper = reg.skipper
        existing_boat.phrf_rating = reg.phrf_rating
        existing_boat.fleet = reg.fleet
        existing_boat.boat_class = reg.boat_class
        db.commit()
    else:
        db_boat = models.Boat(
            series_id=series_id,
            sail_number=reg.sail_number,
            boat_name=reg.boat_name,
            skipper=reg.skipper,
            phrf_rating=reg.phrf_rating,
            fleet=reg.fleet,
            boat_class=reg.boat_class,
        )
        db.add(db_boat)
        db.commit()

    return db_reg
def get_registrations(db: Session, series_id: int):
    return db.query(models.Registration).filter(
        models.Registration.series_id == series_id
    ).order_by(models.Registration.created_at.desc()).all()