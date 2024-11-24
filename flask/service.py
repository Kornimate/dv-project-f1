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


def getTireStrategyData(year, circuit, session_type):
    """
    Retrieves and processes tire strategy data for a given session.
    This function identifies tire stints and returns the processed data.
    """
    try:
        # Load session data
        session = fastf1.get_session(year, circuit, session_type)
        session.load()

        # Extract lap data with tire compounds
        laps = session.laps[["Driver", "LapNumber", "Compound"]]
        laps = laps.sort_values(["Driver", "LapNumber"]).copy()  # Avoid SettingWithCopyWarning

        # Forward-fill and backfill missing compounds for each driver
        laps["Compound"] = laps.groupby("Driver")["Compound"].ffill().bfill()

        # Identify new stints as changes in tire compound
        laps["Is_New_Stint"] = (laps["Compound"] != laps["Compound"].shift()).cumsum()

        # Group by driver and stint to determine stint ranges
        driver_stints = laps.groupby(["Driver", "Is_New_Stint", "Compound"]).agg(
            StartLap=("LapNumber", "min"),
            EndLap=("LapNumber", "max")
        ).reset_index()

        # Format data for frontend consumption
        data = []
        for driver_code in driver_stints["Driver"].unique():
            driver_data = session.get_driver(driver_code)
            full_name = driver_data.get("FullName", "Unknown Driver")
            abbreviation = driver_data.get("Abbreviation", driver_code)

            driver_stint_data = driver_stints[driver_stints["Driver"] == driver_code]
            for _, row in driver_stint_data.iterrows():
                data.append({
                    "Driver": abbreviation,
                    "FullName": full_name,
                    "Compound": row["Compound"],
                    "StartLap": row["StartLap"],
                    "EndLap": row["EndLap"]
                })

        return data

    except Exception as e:
        print(f"Error while processing tire strategy data: {e}")
        return {"error": str(e)}
    
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
        current_driver_data["Stints"] = driver_stints[["StintLength","CompoundColor"]].to_dict(orient='records')

        stints_by_driver_list.append(current_driver_data)

    return stints_by_driver_list
