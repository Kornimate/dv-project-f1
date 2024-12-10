import { useEffect, useRef } from "react";
import * as d3 from "d3";

const SingleDriverTrackView = ({ data, driver1, colorAttribute, tooltipRef }) => {
    const svgRef = useRef();

    const setupSVG = (svg, width, height) => {
        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");
        svg.selectAll("*").remove(); // Clear previous elements
    };

    const createScales = (data, width, height, colorAttribute) => {
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d.X))
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d.Y))
            .range([height - 50, 50]);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data, (d) => d[colorAttribute]));

        return { xScale, yScale, colorScale };
    };

    // Function to smooth data
    const smoothData = (data) => {
        const smoothedData = [];
        for (let i = 1; i < data.length - 1; i++) {
            smoothedData.push({
                ...data[i],
                X: (data[i - 1].X + data[i].X + data[i + 1].X) / 3,
                Y: (data[i - 1].Y + data[i].Y + data[i + 1].Y) / 3,
            });
        }
        return [data[0], ...smoothedData, data[data.length - 1]]; // Keep the first and last points
    };

    const calculateVertices = (prev, curr, next, xScale, yScale, lineWidth) => {
        const getPoint = (point) => point && { x: xScale(point.X), y: yScale(point.Y) };

        const currPoint = getPoint(curr);
        const prevPoint = getPoint(prev);
        const nextPoint = getPoint(next);

        const normalize = (v) => {
            const length = Math.sqrt(v.x * v.x + v.y * v.y);
            return { x: v.x / length, y: v.y / length };
        };

        const perpendicular = (v) => ({ x: -v.y, y: v.x });

        const vectorPrev = prevPoint ? normalize({ x: currPoint.x - prevPoint.x, y: currPoint.y - prevPoint.y }) : null;
        const vectorNext = nextPoint ? normalize({ x: nextPoint.x - currPoint.x, y: nextPoint.y - currPoint.y }) : null;

        let bisector = null;
        if (vectorPrev && vectorNext) {
            const perpPrev = perpendicular(vectorPrev);
            const perpNext = perpendicular(vectorNext);
            bisector = normalize({ x: (perpPrev.x + perpNext.x), y: (perpPrev.y + perpNext.y) });
        } else {
            bisector = vectorPrev ? perpendicular(vectorPrev) : perpendicular(vectorNext);
        }

        return [
            { x: currPoint.x + bisector.x * lineWidth, y: currPoint.y + bisector.y * lineWidth },
            { x: currPoint.x - bisector.x * lineWidth, y: currPoint.y - bisector.y * lineWidth },
        ];
    };

    const generatePolygons = (data, xScale, yScale, lineWidth) => {
        const polygons = [];
        data.forEach((curr, i) => {
            const prev = i > 0 ? data[i - 1] : null;
            const next = i < data.length - 1 ? data[i + 1] : null;

            const vertices = calculateVertices(prev, curr, next, xScale, yScale, lineWidth);

            if (i > 0) {
                const prevVertices = polygons[polygons.length - 1].slice(-2);
                polygons.push([
                    prevVertices[1],
                    prevVertices[0],
                    vertices[0],
                    vertices[1],
                ]);
            } else {
                polygons.push(vertices);
            }
        });

        return polygons;
    };

    const drawPolygons = (svg, polygons, data, colorScale, colorAttribute, tooltip, tooltipRef) => {
        polygons.forEach((polygon, i) => {
            svg.append("polygon")
                .attr("points", polygon.map((v) => `${v.x},${v.y}`).join(" "))
                .attr("fill", colorScale(data[i][colorAttribute]))
                .attr("stroke", "black")
                .attr("stroke-width", 0)
                .attr("opacity", 1)
                .on("mouseover", function (event) {
                    d3.select(this).attr("fill", "red");

                    tooltip.style("display", "block")
                        .html(
                            `${colorAttribute}: ${data[i][colorAttribute]}`
                        )
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("fill", colorScale(data[i][colorAttribute]));
                    tooltip.style("display", "none");
                });
        });
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800;
        const height = 600;
        const lineWidth = 10;

        setupSVG(svg, width, height);

        const smoothedData = smoothData(data.driver1);

        const { xScale, yScale, colorScale } = createScales(smoothedData, width, height, colorAttribute);

        const polygons = generatePolygons(smoothedData, xScale, yScale, lineWidth);

        drawPolygons(svg, polygons, smoothedData, colorScale, colorAttribute, tooltip, tooltipRef);
    }, [data, colorAttribute]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default SingleDriverTrackView;
