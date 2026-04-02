from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    boat_name: Optional[str] = None
    skipper: Optional[str] = None
    club: Optional[str] = None
    phrf_rating: Optional[int] = None
    fleet: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    boat_name: Optional[str] = None
    skipper: Optional[str] = None
    club: Optional[str] = None
    phrf_rating: Optional[int] = None
    fleet: Optional[str] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SeriesCreate(BaseModel):
    name: str
    season: Optional[str] = None
    throwouts: int = 0

class SeriesOut(BaseModel):
    id: int
    name: str
    season: Optional[str]
    throwouts: int
    owner_id: int
    class Config:
        from_attributes = True

class BoatCreate(BaseModel):
    sail_number: str
    boat_name: str
    skipper: str
    phrf_rating: int
    fleet: Optional[str] = "NFS"
    boat_class: Optional[str] = None
    club: Optional[str] = None

class BoatOut(BaseModel):
    id: int
    sail_number: str
    boat_name: str
    skipper: str
    phrf_rating: int
    fleet: Optional[str]
    boat_class: Optional[str] = None
    club: Optional[str] = None
    series_id: int
    class Config:
        from_attributes = True

class RaceCreate(BaseModel):
    race_number: int
    name: Optional[str] = None
    race_date: Optional[str] = None
    start_time: Optional[str] = None

class RaceOut(BaseModel):
    id: int
    race_number: int
    name: Optional[str]
    race_date: Optional[str]
    series_id: int
    class Config:
        from_attributes = True
    start_time: Optional[str] = None

class FinishCreate(BaseModel):
    boat_id: int
    elapsed_seconds: Optional[float] = None
    finish_time: Optional[str] = None
    status: str = "FIN"

class FinishOut(BaseModel):
    id: int
    race_id: int
    boat_id: int
    elapsed_seconds: Optional[float]
    finish_time: Optional[str] = None
    corrected_seconds: Optional[float]
    status: str
    class Config:
        from_attributes = True

class RaceResult(BaseModel):
    position: Optional[int]
    boat_id: int
    sail_number: str
    boat_name: str
    skipper: str
    phrf_rating: int
    fleet: Optional[str] = None
    club: Optional[str] = None
    finish_time: Optional[str] = None
    elapsed_seconds: Optional[float]
    corrected_seconds: Optional[float]
    elapsed_display: Optional[str]
    corrected_display: Optional[str]
    status: str
    points: float

class StandingsRow(BaseModel):
    position: int
    boat_id: int
    sail_number: str
    boat_name: str
    skipper: str
    phrf_rating: int
    fleet: Optional[str] = None
    boat_class: Optional[str] = None
    club: Optional[str] = None
    race_points: Dict[int, Any]
    total_points: float
    net_points: float

class SeriesStandings(BaseModel):
    series_id: int
    series_name: str
    races_sailed: int
    throwouts: int
    rows: List[StandingsRow]
    fleet_standings: Dict[str, List[StandingsRow]]
class RegistrationCreate(BaseModel):
    boat_name: str
    sail_number: str
    skipper: str
    phrf_rating: int
    fleet: str
    club: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    boat_class: Optional[str] = None

class RegistrationOut(BaseModel):
    id: int
    series_id: int
    boat_name: str
    sail_number: str
    skipper: str
    phrf_rating: int
    fleet: str
    club: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    boat_class: Optional[str]
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True