import { useEffect, useRef } from "react";
import * as d3 from "d3";

const SingleDriverTrackView = ({ data, driver1, colorAttribute, tooltipRef }) => {
    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800;
        const height = 600;

        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.driver1, (d) => d.X))
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data.driver1, (d) => d.Y))
            .range([height - 50, 50]);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data.driver1, (d) => d[colorAttribute]));

        svg.selectAll("*").remove();

        const lineWidth = 10; // Half the desired line width for proper polygon calculation

        const calculateVertices = (prev, curr, next) => {
            // Get scaled coordinates
            const currPoint = { x: xScale(curr.X), y: yScale(curr.Y) };
            const prevPoint = prev ? { x: xScale(prev.X), y: yScale(prev.Y) } : null;
            const nextPoint = next ? { x: xScale(next.X), y: yScale(next.Y) } : null;

            // Calculate direction vectors
            const vectorPrev = prevPoint
                ? { x: currPoint.x - prevPoint.x, y: currPoint.y - prevPoint.y }
                : null;
            const vectorNext = nextPoint
                ? { x: nextPoint.x - currPoint.x, y: nextPoint.y - currPoint.y }
                : null;

            // Normalize vectors
            const normalize = (v) => {
                const length = Math.sqrt(v.x * v.x + v.y * v.y);
                return { x: v.x / length, y: v.y / length };
            };
            const normPrev = vectorPrev ? normalize(vectorPrev) : null;
            const normNext = vectorNext ? normalize(vectorNext) : null;

            // Calculate perpendicular offsets
            const perp = (v) => ({ x: -v.y, y: v.x });
            const perpPrev = normPrev ? perp(normPrev) : null;
            const perpNext = normNext ? perp(normNext) : null;

            // Calculate bisector
            let bisector;
            if (perpPrev && perpNext) {
                bisector = {
                    x: (perpPrev.x + perpNext.x) / 2,
                    y: (perpPrev.y + perpNext.y) / 2,
                };

                // Normalize bisector
                const bisectorLength = Math.sqrt(bisector.x * bisector.x + bisector.y * bisector.y);
                bisector = { x: bisector.x / bisectorLength, y: bisector.y / bisectorLength };
            } else {
                // Handle start or end cases
                bisector = perpPrev || perpNext;
            }

            // Create polygon vertices
            return [
                { x: currPoint.x + bisector.x * lineWidth, y: currPoint.y + bisector.y * lineWidth },
                { x: currPoint.x - bisector.x * lineWidth, y: currPoint.y - bisector.y * lineWidth },
            ];
        };

        const polygons = [];
        data.driver1.forEach((d, i) => {
            const prev = i > 0 ? data.driver1[i - 1] : null;
            const next = i < data.driver1.length - 1 ? data.driver1[i + 1] : null;

            const vertices = calculateVertices(prev, d, next);

            if (i > 0) {
                // Add polygon from previous vertices to current vertices
                const prevVertices = polygons[polygons.length - 1].slice(-2);
                polygons.push([
                    prevVertices[1],
                    prevVertices[0],
                    vertices[0],
                    vertices[1],
                ]);
            } else {
                // Add initial polygon
                polygons.push(vertices);
            }
        });

        // Draw polygons
        polygons.forEach((polygon, i) => {
            svg.append("polygon")
                .attr("points", polygon.map((v) => `${v.x},${v.y}`).join(" "))
                .attr("fill", colorScale(data.driver1[i][colorAttribute]))
                .attr("stroke", "black") // Optional border for better visibility
                .attr("stroke-width", 0)
                .attr("opacity", 1)
                .on("mouseover", function (event) {
                    d3.select(this).attr("fill", "red");

                    const svgRect = svgRef.current.getBoundingClientRect();

                    tooltip.style("display", "block")
                        .html(
                            `X: ${data.driver1[i].X}<br>Y: ${data.driver1[i].Y}<br>${colorAttribute}: ${data.driver1[i][colorAttribute]}`
                        )
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("fill", colorScale(data.driver1[i][colorAttribute]));
                    tooltip.style("display", "none");
                });
        });
    }, [data, colorAttribute]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default SingleDriverTrackView;
