import React, { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import * as d3 from "d3";

// const RaceStandings = () => {   no vis
//     const raceInfo = useMemo(() => ({
//         year: 2023, 
//         circuit: 'Monaco',
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

//                 const normalizedData = Array.isArray(response.data) ? response.data : [response.data];
//                 setData(normalizedData);

//                 setIsFetching(false);  // Stop fetching once all laps and final results are loaded
//             } catch (err) {
//                 console.error('API Error:', err);
//                 setError('Failed to fetch standings. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAPI();
//     }, [isFetching, raceInfo, url]);

//     return (
//         <div>
//             <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
//             {error && <div style={{ color: "red" }}>{error}</div>}

//             <table>
//                 <thead>
//                     <tr>
//                         <th>Lap</th>
//                         <th>Driver</th>
//                         <th>Team</th>
//                         <th>Position</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((lapData, index) => (
//                         <React.Fragment key={lapData.lap}>
//                             {Object.entries(lapData).filter(([key]) => key !== 'lap').map(([driverId, details]) => (
//                                 <tr key={`${lapData.lap}-${driverId}`} style={lapData.lap === "Final Results" ? { fontWeight: "bold" } : {}}>
//                                     <td>{lapData.lap}</td>
//                                     <td>{driverId}</td>
//                                     <td>{details.team}</td>
//                                     <td>{details.position}</td>
//                                 </tr>
//                             ))}
//                         </React.Fragment>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default RaceStandings; no vis

const teamColors = {
    "Ferrari": "#F50000",          // Red
    "Mercedes": "#00D2BE",         // Teal
    "Red Bull Racing": "#051EA8",  // Blue
    "McLaren": "#FF8700",          // Papaya orange
    "Alpine": "#F596C8",           // Blue d
    "Aston Martin": "#006F62",     // Dark green 
    "Williams": "#005AFF",         // Blue
    "AlphaTauri": "#2B4562",       // Dark blue
    "Alfa Romeo": "#900000",       // Dark red
    "Alfa Romeo Racing": "#900000",// Dark red
    "Kick Sauber": "#00FF1E",      // Glowing Green
    "Sauber": "#900000",           // Dark red
    "Haas F1 Team": "#B6BABD",     // Grey
    "Racing Point": "#F596C8",     // Pink
    "Renault": "#FFF500",          // Yellow 
    "Toro Rosso": "#2B4562",       // Blue 
    "RB": "#2B4562"                //Toro Rosso
};


const formatPosition = (position) => {
    if (position === 1) return "1st";
    if (position === 2) return "2nd";
    if (position === 3) return "3rd";
    return `${position}th`;
};

const RaceStandings = () => {
    const raceInfo = useMemo(() => ({ year: 2024, circuit: 'Bahrain', session: 'R' }), []);
    const url = useMemo(() => process.env.API_URL || DEV_URL, []);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const fetchAPI = async () => {
            if (!isFetching) return;

            try {
                const response = await axios.get(`${url}/f1-standings`, { params: raceInfo });
                console.log("API Response:", response.data);
                setData(formatData(response.data));
                setIsFetching(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setError('Failed to fetch standings. Please try again later.');
                setIsFetching(false);
            }
        };

        fetchAPI();
    }, [isFetching, raceInfo, url]);

    useEffect(() => {
        if (data.length > 0) drawChart(data);
    }, [data]);

    const formatData = (apiData) => {
        const drivers = Object.entries(apiData[0])
            .filter(([key]) => key !== 'lap')
            .sort((a, b) => a[1].position - b[1].position)
            .map(([driverId, driverData]) => ({
                driverId,
                team: driverData.team,
                positions: apiData.map(lap => lap[driverId]?.position || null)
            }));

        const groupedDrivers = drivers.reduce((acc, driver) => {
            acc[driver.team] = acc[driver.team] || [];
            acc[driver.team].push(driver);
            return acc;
        }, {});

        return Object.values(groupedDrivers).flat();
    };

    const drawChart = (driversData) => {
        const svgWidth = 800, svgHeight = 400, margin = { top: 60, right: 30, bottom: 20, left: 50 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        d3.select("#race-standings-chart").selectAll("*").remove();

        const svg = d3.select("#race-standings-chart")
            .attr("width", svgWidth + 50)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const lapCount = driversData[0].positions.length;
        const x = d3.scaleLinear().domain([0, lapCount]).range([0, width]);
        const y = d3.scaleLinear().domain([20, 0]).range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,0)`)
            .call(d3.axisTop(x).ticks(lapCount).tickFormat(d3.format("d")));

        svg.append("g").call(d3.axisLeft(y).ticks(20));

        const teamMap = {};

        driversData.forEach((driver) => {
            const team = driver.team;
            if (!teamMap[team]) teamMap[team] = [];

            teamMap[team].push(driver);
        });

        for (const team in teamMap) {
            const teamDrivers = teamMap[team];

            teamDrivers.forEach((driver, index) => {
                const lineStyle = index === 0 ? "0" : "4 2";

                const lineData = driver.positions.map((pos, i) => ({
                    lap: i + 1,
                    pos
                }));

                svg.append("path")
                    .datum(lineData)
                    .attr("fill", "none")
                    .attr("stroke", teamColors[driver.team] || "#000")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", lineStyle)
                    .attr("d", d3.line()
                        .x(d => x(d.lap))
                        .y(d => y(d.pos))
                        .defined(d => d.pos !== null)
                    );

                const lastLapPosition = driver.positions[driver.positions.length - 1];
                const finalPosition = driver.positions.slice().reverse().find(pos => pos !== null);
                const formattedPosition = formatPosition(finalPosition);

                if (lastLapPosition !== null) {
                    svg.append("text")
                        .attr("x", x(lapCount) + 5)
                        .attr("y", y(lastLapPosition))
                        .attr("dy", ".35em")
                        .attr("fill", teamColors[driver.team] || "#000")
                        .text(`${driver.driverId} (${formattedPosition})`)
                        .style("font-size", "10px")
                        .style("text-anchor", "start");
                }
            });
        }
    };

    return (
        <div>
            <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session} Standings</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <svg id="race-standings-chart"></svg>
        </div>
    );
};

export default RaceStandings;