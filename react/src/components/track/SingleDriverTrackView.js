import { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "../../styles/TrackComponent.module.css";

const SingleDriverTrackView = ({ data, driver1, colorAttribute, tooltipRef, reverseZIndex }) => {
    const svgRef = useRef();

    const setupSVG = (svg, width, height) => {
        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");
        svg.selectAll("*").remove(); // Clear previous elements
    };

    const createScales = (data, width, height, colorAttribute) => {
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d.X))
            .range([50, width - 50])
            .nice()
            .interpolate(d3.interpolateNumber);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, (d) => d.Y))
            .range([height - 50, 50])
            .nice()
            .interpolate(d3.interpolateNumber);

        const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain(d3.extent(data, (d) => d[colorAttribute]));

        const transformedXScale = (x) => xScale(x) * 1.0;
        const transformedYScale = (y) => yScale(y) * 1.0;

        return { transformedXScale, transformedYScale, colorScale };
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

    const drawPolygons = (svg, polygons, data, colorScale, colorAttribute, tooltip, tooltipRef, lineWidth, transformedXScale, transformedYScale) => {
        const orderedPolygons = reverseZIndex ? [...polygons].reverse() : polygons;

        const lineGenerator = d3.line()
            .x((d) => transformedXScale(d.X))
            .y((d) => transformedYScale(d.Y))
            .curve(d3.curveCatmullRom);

        svg.append("path")
            .datum(data)
            .attr("d", lineGenerator)
            .attr("stroke", "black") // Border color
            .attr("stroke-width", 2 * lineWidth + 6) // Slightly wider than the main line
            .attr("fill", "none")
            .attr("opacity", 1);

        svg.append("path")
            .datum(data)
            .attr("d", lineGenerator)
            .attr("stroke", "white") // Border color
            .attr("stroke-width", 2 * lineWidth + 2) // Slightly wider than the main line
            .attr("fill", "none")
            .attr("opacity", 1);

        orderedPolygons.forEach((polygon, i) => {
            const dataIndex = reverseZIndex ? polygons.length - 1 - i : i;
            svg.append("polygon")
                .attr("points", polygon.map((v) => `${v.x},${v.y}`).join(" "))
                .attr("fill", colorScale(data[dataIndex][colorAttribute]))
                .attr("stroke", "black")
                .attr("stroke-width", 0.1)
                .attr("opacity", 1)
                .on("mouseover", function (event) {
                    d3.select(this).attr("opacity", 1).attr("stroke-width", 2);

                    const tooltipData = `
                        <div class="${styles.tooltipContent}">
                            <div class="${styles.tooltipMiddle}">
                                <div class="${styles.distance}">
                                    ${parseFloat(data[dataIndex]['Distance']).toFixed(2)} m (Sector ${data[dataIndex].marshal_sector})
                                </div>
                                <div class="${styles.attribute}">${colorAttribute}</div>
                            </div>
                            <div class="${styles.tooltipColumn}">
                                 <div class="${styles.tooltipHeader}">${driver1}</div>
                                 <div class="${styles.tooltipValue}">${data[dataIndex][colorAttribute]}</div>
                            </div>
                        </div>
                    `;

                    const svgRect = svgRef.current.getBoundingClientRect(); // Get SVG bounding box
                    const tooltipX = event.clientX - svgRect.left + 30; // Adjust X position relative to SVG
                    const tooltipY = event.clientY - svgRect.top + 30; // Adjust Y position relative to SVG


                    d3.select(tooltipRef.current)
                        .style("display", "block")
                        .style("left", `${tooltipX}px`) // Use adjusted X position
                        .style("top", `${tooltipY}px`) // Use adjusted Y position
                        .html(tooltipData);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("opacity", 1).attr("stroke-width", 0.1);
                    d3.select(tooltipRef.current).style("display", "none");
                });
        });
    };

    const addLegend = (svg, colorScale, colorAttribute, width, height) => {
        const legendGroup = svg.append("g").attr("class", "legend");
        const legendWidth = 20;
        const legendHeight = 300;
        const legendX = width - 50; // Right side of the SVG
        const legendY = (height - legendHeight) / 2;

        const gradientId = "color-gradient";

        // Define gradient for legend
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", gradientId)
            .attr("x1", "0%")
            .attr("y1", "100%") // Top to bottom gradient
            .attr("x2", "0%")
            .attr("y2", "0%");

        const colorDomain = colorScale.domain();
        const numStops = 10;
        const stops = d3.range(numStops).map((i) => ({
            offset: `${(i / (numStops - 1)) * 100}%`,
            color: colorScale(colorDomain[0] + ((colorDomain[1] - colorDomain[0]) * i) / (numStops - 1)),
        }));

        stops.forEach((stop) => {
            linearGradient.append("stop")
                .attr("offset", stop.offset)
                .attr("stop-color", stop.color);
        });

        // Draw border around the legend
        legendGroup.append("rect")
            .attr("x", legendX - 5)
            .attr("y", legendY - 5)
            .attr("width", legendWidth + 10)
            .attr("height", legendHeight + 10)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", 1);

        // Draw legend rectangle
        legendGroup.append("rect")
            .attr("x", legendX)
            .attr("y", legendY)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", `url(#${gradientId})`);

        // Add labels for legend
        legendGroup.append("text")
            .attr("x", legendX + legendWidth + 10)
            .attr("y", legendY)
            .text(colorDomain[1].toFixed(2))
            .style("dominant-baseline", "middle")
            .style("text-anchor", "start");

        legendGroup.append("text")
            .attr("x", legendX + legendWidth + 10)
            .attr("y", legendY + legendHeight)
            .text(colorDomain[0].toFixed(2))
            .style("dominant-baseline", "middle")
            .style("text-anchor", "start");

        legendGroup.append("text")
            .attr("x", legendX + legendWidth + 10)
            .attr("y", legendY + legendHeight / 2)
            .text(colorAttribute)
            .style("dominant-baseline", "middle")
            .style("text-anchor", "start")
            .style("font-weight", "bold");
    };


    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800;
        const height = 600;
        const lineWidth = 10;

        setupSVG(svg, width, height);

        const smoothedData = smoothData(data.driver1);

        // Correctly destructure the returned scale names
        const { transformedXScale, transformedYScale, colorScale } = createScales(
            smoothedData,
            width,
            height,
            colorAttribute
        );

        // Pass the correct scales to the generatePolygons function
        const polygons = generatePolygons(smoothedData, transformedXScale, transformedYScale, lineWidth);

        drawPolygons(svg, polygons, smoothedData, colorScale, colorAttribute, tooltip, tooltipRef, lineWidth, transformedXScale, transformedYScale);
        addLegend(svg, colorScale, colorAttribute, width, height);
        }, [data, colorAttribute]);

    return (
        <div style={{ position: "relative" }}>
            <svg ref={svgRef} width={800} height={600} />
            <div className={styles.tooltipSingle}
                 ref={tooltipRef}
                 style={{
                     position: "absolute",
                     display: "none",
                     pointerEvents: "none",
                 }}
            />
        </div>
    );
};

export default SingleDriverTrackView;
