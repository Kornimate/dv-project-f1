import { useEffect, useRef } from "react";
import * as d3 from "d3";

const TrackVisualization = ({ data, colorAttribute, svgRef, tooltipRef }) => {
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800, height = 600;

        // Set up SVG properties
        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");

        // Remove previous drawings
        svg.selectAll("*").remove();

        // Render track visualization
        renderTrackView(svg, tooltip, width, height);
    }, [data, colorAttribute, svgRef, tooltipRef]);

    const renderTrackView = (svg, tooltip, width, height) => {
        // Scales for positioning
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.X))
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Y))
            .range([height - 50, 50]);

        const colorScale = d3.scaleSequential(d3.interpolateCool)
            .domain(d3.extent(data, d => d[colorAttribute]));

        // Create path generator with smoothing for continuous line
        const lineGenerator = d3.line()
            .x(d => xScale(d.X))
            .y(d => yScale(d.Y))
            .curve(d3.curveCatmullRom.alpha(0.5)); // Smooth interpolation

        // Create gradient definitions for each segment
        const defs = svg.append("defs");

        data.slice(1).forEach((d, i) => {
            const gradientId = `gradient-${i}`;
            const gradient = defs.append("linearGradient")
                .attr("id", gradientId)
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", xScale(data[i].X))
                .attr("y1", yScale(data[i].Y))
                .attr("x2", xScale(d.X))
                .attr("y2", yScale(d.Y));

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorScale(data[i][colorAttribute]));

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorScale(d[colorAttribute]));

            svg.append("path")
                .datum([data[i], d])
                .attr("d", lineGenerator)
                .attr("stroke", `url(#${gradientId})`)
                .attr("stroke-width", 20)
                .attr("fill", "none")
                .attr("opacity", 0.7)
                .on("mouseover", function (event) {
                    handleMouseOver(event, d, d3.select(tooltipRef.current), xScale, yScale);
                    d3.select(this).attr("stroke", "black").attr("opacity", 1);
                })
                .on("mouseout", function () {
                    handleMouseOut(d3.select(tooltipRef.current));
                    d3.select(this).attr("stroke", `url(#${gradientId})`).attr("opacity", 0.7);
                });
        });
    };

    const handleMouseOver = (event, d, tooltip, xScale, yScale) => {
        const svgRect = svgRef.current.getBoundingClientRect();
        tooltip.style("display", "block")
            .html(`Speed: ${d.Speed} km/h<br>RPM: ${d.RPM} rpm<br>Gear Number: ${d.nGear}<br>Throttle Pressure: ${d.Throttle}%<br>Brake Applied: ${d.Brake}`)
            .style("left", `${svgRect.left + xScale(d.X) + 20}px`)
            .style("top", `${svgRect.top + yScale(d.Y) + 30}px`);
    };

    const handleMouseOut = (tooltip) => {
        tooltip.style("display", "none");
    };

    return null;
};

export default TrackVisualization;
