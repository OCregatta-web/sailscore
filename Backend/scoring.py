from typing import List, Dict, Optional
import schemas, models

TOT_CONSTANT = 650

def phrf_corrected_time(elapsed_seconds: float, phrf_rating: int) -> float:
    return elapsed_seconds * (TOT_CONSTANT / (TOT_CONSTANT + phrf_rating))

def seconds_to_display(seconds: Optional[float]) -> Optional[str]:
    if seconds is None:
        return None
    total = int(round(seconds))
    h = total // 3600
    m = (total % 3600) // 60
    s = total % 60
    return f"{h}:{m:02d}:{s:02d}"

def penalty_points(status: str, fleet_size: int) -> float:
    if status == "DSQ":
        return fleet_size + 2
    return fleet_size + 1

def compute_race_results(finishes, boats, race=None):
    boat_map = {b.id: b for b in boats}
    fleet_size = len(boats)
    finish_map = {f.boat_id: f for f in finishes}
    results = []

    # Parse start time for finish time calculation
    start_seconds = None
    if race and race.start_time:
        try:
            parts = race.start_time.split(":")
            start_seconds = int(parts[0]) * 3600 + int(parts[1]) * 60 + (int(parts[2]) if len(parts) > 2 else 0)
        except Exception:
            pass

    for finish in finishes:
        boat = boat_map.get(finish.boat_id)
        if not boat:
            continue
        corrected = None
        finish_time_str = None
        if finish.status == "FIN" and finish.elapsed_seconds is not None:
            corrected = phrf_corrected_time(finish.elapsed_seconds, boat.phrf_rating)
            if start_seconds is not None:
                total = start_seconds + int(finish.elapsed_seconds)
                h, rem = divmod(total, 3600)
                m, s = divmod(rem, 60)
                finish_time_str = f"{h:02d}:{m:02d}:{s:02d}"
        results.append({
            "boat_id": boat.id, "sail_number": boat.sail_number,
            "boat_name": boat.boat_name, "skipper": boat.skipper,
            "phrf_rating": boat.phrf_rating, "fleet": boat.fleet,
            "club": boat.club,
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
                "club": boat.club,
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

        # Compute per-race results for this fleet only
        race_results_map = {}
        for race in races:
            finishes = all_finishes.get(race.id, [])
            results = compute_race_results(finishes, fleet_boats)
            race_results_map[race.id] = {r.boat_id: r for r in results}

        rows = []
        for boat in fleet_boats:
            race_points = {}
            all_pts = []

            for race in races:
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
                boat_class=boat.boat_class, club=boat.club,
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
