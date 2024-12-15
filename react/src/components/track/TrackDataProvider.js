import { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../../shared-resources/constants.js";
import { assignMarshalSectorsByDistance } from "../../utils/telemetryUtils";

const TrackDataProvider = ({ raceInfo, driver1, driver2, lap1, lap2, fastest, children }) => {
    const url = useMemo(() => (process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL), []);

    const [data, setData] = useState({
        driver1: '',
        driver2: '',
        trackInfo: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const getDriverLapUrl = (driver, lap) =>
                    fastest
                        ? `${url}/f1-fastest-lap`
                        : `${url}/f1-lap`;

                const getDriverLapParams = (driver, lap) =>
                    fastest
                        ? {...raceInfo, driver}
                        : {...raceInfo, driver, lap};

                const requests = [
                    await axios.get(getDriverLapUrl(driver1, lap1), {
                        params: getDriverLapParams(driver1, lap1),
                    }),
                    await axios.get(getDriverLapUrl(driver2, lap2), {
                        params: getDriverLapParams(driver2, lap2),
                    }),
                    await axios.get(`${url}/track-info`, {params: {...raceInfo}}),
                ];

                const [response1, response2, response3] = await Promise.all(requests);

                if (
                    response1.status === 200 &&
                    response2.status === 200 &&
                    response3.status === 200
                ) {
                    const trackInfo = JSON.parse(response3.data);

                    const processedDriver1 = assignMarshalSectorsByDistance(
                        JSON.parse(response1.data),
                        trackInfo
                    );
                    const processedDriver2 = assignMarshalSectorsByDistance(
                        JSON.parse(response2.data),
                        trackInfo
                    );

                    setData({
                        driver1: processedDriver1,
                        driver2: processedDriver2,
                        trackInfo: trackInfo,
                    });
                } else {
                    setError(
                        `Error fetching data: Driver1(${response1.status}), Driver2(${response2.status}), Track(${response3.status})`
                    );
                }
            } catch (error) {
                setError(`Failed to fetch data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData()
    }, [raceInfo, driver1, driver2, url, lap1, lap2, fastest]);

    return children({ data, error, loading, setData });
};

export default TrackDataProvider;