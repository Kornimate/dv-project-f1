import { useEffect, useState, useMemo, useRef } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import * as d3 from "d3";

const TrackView = () => {

    const svgRef = useRef();
    const tooltipRef = useRef();

    const raceInfo = useMemo(() => {
        return {
            year: 2024,
            circuit: 'Monza',
            session: 'Q',
            driver: 'VER',
        };
    }, []);

    const url = useMemo(() => (process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL), []);

    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [colorAttribute, setColorAttribute] = useState("Speed");
    const [viewType, setViewType] = useState("track");

    useEffect(() => {

        async function fetchAPI() {
            try {
                const response = await axios.get(`${url}/f1-fastest-lap`, {
                    params: raceInfo
                });

                if (response.status !== 200) {
                    setError(`${response.status} - ${response?.data?.message}`);
                }

                setData(JSON.parse(response.data));
            }
            catch {
                setData([]);
            }
        }

        fetchAPI();

        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 1000;
        const height = 800;

        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");

        if (viewType === "track") {
            const xScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.X))
                .range([50, width - 50]);

            const yScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.Y))
                .range([height - 50, 50]);

            const colorScale = d3.scaleSequential(d3.interpolateCool)
                .domain(d3.extent(data, d => d[colorAttribute]));

            svg.selectAll("*").remove();

            data.slice(1).forEach((d, i) => {
                svg.append("line")
                    .attr("x1", xScale(data[i].X))
                    .attr("y1", yScale(data[i].Y))
                    .attr("x2", xScale(d.X))
                    .attr("y2", yScale(d.Y))
                    .attr("stroke", colorScale(d[colorAttribute]))
                    .attr("stroke-width", 10)
                    .attr("fill", "none")
                    .attr("opacity", 0.7)
                    .on("mouseover", function (event) {
                        d3.select(this)
                            .attr("stroke-width", 15)
                            .attr("opacity", 1)
                            .attr("stroke", "white");

                        const svgRect = svgRef.current.getBoundingClientRect();

                        tooltip.style("display", "block")
                            .html(`Z: ${d.Z}<br>Speed: ${d.Speed} km/h`)
                            .style("left", `${svgRect.left + xScale(d.X) + 20}px`)
                            .style("top", `${svgRect.top + yScale(d.Y) + 30}px`);
                        svg.append("line")
                            .attr("x1", xScale(d.X))
                            .attr("y1", yScale(d.Y) + 5)
                            .attr("x2", xScale(d.X) + 20)
                            .attr("y2", yScale(d.Y) + 30)
                            .attr("stroke", "black")
                            .attr("stroke-dasharray", "2 2")
                            .attr("class", "tooltip-line"); // Assign class for easy removal
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                            .attr("stroke-width", 10)
                            .attr("opacity", 0.7)
                            .attr("stroke", colorScale(d[colorAttribute]));

                        svg.selectAll(".tooltip-line").remove();

                        tooltip.style("display", "none");
                    });
            });
        } else if (viewType === "line") {
            const timeScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.SessionTime))
                .range([50, width - 50]);

            const valueScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d[colorAttribute]))
                .range([height - 50, 50]);

            const line = d3.line()
                .x(d => timeScale(d.SessionTime))
                .y(d => valueScale(d[colorAttribute]))
                .curve(d3.curveMonotoneX);

            svg.selectAll("*").remove();

            // X Axis
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(timeScale).ticks(10))
                .append("text")
                .attr("x", width / 2)
                .attr("y", 40)
                .attr("fill", "black")
                .style("font-size", "14px")
                .text("Session Time");

            // Y Axis
            svg.append("g")
                .attr("transform", `translate(0)`)
                .call(d3.axisLeft(valueScale).ticks(10))
                .append("text")
                .attr("x", -height / 2)
                .attr("y", -40)
                .attr("transform", "rotate(-90)")
                .attr("fill", "black")
                .style("font-size", "14px")
                .text(colorAttribute);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", line);
        }
    }, [data, colorAttribute, viewType]);

    const handleColorAttributeChange = (e) => {
        setColorAttribute(e.target.value);
    };

    const toggleViewType = () => {
        setViewType(prev => (prev === "track" ? "line" : "track"));
    };

    return (
        <>
            <button onClick={toggleViewType}>
                Switch to {viewType === "track" ? "Line Chart" : "Track View"}
            </button>
            <select onChange={handleColorAttributeChange} value={colorAttribute}>
                <option value="Speed">Speed (km/h)</option>
                <option value="RPM">RPM</option>
                <option value="nGear">Gear Number</option>
                <option value="Throttle">Throttle Pressure (%)</option>
                <option value="Brake">Brake Applied (boolean)</option>
                <option value="DRS">DRS Status</option>
            </select>
            <svg ref={svgRef} width={800} height={600}/>
            <div
                ref={tooltipRef}
                style={{
                    position: "absolute",
                    backgroundColor: "white",
                    border: "1px solid black",
                    padding: "5px",
                    display: "none",
                    pointerEvents: "none",
                    fontSize: "12px"
                }}
            />
        </>
    );
};

export default TrackView;
