import { useEffect, useRef } from "react";
import * as d3 from 'd3';


const LapTimesGraph = ({l1, l2, r1, r2, c1, c2}) => {

    const svgRef = useRef();

    useEffect(() => {

        if(l1.length === 0 || l2.length === 0)
            return;
        
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const offset = 1;

        d3.selectAll("g").remove();

        // Create SVG canvas
        const svg = d3.select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up scales
        const xScale = d3.scaleLinear()
        .domain([0, Math.max(d3.max(l1, d => d.lap), d3.max(l2, d => d.lap))])
        .range([0, width]);

        const yScale = d3.scaleLinear()
        .domain([Math.min(
            d3.min(l1, d => d.lapTime), 
            d3.min(l2, d => d.lapTime)
        ) - offset, Math.max(
            d3.max(l1, d => d.lapTime), 
            d3.max(l2, d => d.lapTime)
        ) + offset])
        .range([height, 0]);

        // Function to format seconds to mm:ss.sss
        function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000); // Get milliseconds
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
        }

        const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`);
        const xAxis = d3.axisBottom(xScale).ticks(Math.max(l1.length, l2.length, ));
        xAxisGroup.call(xAxis);

        xAxisGroup.selectAll(".tick text")
        .attr("dy", function(d) {
            return d % 2 === 0 ? "1.7em" : "0.7em";  // Lower even-numbered labels
        });

        // Create and add y-axis with custom formatting
        const yAxisGroup = svg.append("g");
        const yAxis = d3.axisLeft(yScale).tickFormat(formatTime).ticks(getTicksForYAxis());
        yAxisGroup.call(yAxis);

        // Line generator function for data1
        const line1 = d3.line()
        .x(d => xScale(d.lap))
        .y(d => yScale(d.lapTime));

        // Line generator function for data2
        const line2 = d3.line()
        .x(d => xScale(d.lap))
        .y(d => yScale(d.lapTime));

        // Append initial line for data1
        const path1 = svg.append("path")
        .datum(l1)
        .style("fill", "none")
        .style("stroke", c1)
        .style("stroke-width", "2px")
        .attr("d", line1);

        // Append initial line for data2
        const path2 = svg.append("path")
        .datum(l2)
        .style("fill", "none")
        .style("stroke", c2)
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke-width", "2px")
        .attr("d", line2);

        svg.append("text")
        .attr("class", "label")
        .attr("x", xScale(l1[l1.length-1].lap))
        .attr("y", yScale(l1[l1.length-1].lapTime))
        .attr("dy", "-0.5em")
        .style("fill", c1)
        .text(r1);
      
        svg.append("text")
        .attr("class", "label")
        .attr("x", xScale(l2[l2.length-1].lap))
        .attr("y", yScale(l2[l2.length-1].lapTime))
        .attr("dy", "-0.5em")
        .style("fill", c2)
        .text(r2);

        function getTicksForYAxis(){
            return Math.min((Math.max(d3.max(l1, d => d.lapTime), d3.max(l1, d => d.lapTime)) - Math.min(d3.min(l1, d => d.lapTime), d3.min(l1, d => d.lapTime)))*5, 20);
        }

        function zoomed(event) {
            // Rescale only the y-axis
            const newYScale = event.transform.rescaleY(yScale);
          
            // Update the y-axis with the new y-scale
            yAxisGroup.call(yAxis.scale(newYScale));
          
            // Update the lines with the new y-scale, keeping the x-scale constant
            path1.attr("d", d3.line()
              .x(d => xScale(d.lap))
              .y(d => newYScale(d.lapTime))
            );
            path2.attr("d", d3.line()
              .x(d => xScale(d.lap))
              .y(d => newYScale(d.lapTime))
            );
          }
          
          // Define zoom behavior with constraints
        const zoom = d3.zoom()
        .scaleExtent([1, 2])  // Min and max zoom levels for y-axis
        .translateExtent([[0, 0], [width, height]]) // Limit panning within graph area
        .on("zoom", zoomed);
        
        // Apply zoom behavior to SVG for y-axis only
        svg.call(zoom)
        .on("wheel.zoom", null) // Disable zoom on x-axis
        .on("dblclick.zoom", null);

    }, [l1, l2, r1, r2, c1, c2]);

    return (
        <svg width="700" height="400" ref={svgRef}></svg>
    );
}

export default LapTimesGraph;
