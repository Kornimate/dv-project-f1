import React, { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import * as d3 from "d3";
import CircularProgress from '@mui/material/CircularProgress';

const teamColors = {
    "Ferrari": "#F50000",          // Red
    "Mercedes": "#00D2BE",         // Tirqruise
    "Red Bull Racing": "#051EA8",  // Blue
    "McLaren": "#FF8700",          // Orange
    "Alpine": "#F596C8",           // Blue 
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
    "RB": "#2B4562"                // Toro Rosso Blue
};


const formatPosition = (position) => {
    if (position === 1) return "1st";
    if (position === 2) return "2nd";
    if (position === 3) return "3rd";
    return `${position}th`;
};


const RaceStandings = ({ year, circuit}) => {
    const raceInfo = useMemo(() => ({ year, circuit, session: 'Race' }), [year, circuit]);
    const url = useMemo(() => process.env.API_URL || DEV_URL, []);
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAPI = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${url}/f1-standings`, { params: raceInfo });
                console.log("API Response:", response.data);
                setData(formatData(response.data));
            } catch (err) {
                console.error("Fetch error:", err);
                //setError('Failed to fetch standings. Please try again later.');
            } finally {
                setLoading(false); 
            }
        };

        fetchAPI();
    }, [raceInfo, url]); 

    useEffect(() => {
        if (data.length > 0){
            drawChart(data);
        } 

    }, [data]);

    const formatData = (apiData) => {
        const drivers = Object.entries(apiData[0])
            .filter(([key]) => key !== 'lap')
            .sort((a, b) => a[1].position - b[1].position)
            .map(([driverId, driverData]) => ({
                driverId,
                team: driverData.team,
                fullName: driverData.name,
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
        const x = d3.scaleLinear().domain([0, lapCount - 1]).range([0, width]);
        const y = d3.scaleLinear().domain([20, 0]).range([height, 0]);
    
        svg.append("g")
            .attr("transform", `translate(0,0)`)
            .call(d3.axisTop(x).tickValues(d3.range(0, lapCount, 5)).tickFormat(d3.format("d")));
    
        svg.append("g").call(d3.axisLeft(y).ticks(20));
    
        svg.append("text")
            .attr("x", width)
            .attr("y", -40)
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text(`Total Laps: ${lapCount}`);
    
        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "3px")
            .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.15)")
            .style("pointer-events", "none")
            .style("font-size", "12px")
            .style("font-weight", "600")
            .style("visibility", "hidden");
    
        const teamMap = {};
    
        driversData.forEach((driver) => {
            const team = driver.team;
            if (!teamMap[team]) teamMap[team] = [];
            driver.bestPosition = Math.min(...driver.positions.filter(pos => pos !== null));
            const firstLapPosition = driver.positions[0]; 
            const finalPosition = driver.positions[driver.positions.length - 1]; 
            driver.positionChange = firstLapPosition !== null ? firstLapPosition - finalPosition : null; 
            teamMap[team].push(driver);
        });
    
        for (const team in teamMap) {
            const teamDrivers = teamMap[team];
    
            teamDrivers.forEach((driver, index) => {
                const lineStyle = index === 0 ? "0" : "4 2";
    
                const lineData = driver.positions.map((pos, i) => ({
                    lap: i,
                    pos
                }));
    
                const linePath = svg.append("path")
                    .datum(lineData)
                    .attr("fill", "none")
                    .attr("stroke", teamColors[driver.team] || "#000")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", lineStyle)
                    .attr("d", d3.line()
                        .x(d => x(d.lap))
                        .y(d => y(d.pos))
                        .defined(d => d.pos !== null)
                    )
                    .attr("class", `driver-line line-${driver.driverId}`);
    
                const lastLapPosition = driver.positions[driver.positions.length - 1];
                const finalPosition = driver.positions.slice().reverse().find(pos => pos !== null);
                const formattedPosition = formatPosition(finalPosition);
    
                if (lastLapPosition !== null) {
                    svg.append("text")
                        .attr("x", x(lapCount - 1) + 5)
                        .attr("y", y(lastLapPosition))
                        .attr("dy", ".35em")
                        .attr("fill", teamColors[driver.team] || "#000")
                        .text(`${driver.driverId} (${formattedPosition})`)
                        .style("font-size", "10px")
                        .style("font-weight", "600")
                        .style("text-anchor", "start")
                        .on("mouseover", () => {
                            d3.selectAll(".driver-line").style("opacity", 0.06); //Dim all driver lines
                            linePath.style("opacity", 1); //Highlight the hovered line
                            tooltip.style("visibility", "visible").html(
                                `Driver: ${driver.driverId}<br>
                                Team: ${driver.team}<br>
                                Best Position: ${driver.bestPosition}<br>
                                Position Changes (+/-): ${driver.positionChange !== null ? (driver.positionChange > 0 ? `+${driver.positionChange}` : driver.positionChange) : 'N/A'}`
                            );
                        })
                        .on("mousemove", (event) => {
                            tooltip.style("top", (event.pageY + 10) + "px")
                                   .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", () => {
                            d3.selectAll(".driver-line").style("opacity", 1); 
                            tooltip.style("visibility", "hidden"); 
                        });
                }
            });
        }
    };

    return (
        <div>
            <h1>{year} - {circuit} - Race Standings</h1>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {loading ? (
                <CircularProgress />
            ) : (
                <svg id="race-standings-chart"></svg>
            )}
        </div>
    );
};

export default RaceStandings;