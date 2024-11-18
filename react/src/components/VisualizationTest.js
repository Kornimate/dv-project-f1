import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import axios from "axios";
import { DEV_URL } from "../shared-resources/constants.js";

const VisualizationTest = () => {
  const raceInfo = useMemo(() => ({
    year: 2023,
    circuit: "Australia",
    session: "R",
  }), []);

  const [tireData, setTireData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${DEV_URL}/tire-strategy`, {
          params: raceInfo,
        });

        console.log(response)
      
        if (response.data.success && Array.isArray(response.data.dataset)) {
          setTireData(response.data.dataset);
        } else {
          console.error("Unexpected API response format: ", response.data.dataset);
        }
      } catch (error) {
        console.error("Error fetching tire data:", error);
      }
    }
    fetchData();
  }, [raceInfo]);

  const compoundColors = {
    HARD: "#e3e3de",
    MEDIUM: "#ffd966",
    SOFT: "#ff3333",
  };

  useEffect(() => {
    if (tireData.length === 0) return;

    const margin = { top: 20, right: 50, bottom: 50, left: 150 };
    const containerWidth = Math.min(window.innerWidth - 100, 1200); // Responsive width
    const height = tireData.length * 20 + margin.top + margin.bottom; // Compact height

    const drivers = Array.from(new Set(tireData.map((d) => d.FullName)));
    const maxLap = d3.max(tireData, (d) => d.EndLap);

    const width = Math.min(containerWidth, maxLap * 20); // Scale with lap count

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, maxLap]).range([0, width]);
    const yScale = d3
      .scaleBand()
      .domain(drivers)
      .range([0, height - margin.top - margin.bottom])

    // Add the bars
    g.selectAll(".bar")
      .data(tireData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.StartLap))
      .attr("y", (d) => yScale(d.FullName))
      .attr("width", (d) => xScale(d.EndLap) - xScale(d.StartLap))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => compoundColors[d.Compound] || "#ddd")
      .attr("stroke", "black");

    // Add Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .attr("font-size", "10px");

    // Add X-axis
    g.append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat((d) => `Lap ${d}`))
      .selectAll("text")
      .attr("font-size", "10px");
  }, [tireData]);

  return (
    <div className="chart-container">
      <h1 style={{ textAlign: "center" }}>{`${raceInfo.year} - ${raceInfo.circuit} - ${raceInfo.session}`}</h1>
      <div ref={chartRef}></div>
    </div>
  );
};

export default VisualizationTest;
