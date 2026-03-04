# SailScore — PHRF Handicap Race Scoring App

A full-stack web application for managing and scoring PHRF Time-on-Time handicap sailboat racing series.

---

## Project Structure

```
sailscore/
├── backend/           ← Python + FastAPI + SQLite
│   ├── main.py        ← API routes
│   ├── models.py      ← Database models
│   ├── schemas.py     ← Request/response shapes
│   ├── crud.py        ← Database operations
│   ├── scoring.py     ← PHRF scoring engine
│   ├── auth.py        ← JWT authentication
│   ├── database.py    ← DB connection
│   └── requirements.txt
└── frontend/          ← React + Tailwind (coming next)
```

---

## Backend Setup

### Prerequisites
- Python 3.11 or newer
- pip

### 1. Create a virtual environment
```bash
cd sailscore/backend
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the server
```bash
uvicorn main:app --reload
```

The API will be running at **http://localhost:8000**

### 4. Explore the API docs
Open **http://localhost:8000/docs** in your browser.
FastAPI generates interactive documentation automatically — you can test every endpoint right there.

---

## Scoring Logic

### PHRF Time-on-Time
```
Corrected Time = Elapsed Time × (650 / (650 + PHRF Rating))
```
- A boat with a **higher** (slower) PHRF rating gets a multiplier > 1 → time advantage
- A boat with a **lower** (faster) PHRF rating gets a multiplier < 1 → time penalty
- Lower corrected time wins

### Series Points (US Sailing Low-Point System)
| Finish | Points |
|--------|--------|
| 1st | 1 |
| 2nd | 2 |
| 3rd | 3 |
| ... | ... |
| DNF | Fleet size + 1 |
| DNS | Fleet size + 1 |
| DNC | Fleet size + 1 |
| DSQ | Fleet size + 2 |

### Throwouts
Configure how many worst races to drop per series. Thrown-out races are shown in [brackets] in standings.

---

## API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/me` | Current user |

### Series
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/series` | Create series |
| GET | `/series` | List your series |
| PUT | `/series/{id}` | Update series |
| DELETE | `/series/{id}` | Delete series |

### Boats
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/series/{id}/boats` | Add boat |
| GET | `/series/{id}/boats` | List boats |
| PUT | `/boats/{id}` | Update boat |
| DELETE | `/boats/{id}` | Remove boat |

### Races & Finishes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/series/{id}/races` | Create race |
| GET | `/series/{id}/races` | List races |
| POST | `/races/{id}/finishes` | Record finish (upsert) |
| GET | `/races/{id}/finishes` | List finishes |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/races/{id}/results` | Corrected results for one race |
| GET | `/series/{id}/standings` | Full series standings |
| GET | `/series/{id}/export/csv` | Download standings as CSV |

---

## Before Deploying

1. **Change the SECRET_KEY** in `auth.py` to a long random string
2. **Switch to PostgreSQL** for production (change `SQLALCHEMY_DATABASE_URL` in `database.py`)
3. **Update CORS origins** in `main.py` to your actual frontend URL

---

## Frontend Setup

### Prerequisites
- Node.js 18 or newer
- npm

### 1. Install dependencies
```bash
cd sailscore/frontend
npm install
```

### 2. Start the dev server
```bash
npm run dev
```

The app will be at **http://localhost:3000**

> Make sure the backend is also running at http://localhost:8000 before using the app.

### Pages
| Page | Description |
|------|-------------|
| Login / Register | Create account or sign in |
| Dashboard | View and manage all your racing series |
| Fleet Manager | Add/edit boats with sail numbers and PHRF ratings |
| Race Entry | Select a race, enter elapsed times (H:MM:SS), set DNF/DNS/DSQ |
| Standings | Full series table with throwouts, points breakdown, CSV export |

### Time Entry Format
Enter elapsed times as `H:MM:SS` (e.g. `1:23:45` for 1 hour 23 min 45 sec).
You can also enter `MM:SS` for sub-1-hour times. Press **Enter** or click **Save** per boat, or **Save All** at the bottom.

## Running Both Together (Quick Start)
```bash
# Terminal 1 — backend
cd sailscore/backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 — frontend
cd sailscore/frontend
npm run dev
```
Then open http://localhost:3000 and register an account.
