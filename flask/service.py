import fastf1
import json
import logging
import pandas as pd
import os
import fastf1.plotting as plotting

def getStandingsData(year, circuit, session_type):
    """
    Fetch and return the standings data for a given F1 race session.
    Includes debugging to verify race selection and data loading.

    Args:
        year (int): The year of the race season.
        circuit (str): The circuit name or event name.
        session_type (str): The session type ('R' for Race, 'Q' for Qualifying, etc.).

    Returns:
        list: A list of standings data for each lap and final results.
    """
    logging.info("Fetching standings data for Year: %d, Circuit: %s, Session: %s", year, circuit, session_type)
    print(f"Input Parameters - Year: {year}, Circuit: {circuit}, Session: {session_type}")
    
    try:
        # Load the session
        session = fastf1.get_session(year, circuit, session_type)
        print(f"Loaded Event: {session.event['EventName']}, Date: {session.date}")
        session.load(telemetry=False, laps=True, weather=False)
        logging.info("Data loaded successfully.")
    except Exception as e:
        logging.error("Error loading session data: %s", str(e))
        raise

    standings = []
    processed_laps = set()

    # Debug: Check if laps are available
    if session.laps.empty:
        logging.warning("No lap data available for the session.")
        print(f"No lap data available for {year} {circuit} ({session_type}).")
        return standings

    # Debug: Calculate and print total laps
    total_laps = session.laps['LapNumber'].max()
    print(f"Total laps for {year} {circuit} ({session_type}): {total_laps}")

    # Retrieve all drivers
    all_drivers = session.laps['Driver'].unique()

    # Grid positions from results
    grid_positions = {
        result.Abbreviation: result.GridPosition
        for result in session.results.itertuples()
    }

    # Add initial grid positions to standings
    lap_data_dict = {"lap": 0}
    for driver_id in all_drivers:
        team_name = session.results.loc[session.results['Abbreviation'] == driver_id, 'TeamName'].values[0]
        lap_data_dict[driver_id] = {
            "position": grid_positions.get(driver_id, None),
            "team": team_name
        }
    standings.append(lap_data_dict)

    # Process lap data
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
    
    # Add final standings
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

def getTireStrategyData2(year, circuit, session_type):
    session = fastf1.get_session(year, circuit, session_type)
    session.load(telemetry=False, laps=True, weather=False)

    drivers = [session.get_driver(driver)[["Abbreviation","FullName"]] for driver in session.drivers]

    stints = session.laps[["Driver", "Stint", "Compound", "LapNumber"]]
    stints = stints.groupby(["Driver", "Stint", "Compound"])
    stints = stints.count().reset_index()
    stints = stints.rename(columns={"LapNumber": "StintLength"})
    stints["CompoundColor"] = stints.apply(lambda row: plotting.get_compound_color(row.Compound, session), axis=1)

    stints_by_driver_list = []

    for driver in drivers:
        current_driver_data = { 'Name': driver["FullName"] }

        driver_stints = stints.loc[stints["Driver"] == driver["Abbreviation"]]
        current_driver_data["Stints"] = driver_stints[["StintLength","CompoundColor", "Compound"]].to_dict(orient='records')

        stints_by_driver_list.append(current_driver_data)

    return stints_by_driver_list

def getRaceLapTimesForDrivers(year, race_number, racer_1, racer_2):
    race = fastf1.get_session(year, race_number, 'R')
    race.load(telemetry=False, laps=True, weather=False)

    laps_for_racers = []

    for driver in (racer_1, racer_2):
        laps = race.laps.pick_driver(driver).pick_quicklaps().reset_index()
        laps = [{'lap': i, 'lapTime': d['LapTime'].total_seconds(), 'lapNumber': int(d['LapNumber'])} for i, d in enumerate(list(laps[['LapTime','LapNumber']].to_dict(orient='records')))]
        laps_for_racers.append({
            'driver': driver,
            'color': plotting.get_driver_color(driver, race),
            'laps': laps
        })
    
    return laps_for_racers

def getDriversForRace(year, race_number):
    session = fastf1.get_session(year=year, gp=race_number, identifier='R')
    names = plotting.list_driver_names(session)
    abbrs = plotting.list_driver_abbreviations(session)
    
    if len(names) != len(abbrs):
        raise IndexError("collections not the same size")
    
    return [{'name': names[i], 'abbr' : abbrs[i]} for i in range(len(names))]

def getRacesForYear(year):
    data = fastf1.get_event_schedule(year)
    return list(data.query("EventFormat != 'testing'")['EventName'])

