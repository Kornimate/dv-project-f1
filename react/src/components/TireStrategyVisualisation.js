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
    // console.log("Tire data:", tireData); // Debugging
  
    if (tireData.length === 0) return;
  
    const margin = { top: 50, right: 50, bottom: 50, left: 150 };
    const containerWidth = document.documentElement.clientWidth * 0.8; // 80% of the viewport width
    const barHeight = 20; // Fixed bar height for each row
    const chartHeight = tireData.length * barHeight + margin.top + margin.bottom;
  
    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", chartHeight)
  
    // Clear previous elements
    svg.selectAll("*").remove();

    const maxLap = d3.max(tireData, (driver) => d3.sum(driver.Stints, (d) => d.StintLength))
    const drivers = tireData.map((d) => d.Name)
  
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

    // Draw bars
    const driverGroups = svg.selectAll(".driver-group")
      .data(tireData)
      .enter()
      .append("g")
      .attr("class", "driver-group")
      .attr("transform", d => `translate(${margin.left},${yScale(d.Name)  + margin.top})`);

    driverGroups.each(function (d) {
        let cumulativeLength = 0;
        d3.select(this)
            .selectAll("rect")
            .data(d.Stints)
            .enter()
            .append("rect")
            .attr("x", stint => xScale(cumulativeLength += stint.StintLength) - xScale(stint.StintLength))
            .attr("y", 0)
            .attr("height", yScale.bandwidth())
            .attr("width", stint => xScale(stint.StintLength))
            .attr("fill", stint => stint.CompoundColor);
    });
  
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
