import { useEffect, useRef } from "react";
import * as d3 from 'd3';

const ComparisonTrackView = ({ data, driver1, driver2, colorAttribute, tooltipRef }) => {
    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800;
        const height = 600;

        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");

        // Scales for X and Y
        const xScale = d3.scaleLinear()
            .domain(d3.extent([...data.driver1, ...data.driver2], d => d.X))
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent([...data.driver1, ...data.driver2], d => d.Y))
            .range([height - 50, 50]);

        // Clear the SVG
        svg.selectAll("*").remove();

        let i = 0, j = 0; // Pointers for driver1 and driver2
        let currentPoint = { x: data.driver1[0].X, y: data.driver1[0].Y }; // Starting point

        while (i < data.driver1.length && j < data.driver2.length) {
            const point1 = data.driver1[i];
            const point2 = data.driver2[j];

            const distance1 = Math.hypot(currentPoint.x - point1.X, currentPoint.y - point1.Y);
            const distance2 = Math.hypot(currentPoint.x - point2.X, currentPoint.y - point2.Y);

            // Determine which driver is closer
            const closerDriver = distance1 <= distance2 ? 'driver1' : 'driver2';
            const nextPoint = closerDriver === 'driver1' ? point1 : point2;

            // Determine the other driver's current point
            const otherPoint = closerDriver === 'driver1' ? point2 : point1;

            // Compare values of the chosen category
            const value1 = closerDriver === 'driver1' ? point1[colorAttribute] : point2[colorAttribute];
            const value2 = closerDriver === 'driver1' ? point2[colorAttribute] : point1[colorAttribute];
            const fasterDriver = value1 > value2 ? 'driver1' : 'driver2';

            // Draw the segment
            svg.append("line")
                .attr("x1", xScale(currentPoint.x))
                .attr("y1", yScale(currentPoint.y))
                .attr("x2", xScale(nextPoint.X))
                .attr("y2", yScale(nextPoint.Y))
                .attr("stroke", fasterDriver === 'driver1' ? "blue" : "red")
                .attr("stroke-width", 10)
                .attr("opacity", 0.7)
                .on("mouseover", function (event) {
                    d3.select(this).attr("stroke-width", 15).attr("opacity", 1);

                    const svgRect = svgRef.current.getBoundingClientRect();

                    tooltip.style("display", "block")
                        .html(
                            `<table>
                                <thead>
                                    <tr><th>Attribute</th><th>${driver1}</th><th>${driver2}</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>X</td><td>${nextPoint.X}</td><td>${otherPoint.X}</td></tr>
                                    <tr><td>Y</td><td>${nextPoint.Y}</td><td>${otherPoint.Y}</td></tr>
                                    <tr><td>${colorAttribute}</td><td>${value1}</td><td>${value2}</td></tr>
                                </tbody>
                            </table>`
                        )
                        .style("left", `${svgRect.left + xScale(nextPoint.X) + 20}px`)
                        .style("top", `${svgRect.top + yScale(nextPoint.Y) + 30}px`);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke-width", 10).attr("opacity", 0.7);
                    tooltip.style("display", "none");
                });

            // Move the pointer for the closer driver
            if (closerDriver === 'driver1') {
                i++;
            } else {
                j++;
            }

            // Update the current point
            currentPoint = { x: nextPoint.X, y: nextPoint.Y };
        }
    }, [data, colorAttribute]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default ComparisonTrackView;
