from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    boat_name = Column(String, nullable=True)
    skipper = Column(String, nullable=True)
    club = Column(String, nullable=True)
    phrf_rating = Column(Integer, nullable=True)
    fleet = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    series = relationship("Series", back_populates="owner")

class Series(Base):
    __tablename__ = "series"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    season = Column(String)
    throwouts = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="series")
    boats = relationship("Boat", back_populates="series", cascade="all, delete-orphan")
    races = relationship("Race", back_populates="series", cascade="all, delete-orphan", order_by="Race.race_number")

class Boat(Base):
    __tablename__ = "boats"
    id = Column(Integer, primary_key=True, index=True)
    sail_number = Column(String, nullable=False)
    boat_name = Column(String, nullable=False)
    skipper = Column(String, nullable=False)
    phrf_rating = Column(Integer, nullable=False)
    fleet = Column(String, nullable=True, default="NFS")
    boat_class = Column(String, nullable=True)
    series_id = Column(Integer, ForeignKey("series.id"))
    series = relationship("Series", back_populates="boats")
    finishes = relationship("Finish", back_populates="boat", cascade="all, delete-orphan")

class Race(Base):
    __tablename__ = "races"
    id = Column(Integer, primary_key=True, index=True)
    race_number = Column(Integer, nullable=False)
    name = Column(String)
    race_date = Column(String)
    start_time = Column(String, nullable=True)
    series_id = Column(Integer, ForeignKey("series.id"))
    series = relationship("Series", back_populates="races")
    finishes = relationship("Finish", back_populates="race", cascade="all, delete-orphan")

class Finish(Base):
    __tablename__ = "finishes"
    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("races.id"))
    boat_id = Column(Integer, ForeignKey("boats.id"))
    elapsed_seconds = Column(Float, nullable=True)
    status = Column(String, default="FIN")
    corrected_seconds = Column(Float, nullable=True)
    race = relationship("Race", back_populates="finishes")
    boat = relationship("Boat", back_populates="finishes")
class Registration(Base):
    __tablename__ = "registrations"
    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("series.id"))
    boat_name = Column(String, nullable=False)
    sail_number = Column(String, nullable=False)
    skipper = Column(String, nullable=False)
    phrf_rating = Column(Integer, nullable=False)
    fleet = Column(String, nullable=False)
    club = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    boat_class = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    series = relationship("Series")