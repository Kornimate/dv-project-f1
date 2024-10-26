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
    
    if session.laps.empty:
        logging.warning("No lap data available for the session.")
        return standings 
    
    for lap in session.laps.iterlaps():
        lap_index, lap_data = lap  # Unpack the tuple
        lap_number = lap_data['LapNumber']  # Now we can access lap_data as a Series
        lap_data_dict = {"lap": lap_number}
        
        if session.results.empty:
            logging.warning("No results data available for the session.")
            return standings  
        
        for driver in session.results.DriverId:
            try:
                driver_results = session.results.loc[session.results.DriverId == driver]
                if not driver_results.empty:
                    position = driver_results.Position.values[0]
                else:
                    logging.warning("No results for driver %s", driver)
                    position = None  

                lap_data_dict[driver] = position
            except Exception as e:
                logging.warning("Error fetching position for driver %s in lap %d: %s", driver, lap_number, str(e))
                lap_data_dict[driver] = None 
        standings.append(lap_data_dict)

    logging.info("Standings data prepared successfully.")
    return standings