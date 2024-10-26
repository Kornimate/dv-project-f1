import logging
import fastf1
import pandas as pd

def getSessionData(year, circuit, session):
    session = fastf1.get_session(year, circuit, session)
    res = session.load(telemetry=False, laps=False, weather=False)

    return session.results

# def getStandingsData(year, circuit, session):
#     logging.info("Fetching standings data for Year: %d, Circuit: %s, Session: %s", year, circuit, session)

#     try:
#         session = fastf1.get_session(year, circuit, session)
#         session.load() 
#         logging.info("Data loaded successfully.")
#     except Exception as e:
#         logging.error("Error loading session data: %s", str(e))
#         raise

#     standings = []
    
#     if session.laps.empty:
#         logging.warning("No lap data available for the session.")
#         return standings 
    
#     for lap in session.laps.iterlaps():
#         lap_index, lap_data = lap  # Unpack the tuple
#         lap_number = lap_data['LapNumber']  # Now we can access lap_data as a Series
#         lap_data_dict = {"lap": lap_number}
        
#         if session.results.empty:
#             logging.warning("No results data available for the session.")
#             return standings  
        
#         for driver in session.results.DriverId:
#             try:
#                 driver_results = session.results.loc[session.results.DriverId == driver]
#                 if not driver_results.empty:
#                     position = driver_results.Position.values[0]
#                 else:
#                     logging.warning("No results for driver %s", driver)
#                     position = None  

#                 lap_data_dict[driver] = position
#             except Exception as e:
#                 logging.warning("Error fetching position for driver %s in lap %d: %s", driver, lap_number, str(e))
#                 lap_data_dict[driver] = None 
#         standings.append(lap_data_dict)

#     logging.info("Standings data prepared successfully.")
#     return standings

# def getStandingsData(year, circuit, session):
#     logging.info("Fetching standings data for Year: %d, Circuit: %s, Session: %s", year, circuit, session)

#     try:
#         session = fastf1.get_session(year, circuit, session)
#         session.load()  # Load all relevant data
#         logging.info("Data loaded successfully.")
#     except Exception as e:
#         logging.error("Error loading session data: %s", str(e))
#         raise

#     standings = []
    
#     # Check if laps data is available
#     if session.laps.empty:
#         logging.warning("No lap data available for the session.")
#         return standings  # Return an empty list if no lap data
    
#     # Ensure results data is available
#     if session.results.empty:
#         logging.warning("No results data available for the session.")
#         return standings  # Return an empty list if no results data
    
#     # Iterate over each lap
#     for lap_index, lap_data in session.laps.iterlaps():
#         lap_number = lap_data['LapNumber']  # Access lap_data as a Series
#         lap_data_dict = {"lap": lap_number}

#         # Get positions for the current lap
#         lap_results = lap_data['Driver']  # Get the driver IDs for the current lap
        
#         for driver in session.results.DriverId:
#             # Use try-except to handle potential missing positions
#             try:
#                 # Get the position for the driver at the beginning of the lap
#                 driver_position = lap_data.loc[lap_data['Driver'] == driver, 'Position'].values[0] \
#                     if 'Position' in lap_data else None

#                 if driver_position is not None:
#                     lap_data_dict[driver] = driver_position
#                 else:
#                     logging.warning("No position for driver %s in lap %d", driver, lap_number)
#                     lap_data_dict[driver] = None  # Assign None if there's no position data

#             except Exception as e:
#                 logging.warning("Error fetching position for driver %s in lap %d: %s", driver, lap_number, str(e))
#                 lap_data_dict[driver] = None  # Assign None if position data is missing

#         standings.append(lap_data_dict)

#     logging.info("Standings data prepared successfully.")
#     return standings

# def getStandingsData(year, circuit, session):
#     logging.info("Fetching standings data for Year: %d, Circuit: %s, Session: %s", year, circuit, session)

#     try:
#         session = fastf1.get_session(year, circuit, session)
#         session.load()  # Load all relevant data
#         logging.info("Data loaded successfully.")
#     except Exception as e:
#         logging.error("Error loading session data: %s", str(e))
#         raise

#     standings = []
    
#     if session.laps.empty:
#         logging.warning("No lap data available for the session.")
#         return standings
    
#     for lap_index, lap_data in session.laps.iterlaps():
#         lap_number = lap_data['LapNumber']
#         lap_data_dict = {"lap": lap_number}
        
#         lap_standings = session.laps[session.laps['LapNumber'] == lap_number]
        
#         for driver_id in lap_standings['Driver'].unique():
#             try:
#                 # Get driver's position at the beginning of the lap, check if available
#                 driver_position = lap_standings.loc[lap_standings['Driver'] == driver_id, 'Position'].values
#                 lap_data_dict[driver_id] = driver_position[0] if len(driver_position) > 0 else None
#             except Exception as e:
#                 logging.warning("Error fetching position for driver %s in lap %d: %s", driver_id, lap_number, str(e))
#                 lap_data_dict[driver_id] = None

#         standings.append(lap_data_dict)

#     logging.info("Standings data prepared successfully.")
#     return standings works

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
    
    if session.laps.empty:
        logging.warning("No lap data available for the session.")
        return standings
    
    for lap_index, lap_data in session.laps.iterlaps():
        lap_number = lap_data['LapNumber']
        lap_data_dict = {"lap": lap_number}
        
        lap_standings = session.laps[session.laps['LapNumber'] == lap_number]
        
        for driver_id in lap_standings['Driver'].unique():
            try:
                # Get driver's position at the beginning of the lap, check if available
                driver_position = lap_standings.loc[lap_standings['Driver'] == driver_id, 'Position'].values
                # Check for NaN or empty values
                lap_data_dict[driver_id] = driver_position[0] if len(driver_position) > 0 and not pd.isna(driver_position[0]) else None
            except Exception as e:
                logging.warning("Error fetching position for driver %s in lap %d: %s", driver_id, lap_number, str(e))
                lap_data_dict[driver_id] = None

        standings.append(lap_data_dict)

    logging.info("Standings data prepared successfully.")
    return standings