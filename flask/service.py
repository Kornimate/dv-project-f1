import logging
import fastf1
import pandas as pd

def getSessionData(year, circuit, session):
    session = fastf1.get_session(year, circuit, session)
    res = session.load(telemetry=False, laps=False, weather=False)

    return session.results


def getStandingsData(year, circuit, session):
    logging.info("Fetching standings data for Year: %d, Circuit: %s, Session: %s", year, circuit, session)

    try:
        session = fastf1.get_session(year, circuit, session)
        session.load()
        logging.info("Data loaded successfully.")
    except Exception as e:
        logging.error("Error loading session data: %s", str(e))
        raise

    standings = []
    processed_laps = set()

    if session.laps.empty:
        logging.warning("No lap data available for the session.")
        return standings

    all_drivers = session.laps['Driver'].unique()

    # Retrieve grid positions from session results
    grid_positions = {
        result.Abbreviation: result.GridPosition
        for result in session.results.itertuples()
    }

    # First lap includes grid position as the starting position
    lap_data_dict = {"lap": 0}
    for driver_id in all_drivers:
        team_name = session.results.loc[session.results['Abbreviation'] == driver_id, 'TeamName'].values[0]
        lap_data_dict[driver_id] = {
            "position": grid_positions.get(driver_id, None),
            "team": team_name
        }
    standings.append(lap_data_dict)  # Append grid positions as lap 0

    # Process each lap for race standings
    for lap_index, lap_data in session.laps.iterrows():
        lap_number = lap_data['LapNumber']
        
        if lap_number in processed_laps:
            continue

        processed_laps.add(lap_number)
        lap_data_dict = {"lap": lap_number}
        lap_standings = session.laps[session.laps['LapNumber'] == lap_number]
        
        for driver_id in all_drivers:
            try:
                driver_position = lap_standings.loc[lap_standings['Driver'] == driver_id, 'Position'].values
                driver_team = lap_standings.loc[lap_standings['Driver'] == driver_id, 'Team'].values

                lap_data_dict[driver_id] = {
                    "position": driver_position[0] if len(driver_position) > 0 and not pd.isna(driver_position[0]) else None,
                    "team": driver_team[0] if len(driver_team) > 0 and not pd.isna(driver_team[0]) else None
                }
            except Exception as e:
                logging.warning("Error fetching data for driver %s in lap %d: %s", driver_id, lap_number, str(e))
                lap_data_dict[driver_id] = {"position": None, "team": None}

        standings.append(lap_data_dict)
    
    # Final results
    final_standings = {"lap": "Final Results"}
    for result in session.results.itertuples():
        driver = getattr(result, 'Abbreviation', None)
        position = getattr(result, 'Position', None)
        team = getattr(result, 'TeamName', None)

        if driver:
            final_standings[driver] = {
                "position": position,
                "team": team
            }

    standings.append(final_standings)
    logging.info("Standings data prepared successfully.")
    return standings