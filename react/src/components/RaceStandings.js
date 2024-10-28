import React, { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import * as d3 from "d3";


// const RaceStandings = () => {
//     const raceInfo = useMemo(() => ({
//         year: 2023,
//         circuit: 'Monza',
//         session: 'R'
//     }), []);

//     const url = useMemo(() => (
//         process.env.API_URL || DEV_URL
//     ), []);

//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         async function fetchAPI() {
//             try {
//                 const response = await axios.get(`${url}/f1-standings`, { params: raceInfo });
//                 console.log(response.data); 

//                 if (response.status !== 200) {
//                     setError(`${response.status} - ${response?.data?.message}`);
//                     return; 
//                 }

//                 setData(response.data); 

//             } catch (err) {
//                 setError('Failed to fetch standings. Please try again later.');
//                 console.error(err); 
//                 setData([]);
//             }
//         }

//         fetchAPI();
//     }, [raceInfo, url]);

//     return (
//         <div>
//             <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
//             {error && <div style={{ color: "red" }}>{error}</div>}
            
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Lap</th>
//                         <th>Driver</th>
//                         <th>Position</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((lapData) => (
//                         <React.Fragment key={lapData.lap}>
//                             {Object.entries(lapData).filter(([key]) => key !== 'lap').map(([driverId, position]) => (
//                                 <tr key={`${lapData.lap}-${driverId}`}>
//                                     <td>{lapData.lap}</td>
//                                     <td>{driverId}</td>
//                                     <td>{position}</td>
//                                 </tr>
//                             ))}
//                         </React.Fragment>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default RaceStandings;   works

// const RaceStandings = () => {
//     const raceInfo = useMemo(() => ({
//         year: 2024,
//         circuit: 'Monza',
//         session: 'R'
//     }), []);

//     const url = useMemo(() => (
//         process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL
//     ), []);

//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');
//     const [isFetching, setIsFetching] = useState(true);
//     const finalLap = 53; // Set the final lap of the race here

//     useEffect(() => {
//         async function fetchAPI() {
//             if (!isFetching) return;  // Prevent further fetch calls if final lap data is retrieved

//             try {
//                 const response = await axios.get(`${url}/f1-standings`, { params: raceInfo });
//                 console.log(response.data);

//                 if (response.status !== 200) {
//                     setError(`${response.status} - ${response?.data?.message}`);
//                     return;
//                 }

//                 setData((prevData) => {
//                     const newData = response.data.filter(
//                         newLap => !prevData.some(lap => lap.lap === newLap.lap)
//                     );
//                     const updatedData = [...prevData, ...newData];

//                     // Check if the final lap is reached in the updated data
//                     if (updatedData.some(lap => lap.lap === finalLap)) {
//                         setIsFetching(false);  // Stop further fetching once the final lap is reached
//                     }

//                     return updatedData;
//                 });

//             } catch (err) {
//                 setError('Failed to fetch standings. Please try again later.');
//                 console.error(err);
//             }
//         }

//         fetchAPI();
//     }, [isFetching, raceInfo, url]);

//     return (
//         <div>
//             <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
//             <div style={{ color: "red" }}>{error}</div>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Lap</th>
//                         {data.length > 0 && Object.keys(data[0]).filter(key => key !== 'lap').map(driver => (
//                             <th key={driver}>{driver}</th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((lapData) => (
//                         <tr key={lapData.lap}>
//                             <td>{lapData.lap}</td>
//                             {Object.entries(lapData).filter(([key]) => key !== 'lap').map(([driverId, position]) => (
//                                 <td key={driverId}>{position}</td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default RaceStandings; this


// const RaceStandings = () => {
//     const raceInfo = useMemo(() => ({
//         year: 2024, 
//         circuit: 'Monza',
//         session: 'R'
//     }), []);

//     const url = useMemo(() => (
//         process.env.API_URL || DEV_URL
//     ), []);

//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');
//     const [isFetching, setIsFetching] = useState(true);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         const fetchAPI = async () => {
//             if (!isFetching) return;

//             setLoading(true);

//             try {
//                 const response = await axios.get(`${url}/f1-standings`, { params: raceInfo });
//                 console.log('Response Data:', response.data);

//                 if (response.status !== 200) {
//                     setError(`Error ${response.status}: ${response.data?.message || 'Fetching data failed.'}`);
//                     return;
//                 }

//                 let normalizedData = [];

//                 // Normalize the response data
//                 if (Array.isArray(response.data)) {
//                     // If it's an array, we can use it directly
//                     normalizedData = response.data;
//                 } else if (typeof response.data === 'object') {
//                     // If it's an object (2024 format), convert it to an array
//                     if (response.data.lap !== undefined) {
//                         normalizedData.push(response.data); // Push single lap data as an array item
//                     } else {
//                         // Process as lap data with lap as a separate property
//                         const lapNumber = Object.keys(response.data).includes("lap") ? response.data.lap : null;
//                         if (lapNumber !== null) {
//                             normalizedData.push({
//                                 lap: lapNumber,
//                                 ...response.data // Spread the driver positions into the object
//                             });
//                         }
//                     }
//                 } else {
//                     console.error('Unexpected response format:', response.data);
//                     setError('Unexpected response format. Please check the API response.');
//                     return;
//                 }

//                 const newData = normalizedData.filter(newLap => {
//                     const isAllNaN = Object.entries(newLap).every(([key, value]) => {
//                         return key === 'lap' || isNaN(value);
//                     });

//                     return !isAllNaN && !data.some(lap => lap.lap === newLap.lap);
//                 });

//                 setData(prevData => {
//                     const updatedData = [...prevData, ...newData];

//                     const finalLap = Math.max(...updatedData.map(lap => lap.lap));
//                     if (finalLap >= 52) {
//                         console.log('Final lap reached. No more fetching.');
//                         setIsFetching(false);
//                     }

//                     return updatedData;
//                 });
//             } catch (err) {
//                 console.error('API Error:', err);
//                 setError('Failed to fetch standings. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAPI();
//     }, [isFetching, raceInfo, url, data]);

//     return (
//         <div>
//             <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
//             {error && <div style={{ color: "red" }}>{error}</div>}

//             <table>
//                 <thead>
//                     <tr>
//                         <th>Lap</th>
//                         <th>Driver</th>
//                         <th>Position</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((lapData) => (
//                         <React.Fragment key={lapData.lap}>
//                             {Object.entries(lapData).filter(([key]) => key !== 'lap').map(([driverId, position]) => (
//                                 <tr key={`${lapData.lap}-${driverId}`}>
//                                     <td>{lapData.lap}</td>
//                                     <td>{driverId}</td>
//                                     <td>{position}</td>
//                                 </tr>
//                             ))}
//                         </React.Fragment>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default RaceStandings;

const RaceStandings = () => {
    const raceInfo = useMemo(() => ({
        year: 2024, 
        circuit: 'Monza',
        session: 'R'
    }), []);

    const url = useMemo(() => (
        process.env.API_URL || DEV_URL
    ), []);

    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [isFetching, setIsFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAPI = async () => {
            if (!isFetching) return;

            setLoading(true);

            try {
                const response = await axios.get(`${url}/f1-standings`, { params: raceInfo });
                console.log('Response Data:', response.data);

                if (response.status !== 200) {
                    setError(`Error ${response.status}: ${response.data?.message || 'Fetching data failed.'}`);
                    return;
                }

                let normalizedData = [];

                // Normalize the response data
                if (Array.isArray(response.data)) {
                    normalizedData = response.data; // Directly use if it's already an array
                } else if (typeof response.data === 'object') {
                    if (response.data.lap !== undefined) {
                        normalizedData.push(response.data); // Push single lap data as an array item
                    } else {
                        const lapNumber = Object.keys(response.data).includes("lap") ? response.data.lap : null;
                        if (lapNumber !== null) {
                            normalizedData.push({
                                lap: lapNumber,
                                ...response.data // Spread driver data into the object
                            });
                        }
                    }
                } else {
                    console.error('Unexpected response format:', response.data);
                    setError('Unexpected response format. Please check the API response.');
                    return;
                }

                const newData = normalizedData.filter(newLap => {
                    const isAllNaN = Object.entries(newLap).every(([key, value]) => {
                        return key === 'lap' || (value.position === null && value.team === "Unknown Team");
                    });

                    return !isAllNaN && !data.some(lap => lap.lap === newLap.lap);
                });

                setData(prevData => {
                    const updatedData = [...prevData, ...newData];

                    const finalLap = Math.max(...updatedData.map(lap => lap.lap));
                    if (finalLap >= 52) {
                        console.log('Final lap reached. No more fetching.');
                        setIsFetching(false);
                    }

                    return updatedData;
                });
            } catch (err) {
                console.error('API Error:', err);
                setError('Failed to fetch standings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAPI();
    }, [isFetching, raceInfo, url, data]);

    return (
        <div>
            <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}

            <table>
                <thead>
                    <tr>
                        <th>Lap</th>
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Position</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((lapData) => (
                        <React.Fragment key={lapData.lap}>
                            {Object.entries(lapData).filter(([key]) => key !== 'lap').map(([driverId, details]) => (
                                <tr key={`${lapData.lap}-${driverId}`}>
                                    <td>{lapData.lap}</td>
                                    <td>{driverId}</td>
                                    <td>{details.team}</td>  {/* Display the team */}
                                    <td>{details.position}</td> {/* Display the position */}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RaceStandings;