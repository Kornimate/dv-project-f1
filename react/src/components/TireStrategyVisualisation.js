import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import axios from "axios";
import { DEV_URL } from "../shared-resources/constants.js";
import { MenuItem, FormControl, Select, InputLabel, CircularProgress } from "@mui/material";


const TireStrategyVisualization = ({ year, race}) => {
  const raceInfo = useMemo(() => ({ year, race, session: 'Race' }), [year, race]);
  const url = useMemo(() => process.env.API_URL || DEV_URL, []);
  const [loading, setLoading] = useState(true);

  const mergeConsecutiveStints = (data) => {
    return data.map((driver) => {
      const mergedStints = [];
      let currentStint = null;
      let cumulativeLap = 0;
  
      driver.Stints.forEach((stint) => {
        const stintStartLap = cumulativeLap + 1; // Calculate the start lap
        const stintEndLap = cumulativeLap + stint.StintLength; // Calculate the end lap
  
        if (currentStint && currentStint.Compound === stint.Compound) {
          // Extend the current stint
          currentStint.StintLength += stint.StintLength;
          currentStint.EndLap = stintEndLap; // Update the end lap
        } else {
          // Push the current stint to the merged list and start a new one
          if (currentStint) mergedStints.push(currentStint);
          currentStint = {
            ...stint,
            StartLap: stintStartLap,
            EndLap: stintEndLap,
          };
        }
  
        cumulativeLap = stintEndLap; // Update cumulative lap count
      });
  
      // Push the last stint
      if (currentStint) mergedStints.push(currentStint);
  
      return {
        ...driver,
        Stints: mergedStints,
      };
    });
  };

  const [tireData, setTireData] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${url}/tire-strategy`, {
          params: raceInfo,
        });

        if (response.data.success) {
          const mergedData = mergeConsecutiveStints(response.data.tire_strategy);
          
        // Calculate the maximum number of laps (total laps in the race)
        const totalLaps = d3.max(
          mergedData.map((driver) =>
            driver.Stints.reduce((acc, stint) => acc + stint.StintLength, 0)
          )
        );

        // Add DNF status to each driver
        const updatedData = mergedData.map((driver) => {
          const totalDriverLaps = driver.Stints.reduce(
            (acc, stint) => acc + stint.StintLength,
            0
          );
          return {
            ...driver,
            DNF: totalDriverLaps < totalLaps, // Driver DNF if total laps are less than race laps
          };
        });
          setTireData(updatedData);
          setLoading(false);
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
    HARD: "#f0f0ec",
    MEDIUM: "#ffd966",
    SOFT: "#da291c",
  };

  useEffect(() => {
    if (tireData.length === 0) return;

    const margin = { top: 20, right: 50, bottom: 50, left: 200 };
    const containerWidth = Math.min(document.documentElement.clientWidth * 0.9, 1200);
    const viewportHeight = window.innerHeight;
    const maxBarHeight = 30;
    const minBarHeight = 20;

    // Dynamically calculate bar height
    const barHeight = Math.min(
      maxBarHeight,
      Math.max(minBarHeight, (viewportHeight - margin.top - margin.bottom) / tireData.length)
    );

    // Chart height with safety margin for X-axis
    const chartHeight = tireData.length * barHeight + margin.top + margin.bottom;

    // Ensure chart does not exceed viewport height
    const adjustedHeight = Math.min(chartHeight, viewportHeight - 20);

    const svg = d3
      .select(svgRef.current)
      .attr("width", containerWidth + margin.left + margin.right)
      .attr("height", viewportHeight);

    // Clear previous elements
    svg.selectAll("*").remove();

    const maxLap = d3.max(tireData, (driver) =>
      d3.sum(driver.Stints, (d) => d.StintLength)
    );
    const drivers = tireData.map((d) => d.Name);

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

    // Draw axes and data
    g.append("g")
      .attr("transform", `translate(0, ${drivers.length * barHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickValues([...d3.range(0, maxLap, 5), maxLap]) // Ensure the last lap is included
          .tickFormat((d) => d)
      )
      .selectAll("text")
      .style("font-size", "12px");

    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll("text")
      .style("font-size", "12px");

    const driverGroups = g
      .selectAll(".driver-group")
      .data(tireData)
      .enter()
      .append("g")
      .attr("class", "driver-group")
      .attr("transform", (d) => `translate(0,${yScale(d.Name)})`);

    driverGroups.each(function (d) {
      let cumulativeLength = 0;
      d3.select(this)
        .selectAll("rect")
        .data(d.Stints)
        .enter()
        .append("rect")
        .attr(
          "x",
          (stint) =>
            xScale((cumulativeLength += stint.StintLength)) -
            xScale(stint.StintLength)
        )
        .attr("y", 0)
        .attr("height", yScale.bandwidth())
        .attr("width", (stint) => xScale(stint.StintLength))
        .attr("fill", (stint) => stint.CompoundColor)
        .attr("stroke", "black")
        .on("mouseover", (event, stint) => {
          d3.select("#tooltip")
            .style("visibility", "visible")
            .html(
              `<strong>Driver:</strong> ${d.Name}<br>
               <strong>Tire:</strong> ${stint.Compound}<br>
               <strong>Length:</strong> ${stint.StintLength} Laps<br>
               <strong>Start Lap:</strong> ${stint.StartLap}<br>
               <strong>End Lap:</strong> ${stint.EndLap}<br>
               <strong>DNF:</strong> ${d.DNF ? "Yes" : "No"}`);
        })
        .on("mousemove", (event) => {
          const tooltip = d3.select("#tooltip");
          const mouseX = event.pageX;
          const mouseY = event.pageY;
          const tooltipWidth = tooltip.node().offsetWidth;

          const adjustedX =
            mouseX + tooltipWidth + 20 > window.innerWidth
              ? mouseX - tooltipWidth - 10
              : mouseX + 10;

          tooltip
            .style("top", `${mouseY - 40}px`)
            .style("left", `${adjustedX}px`);
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("visibility", "hidden");
        });
    });

    
   // Add legend
  const legend = svg
  .append("g")
  .attr(
    "transform",
    `translate(${containerWidth - margin.right + 100}, ${
      (viewportHeight - drivers.length * barHeight) / 2
    })`
  );

  const legendData = Object.entries(compoundColors);

  legend
    .selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (_, i) => `translate(0, ${i * 30})`)
    .each(function ([compound, color]) {
      const legendItem = d3.select(this);

      legendItem
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", color)
        .attr("stroke", "black");

      legendItem
        .append("text")
        .attr("x", 30)
        .attr("y", 15)
        .style("font-size", "14px")
        .text(compound);
    });
  // });

  // useEffect(() => {
  //   drawChart();
  //   window.addEventListener("resize", drawChart);
  //   return () => {
  //     window.removeEventListener("resize", drawChart);
  //   };
}, [tireData]);

  return (
    loading ? 
    <CircularProgress />
    :
    <div className="chart-container" style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
      <div
        id="tooltip"
        style={{
          position: "absolute",
          visibility: "hidden",
          background: "#fff",
          border: "1px solid #ccc",
          padding: "5px",
          borderRadius: "5px",
          pointerEvents: "none",
          fontSize: "12px",
          color: "#000",
          boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
        }}
      ></div>
    </div>
  );
};

export default TireStrategyVisualization;
