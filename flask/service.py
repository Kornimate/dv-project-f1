import fastf1
from fastf1 import plotting, events
import json

def getSessionData(year, circuit, session):
    session = fastf1.get_session(year, circuit, session)
    res = session.load(telemetry=False, laps=False, weather=False)

    return session.results

def getRaceLapTimes(year, circuit, racer_1, racer_2):
    race = fastf1.get_session(year, circuit, "R")
    race.load(telemetry=False, laps=True, weather=False)

    laps_for_racers = []

    for driver in (racer_1, racer_2):
        laps = race.laps.pick_driver(driver).pick_quicklaps().reset_index()
        laps = [{'lap': i, 'lapTime': d.total_seconds()} for i, d in enumerate(list(laps['LapTime']))]
        # print(f"{driver}: {laps}\n")
        laps_for_racers.append({
            'driver': driver,
            'laps': laps
        })
    
    return laps_for_racers

def getDriversForRace(session):
    return plotting.list_driver_names(session)

def getYearRaces(year):
    data = fastf1.get_event_schedule(year)
    print(data.columns)
    return list(data.query("EventFormat != 'testing'")['EventName'])


# getRaceLapTimes(2024, "Monza", "OCO", "GAS")
# print(getDriversForRace(fastf1.get_session(2021,'Hungary','R')))
# print(getYearRaces(2021))
