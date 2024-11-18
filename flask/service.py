import fastf1


def getSessionData(year, circuit, session):
    session = fastf1.get_session(year, circuit, session)
    res = session.load(telemetry=False, laps=False, weather=False)
    return session.results

def get_fastest_lap(year, circuit, session, driver):
    session = fastf1.get_session(year, circuit, session)
    session.load(weather=False)
    data = session.laps.pick_driver(driver).pick_fastest().get_telemetry()
    data.add_distance()
    return data
