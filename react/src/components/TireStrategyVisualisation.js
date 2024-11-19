import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import axios from "axios";
import { DEV_URL } from "../shared-resources/constants.js";

const TireStrategyVisualization = () => {
  const raceInfo = useMemo(
    () => ({
      year: 2023,
      circuit: "Australia",
      session: "R",
    }),
    []
  );

  const [tireData, setTireData] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${DEV_URL}/tire-strategy`, {
          params: raceInfo,
        });

        if (response.data.success) {
          setTireData(response.data.tire_strategy);
        } else {
          console.error("Unexpected API response format:", response.data);
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
    console.log("Tire data:", tireData); // Debugging
  
    if (tireData.length === 0) return;
  
    const margin = { top: 50, right: 50, bottom: 50, left: 150 };
    const containerWidth = document.documentElement.clientWidth * 0.8; // 80% of the viewport width
    const barHeight = 20; // Fixed bar height for each row
    const chartHeight = tireData.length * barHeight + margin.top + margin.bottom;
  
    const drivers = Array.from(new Set(tireData.map((d) => d.FullName)));
    const maxLap = d3.max(tireData, (d) => d.EndLap);
  
    console.log("Drivers:", drivers);
    console.log("Max Lap:", maxLap);
  
    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", chartHeight)
  
    // Clear previous elements
    svg.selectAll("*").remove();
  
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Define scales
    const xScale = d3
      .scaleLinear()
      .domain([0, maxLap])
      .range([0, containerWidth - margin.left - margin.right]);
  
    const yScale = d3
      .scaleBand()
      .domain(drivers)
      .range([0, drivers.length * barHeight])
      .padding(0.2);
  
    console.log("xScale domain:", xScale.domain(), "range:", xScale.range());
    console.log("yScale domain:", yScale.domain(), "range:", yScale.range());
  
    // Add bars for tire stints
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
  
      g.append("g")
      .attr("transform", `translate(0, ${drivers.length * barHeight})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat((d) => d))
      .selectAll("text")
      .style("font-size", "12px");
    
    // Add X-axis label ('Lap Number')
    svg.append("text")
      .attr("x", containerWidth / 2) // Centered
      .attr("y", chartHeight + margin.top + 20) // Below the chart
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Lap Number");


    // Add Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .style("font-size", "12px");
  }, [tireData]);


  return (
    <div className="chart-container">
      <h1 style={{ textAlign: "center" }}>
        {`${raceInfo.year} - ${raceInfo.circuit} - ${raceInfo.session}`}
      </h1>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TireStrategyVisualization;
