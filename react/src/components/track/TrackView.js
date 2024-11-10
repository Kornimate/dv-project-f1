import { useEffect, useRef } from "react";
import * as d3 from 'd3';

const TrackView = ({ data, colorAttribute, tooltipRef, comparisonMode }) => {
    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800;
        const height = 600;

        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.driver1, d => d.X))
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data.driver1, d => d.Y))
            .range([height - 50, 50]);

        const colorScale1 = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data.driver1, d => d[colorAttribute]));

        const colorScale2 = d3.scaleSequential(d3.interpolateCividis)
            .domain(d3.extent(data.driver2, d => d[colorAttribute]));

        svg.selectAll("*").remove();

        if (comparisonMode) {
            data.driver1.slice(1).forEach((d, i) => {
                const d2 = data.driver2[i];
                const driver1Value = d[colorAttribute];
                const driver2Value = d2 ? d2[colorAttribute] : null;

                const isEqual = driver2Value !== null && driver1Value === driver2Value;

                svg.append("line")
                    .attr("x1", xScale(data.driver1[i].X))
                    .attr("y1", yScale(data.driver1[i].Y))
                    .attr("x2", xScale(d.X))
                    .attr("y2", yScale(d.Y))
                    .attr("stroke", isEqual ? "gray" : driver2Value !== null && driver1Value > driver2Value ? "steelblue" : "orange")
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
                            .html(`X: ${d.X}<br>Y: ${d.Y}<br>${colorAttribute}: ${driver1Value} vs ${driver2Value}`)
                            .style("left", `${svgRect.left + xScale(d.X) + 20}px`)
                            .style("top", `${svgRect.top + yScale(d.Y) + 30}px`);
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                            .attr("stroke-width", 10)
                            .attr("opacity", 0.7)
                            .attr("stroke", isEqual ? "gray" : driver2Value !== null && driver1Value > driver2Value ? "steelblue" : "orange")

                        tooltip.style("display", "none");
                    });
            });
        } else {
            data.driver1.slice(1).forEach((d, i) => {
                svg.append("line")
                    .attr("x1", xScale(data.driver1[i].X))
                    .attr("y1", yScale(data.driver1[i].Y))
                    .attr("x2", xScale(d.X))
                    .attr("y2", yScale(d.Y))
                    .attr("stroke", colorScale1(d[colorAttribute]))
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
                            .html(`X: ${d.X}<br>Y: ${d.Y}<br>${colorAttribute}: ${d[colorAttribute]}`)
                            .style("left", `${svgRect.left + xScale(d.X) + 20}px`)
                            .style("top", `${svgRect.top + yScale(d.Y) + 30}px`);
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                            .attr("stroke-width", 10)
                            .attr("opacity", 0.7)
                            .attr("stroke", colorScale1(d[colorAttribute]));

                        tooltip.style("display", "none");
                    });
            });
        }
    }, [data, colorAttribute, comparisonMode]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default TrackView;
