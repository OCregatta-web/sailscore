from typing import List, Dict, Optional
import schemas, models

TOT_A = 566.431
TOT_B = 401.431

def phrf_corrected_time(elapsed_seconds: float, phrf_rating: int) -> float:
    return elapsed_seconds * (TOT_A / (TOT_B + phrf_rating))

def seconds_to_display(seconds: Optional[float]) -> Optional[str]:
    if seconds is None:
        return None
    total = int(round(seconds))
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h}:{m:02d}:{s:02d}"

def parse_time_str(t: Optional[str]) -> Optional[int]:
    """Parse HH:MM:SS or HH:MM into total seconds. Returns None if invalid."""
    if not t:
        return None
    parts = t.strip().split(":")
    try:
        nums = [int(p) for p in parts]
    except ValueError:
        return None
    if len(nums) == 3:
        return nums[0] * 3600 + nums[1] * 60 + nums[2]
    if len(nums) == 2:
        return nums[0] * 3600 + nums[1] * 60
    return None

def total_seconds_to_hhmmss(total: int) -> str:
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h:02d}:{m:02d}:{s:02d}"

def penalty_points(status: str, fleet_size: int) -> float:
    if status == "DSQ":
        return fleet_size + 2
    return fleet_size + 1

def compute_race_results(finishes, boats, race=None, fleet_size=None):
    boat_map = {b.id: b for b in boats}
    if fleet_size is None:
        fleet_size = len(boats)
    finish_map = {f.boat_id: f for f in finishes}
    results = []

    for finish in finishes:
        boat = boat_map.get(finish.boat_id)
        if not boat:
            continue
        corrected = None

        # Use the stored start_time from the Finish record (set per-fleet at scoring time)
        start_time_str = getattr(finish, 'start_time', None)
        raw_finish_time = getattr(finish, 'finish_time', None)

        # For old records where start_time was never saved, derive it from
        # finish_time - elapsed_seconds as a fallback.
        if not start_time_str and finish.elapsed_seconds is not None and raw_finish_time:
            finish_secs = parse_time_str(raw_finish_time)
            if finish_secs is not None:
                derived_start = finish_secs - int(round(finish.elapsed_seconds))
                if derived_start >= 0:
                    start_time_str = total_seconds_to_hhmmss(derived_start)

        # Always derive finish_time from start_time + elapsed_seconds for consistency.
        # This corrects any stale finish_time values that may have been stored under
        # the old race-level start_time system.
        finish_time_str = None
        if finish.status == "FIN" and finish.elapsed_seconds is not None:
            corrected = phrf_corrected_time(finish.elapsed_seconds, boat.phrf_rating)
            start_secs = parse_time_str(start_time_str)
            if start_secs is not None:
                finish_time_str = total_seconds_to_hhmmss(start_secs + int(round(finish.elapsed_seconds)))

        results.append({
            "boat_id": boat.id, "sail_number": boat.sail_number,
            "boat_name": boat.boat_name, "skipper": boat.skipper,
            "phrf_rating": boat.phrf_rating, "fleet": boat.fleet,
            "club": getattr(boat, 'club', None),
            "start_time": start_time_str,
            "finish_time": finish_time_str,
            "elapsed_seconds": finish.elapsed_seconds,
            "corrected_seconds": corrected,
            "elapsed_display": seconds_to_display(finish.elapsed_seconds),
            "corrected_display": seconds_to_display(corrected),
            "status": finish.status, "points": None, "position": None,
        })

    for boat in boats:
        if boat.id not in finish_map:
            results.append({
                "boat_id": boat.id, "sail_number": boat.sail_number,
                "boat_name": boat.boat_name, "skipper": boat.skipper,
                "phrf_rating": boat.phrf_rating, "fleet": boat.fleet,
                "club": getattr(boat, 'club', None),
                "start_time": None,
                "finish_time": None,
                "elapsed_seconds": None, "corrected_seconds": None,
                "elapsed_display": None, "corrected_display": None,
                "status": "DNS", "points": None, "position": None,
            })

    finishers = sorted(
        [r for r in results if r["status"] == "FIN" and r["corrected_seconds"] is not None],
        key=lambda r: r["corrected_seconds"]
    )
    penalties = [r for r in results if r["status"] != "FIN" or r["corrected_seconds"] is None]

    for i, r in enumerate(finishers):
        r["position"] = i + 1
        r["points"] = float(i + 1)

    for r in penalties:
        r["points"] = penalty_points(r["status"], fleet_size)

    return [schemas.RaceResult(**r) for r in finishers + penalties]

def compute_series_standings(series, races, boats, all_finishes):
    # Group boats by fleet
    fleets = {}
    for boat in boats:
        fleet = boat.fleet or "NFS"
        if fleet not in fleets:
            fleets[fleet] = []
        fleets[fleet].append(boat)

    fleet_standings = {}
    for fleet_name, fleet_boats in fleets.items():
        fleet_size = len(fleet_boats)
        throwouts = series.throwouts
        is_distance_fleet = fleet_name.lower() == "distance"

        # Only score races relevant to this fleet:
        # distance races count for the distance fleet, non-distance races for all other fleets
        fleet_races = [
            r for r in races
            if is_distance_fleet == ("distance" in (r.name or "").lower())
        ]

        # Compute per-race results for this fleet only
        race_results_map = {}
        for race in fleet_races:
            finishes = all_finishes.get(race.id, [])
            # Filter to only this fleet's finishes
            fleet_boat_ids = {b.id for b in fleet_boats}
            fleet_finishes = [f for f in finishes if f.boat_id in fleet_boat_ids]
            results = compute_race_results(fleet_finishes, fleet_boats, race=race, fleet_size=fleet_size)
            race_results_map[race.id] = {r.boat_id: r for r in results}

        rows = []
        for boat in fleet_boats:
            race_points = {}
            all_pts = []

            for race in fleet_races:
                result = race_results_map.get(race.id, {}).get(boat.id)
                if result:
                    pts = result.points
                    display = str(int(pts)) if pts == int(pts) else str(pts)
                    if result.status != "FIN":
                        display = f"{result.status} ({int(pts)})"
                else:
                    pts = penalty_points("DNS", fleet_size)
                    display = f"DNS ({int(pts)})"

                all_pts.append(pts)
                race_points[race.id] = {"points": pts, "display": display, "thrown_out": False}

            total_points = sum(all_pts)

            if throwouts > 0 and len(all_pts) > throwouts:
                sorted_pts = sorted(enumerate(all_pts), key=lambda x: x[1], reverse=True)
                throwout_indices = {idx for idx, _ in sorted_pts[:throwouts]}
                net_points = sum(pts for i, pts in enumerate(all_pts) if i not in throwout_indices)
                for i, race in enumerate(races):
                    if i in throwout_indices:
                        race_points[race.id]["thrown_out"] = True
                        old = race_points[race.id]["display"]
                        race_points[race.id]["display"] = f"[{old}]"
            else:
                net_points = total_points

            rows.append(schemas.StandingsRow(
                position=0, boat_id=boat.id, sail_number=boat.sail_number,
                boat_name=boat.boat_name, skipper=boat.skipper,
                phrf_rating=boat.phrf_rating, fleet=boat.fleet,
                boat_class=getattr(boat, 'boat_class', None),
                club=getattr(boat, 'club', None),
                race_points=race_points,
                total_points=total_points, net_points=net_points,
            ))

        rows.sort(key=lambda r: r.net_points)
        for i, row in enumerate(rows):
            row.position = i + 1

        fleet_standings[fleet_name] = rows

    return schemas.SeriesStandings(
        series_id=series.id,
        series_name=series.name,
        races_sailed=len(races),
        throwouts=series.throwouts,
        rows=[row for rows in fleet_standings.values() for row in rows],
        fleet_standings=fleet_standings,
    )
