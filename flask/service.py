import fastf1
from fastf1 import plotting, events
import json

def getSessionData(year, circuit, session):
    session = fastf1.get_session(year, circuit, session)
    res = session.load(telemetry=False, laps=False, weather=False)

    return session.results

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


print(getRaceLapTimesForDrivers(2024, "Monza", "OCO", "GAS"))
# print(getDriversForRace(2021, 1))
# print(getYearRaces(2021))

# print(getRaceLapTimesForDrivers(2021, 1, "GAS", "TSU"))
