import { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../../shared-resources/constants.js";
import { assignMarshalSectorsByDistance } from "../../utils/telemetryUtils";

const TrackDataProvider = ({ raceInfo, driver1, driver2, colorAttribute, children }) => {
    const url = useMemo(() => (process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL), []);

    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response1 = await axios.get(`${url}/f1-fastest-lap`, {
                    params: { ...raceInfo, driver: driver1 }
                });

                const response2 = await axios.get(`${url}/f1-fastest-lap`, {
                    params: { ...raceInfo, driver: driver2 }
                });

                const response3 = await axios.get(`${url}/track-info`, {
                    params: { ...raceInfo}
                });

                if (response1.status === 200 && response2.status === 200) {

                    const processedDriver1 = assignMarshalSectorsByDistance(
                        JSON.parse(response1.data),
                        JSON.parse(response3.data)
                    );
                    const processedDriver2 = assignMarshalSectorsByDistance(
                        JSON.parse(response2.data),
                        JSON.parse(response3.data)
                    );

                    setData({
                        driver1: processedDriver1,
                        driver2: processedDriver2,
                        trackInfo: JSON.parse(response3.data),
                    });
                } else {
                    setError(`Error fetching data: ${response1.status} - ${response2.status}`);
                }
            } catch (error) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData()
    }, [raceInfo, driver1, driver2, url]);

    return children({ data, error, loading, colorAttribute, setData });
};

export default TrackDataProvider;