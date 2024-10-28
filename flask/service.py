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
        session.load()  # Load all relevant data
        logging.info("Data loaded successfully.")
    except Exception as e:
        logging.error("Error loading session data: %s", str(e))
        raise

    standings = []
    processed_laps = set()  # Track unique laps processed

    if session.laps.empty:
        logging.warning("No lap data available for the session.")
        return standings

    # Get a unique list of all drivers in the session
    all_drivers = session.laps['Driver'].unique()

    for lap_index, lap_data in session.laps.iterrows():
        lap_number = lap_data['LapNumber']
        
        # Check if lap has already been processed
        if lap_number in processed_laps:
            continue  # Skip this lap if already processed

        processed_laps.add(lap_number)  # Add lap to processed set
        lap_data_dict = {"lap": lap_number}
        
        lap_standings = session.laps[session.laps['LapNumber'] == lap_number]
        
        for driver_id in all_drivers:  # Ensure all drivers are included
            try:
                driver_position = lap_standings.loc[lap_standings['Driver'] == driver_id, 'Position'].values
                lap_data_dict[driver_id] = driver_position[0] if len(driver_position) > 0 and not pd.isna(driver_position[0]) else None
            except Exception as e:
                logging.warning("Error fetching position for driver %s in lap %d: %s", driver_id, lap_number, str(e))
                lap_data_dict[driver_id] = None

        standings.append(lap_data_dict)

    logging.info("Standings data prepared successfully.")
    return standings