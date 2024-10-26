import { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import * as d3 from "d3";

const RaceStandings = () => {
    const raceInfo = useMemo(() => ({
        year: 2024,
        circuit: 'Monza',
        session: 'R'
    }), []);

    const url = useMemo(() => (
        process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL
    ), []);

    const [data, setData] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchAPI() {
            try {
                const response = await axios.get(`${url}/f1-standings`, {
                    params: raceInfo
                });
                console.log(response.data); 

                if (response.status !== 200) {
                    setError(`${response.status} - ${response?.data?.message}`);
                    return; 
                }

                setData(response.data); 

            } catch (err) {
                setError('Failed to fetch standings. Please try again later.');
                console.error(err); 
                setData([]);
            }
        }

        fetchAPI();
    }, [raceInfo, url]);

    return (
        <div>
            <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
            <div style={{ color: "red" }}>
                {error}
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Lap</th>
                        <th>Driver</th>
                        <th>Position</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((lapData) => (
                            <tr key={lapData.lap}>
                                <td>{lapData.lap}</td>
                                {Object.entries(lapData).filter(([key]) => key !== 'lap').map(([driverId, position]) => (
                                    <td key={driverId}>{position}</td>
                                ))}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
};

export default RaceStandings;