import fastf1
import fastf1.plotting as f1_plt

def getSessionData(year, circuit, session):
    """
    Loads session data for a given year, circuit, and session type.
    Returns session results.
    """
    session = fastf1.get_session(year, circuit, session)
    session.load(telemetry=False, laps=False, weather=False)
    return session.results

def getTireStrategyData2(year, circuit, session_type):
    session = fastf1.get_session(year, circuit, session_type)
    session.load(telemetry=False, laps=True, weather=False)

    drivers = [session.get_driver(driver)[["Abbreviation","FullName"]] for driver in session.drivers]

    stints = session.laps[["Driver", "Stint", "Compound", "LapNumber"]]
    stints = stints.groupby(["Driver", "Stint", "Compound"])
    stints = stints.count().reset_index()
    stints = stints.rename(columns={"LapNumber": "StintLength"})
    stints["CompoundColor"] = stints.apply(lambda row: f1_plt.get_compound_color(row.Compound, session), axis=1)

    stints_by_driver_list = []

    for driver in drivers:
        current_driver_data = { 'Name': driver["FullName"] }

        driver_stints = stints.loc[stints["Driver"] == driver["Abbreviation"]]
        current_driver_data["Stints"] = driver_stints[["StintLength","CompoundColor", "Compound"]].to_dict(orient='records')

        stints_by_driver_list.append(current_driver_data)

    return stints_by_driver_list
