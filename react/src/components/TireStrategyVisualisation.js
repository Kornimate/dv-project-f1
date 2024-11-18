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
    if (tireData.length === 0) return;

    const margin = { top: 50, right: 50, bottom: 50, left: 150 };
    const containerWidth = 1000;
    const width = containerWidth - margin.left - margin.right;
    const height = tireData.length * 20 + margin.top + margin.bottom;

    const drivers = Array.from(new Set(tireData.map((d) => d.FullName)));
    const maxLap = d3.max(tireData, (d) => d.EndLap);

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, maxLap]).range([0, width]);
    const yScale = d3
      .scaleBand()
      .domain(drivers)
      .range([0, height - margin.top - margin.bottom])
      .padding(0.1);

    // Clear previous chart
    svg.selectAll("*").remove();

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

    // Add X-axis
    g.append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll("text")
      .style("font-size", "12px");

    // Add Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale))
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
