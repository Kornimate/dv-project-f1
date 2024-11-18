import fastf1

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