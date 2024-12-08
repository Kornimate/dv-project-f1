import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";

const ComparisonTrackView = ({ data, driver1, driver2, colorAttribute, tooltipRef }) => {
    const svgRef = useRef();
    const [viewMode, setViewMode] = useState("track");
    const [selectedSectorPoints, setSelectedSectorPoints] = useState([]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        const width = 800;
        const height = 600;

        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");
        svg.selectAll("*").remove();

        // Calculate the global extents for consistent proportions
        const xExtent = d3.extent(data.driver1, (d) => d.X);
        const yExtent = d3.extent(data.driver1, (d) => d.Y);

        // Scales for X and Y, based on the full track proportions
        const xScale = d3.scaleLinear().domain(xExtent).range([50, width - 50]);
        const yScale = d3.scaleLinear().domain(yExtent).range([height - 50, 50]);

        const lineGenerator = d3.line()
            .x((d) => xScale(d.X))
            .y((d) => yScale(d.Y))
            .curve(d3.curveCatmullRom);

        const lineWidth = 10;

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

        const groupedData = d3.group(data.driver1, (d) => d.marshal_sector);

        if (groupedData.has(1)) {
            const firstSectorPoints = groupedData.get(1);
            const maxDistance = d3.max(firstSectorPoints, (p) => p.Distance);

            const normalizeDistance = (point) =>
                point.Distance > maxDistance * 0.9 ? point.Distance - maxDistance : point.Distance;

            groupedData.set(
                1,
                [...firstSectorPoints].sort((a, b) => normalizeDistance(a) - normalizeDistance(b))
            );
        }

        const sectorPointsMap = new Map();

        const sectors = Array.from(groupedData.keys()).sort((a, b) => a - b);

        sectors.forEach((sectorNumber, index) => {
            const points = groupedData.get(sectorNumber) || [];
            const prevSectorNumber = sectors[index - 1] || sectors[sectors.length - 1];
            const nextSectorNumber = sectors[index + 1] || sectors[0];

            // Get last point of the previous sector
            const prevSectorPoints = groupedData.get(prevSectorNumber);
            const lastPointOfPrevSector = prevSectorPoints ? prevSectorPoints[prevSectorPoints.length - 1] : null;

            // Get first point of the next sector
            const nextSectorPoints = groupedData.get(nextSectorNumber);
            const firstPointOfNextSector = nextSectorPoints ? nextSectorPoints[0] : null;

            // Add the continuity points
            const updatedSectorPoints = [
                ...(lastPointOfPrevSector ? [lastPointOfPrevSector] : []),
                ...points,
            ];

            sectorPointsMap.set(sectorNumber, updatedSectorPoints);
        });

        sectorPointsMap.forEach((points, sector) => {
            const isSelectedSector = selectedSectorPoints.length > 0 && selectedSectorPoints[1].marshal_sector === sector;

            const driver1AvgSpeed = d3.mean(
                data.driver1.filter((p) => p.marshal_sector === sector),
                (p) => p[colorAttribute]
            );

            const driver2AvgSpeed = d3.mean(
                data.driver2.filter((p) => p.marshal_sector === sector),
                (p) => p[colorAttribute]
            );

            const fasterDriver = driver1AvgSpeed > driver2AvgSpeed ? "driver1" : "driver2";

            if (!isSelectedSector && viewMode === "track") {
                // Render the selected sector in its original color
                svg.append("path")
                    .datum(points)
                    .attr("d", lineGenerator)
                    .attr("stroke", "black")
                    .attr("stroke-width", 20)
                    .attr("fill", "none")
                    .attr("opacity", 1);

                svg.append("path")
                    .datum(points)
                    .attr("d", lineGenerator)
                    .attr("stroke", fasterDriver === "driver1" ? "blue" : "red")
                    .attr("stroke-width", 15)
                    .attr("fill", "none")
                    .attr("opacity", 0.7)
                    .on("click", () => {
                        setViewMode("sector");
                        setSelectedSectorPoints(points);
                    })
                    .on("mouseover", function (event) {
                        d3.select(this).attr("opacity", 1);

                        tooltip.style("display", "block")
                            .html(
                                `<p>Marshal Sector: ${sector}</p>
                             <p>${driver1} Avg Speed: ${driver1AvgSpeed.toFixed(2)} km/h</p>
                             <p>${driver2} Avg Speed: ${driver2AvgSpeed.toFixed(2)} km/h</p>`
                            )
                            .style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY + 10}px`);
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("opacity", 0.7).attr("stroke-width", 15);
                        tooltip.style("display", "none");
                    });
            } else {
                svg.append("path")
                    .datum(points)
                    .attr("d", lineGenerator)
                    .attr("stroke", "black")
                    .attr("stroke-width", 20)
                    .attr("fill", "none")
                    .attr("opacity", 1);

                svg.append("path")
                    .datum(points)
                    .attr("d", lineGenerator)
                    .attr("stroke", "grey")
                    .attr("stroke-width", 15)
                    .attr("fill", "none")
                    .attr("opacity", 0.5)
                    .on("dblclick", () => {
                        setViewMode("sector");
                        setSelectedSectorPoints(points);
                    })
                    .on("mouseover", function (event) {
                        d3.select(this).attr("opacity", 1)
                        tooltip.style("display", "block")
                            .html(
                                `<p>Marshal Sector: ${sector}</p>
                                <p>${driver1} Avg Speed: ${driver1AvgSpeed.toFixed(2)} km/h</p>
                                <p>${driver2} Avg Speed: ${driver2AvgSpeed.toFixed(2)} km/h</p>`
                            )
                            .style("left", `${event.pageX + 10}px`)
                            .style("top", `${event.pageY + 10}px`);
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("opacity", 0.5)
                        tooltip.style("display", "none");
                    });
            }
        });
        if (viewMode === "sector") {
            // Get the marshal sector of the selected points
            const selectedSector = selectedSectorPoints.length > 0 ? selectedSectorPoints[1].marshal_sector : null;

            // Filter `driver2` data to only include the same marshal sector as the selected sector
            const filteredDriver2Data = data.driver2.filter((p) => p.marshal_sector === selectedSector);

            // Zoomed-in view for a single sector
            let i = 0,
                j = 0; // Pointers for driver1 and driver2
            let currentPoint = { x: selectedSectorPoints[0].X, y: selectedSectorPoints[0].Y }; // Starting point

            console.log(selectedSectorPoints.length, filteredDriver2Data.length)
            const polygons = [];
            const prevPoint = null;

            while (i < selectedSectorPoints.length && j < filteredDriver2Data.length) {
                const point1 = selectedSectorPoints[i];
                const point2 = filteredDriver2Data[j];

                const distance1 = Math.hypot(currentPoint.x - point1.X, currentPoint.y - point1.Y);
                const distance2 = Math.hypot(currentPoint.x - point2.X, currentPoint.y - point2.Y);
                console.log(i, j, distance1, distance2);

                // Determine which driver is closer
                const closerDriver = distance1 <= distance2 ? "driver1" : "driver2";
                const nextPoint = closerDriver === "driver1" ? point1 : point2;
                const otherPoint = closerDriver === "driver2" ? point1 : point2;

                const vertices = calculateVertices(prevPoint, currentPoint, nextPoint);

                console.log(vertices);

                // Determine the other driver's current point

                // Compare values of the chosen category
                const value1 =
                    closerDriver === "driver1" ? point1[colorAttribute] : point2[colorAttribute];
                const value2 =
                    closerDriver === "driver1" ? point2[colorAttribute] : point1[colorAttribute];
                const fasterDriver = value1 > value2 ? "driver1" : "driver2";

                // Draw the segment
                svg.append("line")
                    .attr("x1", xScale(currentPoint.x))
                    .attr("y1", yScale(currentPoint.y))
                    .attr("x2", xScale(nextPoint.X))
                    .attr("y2", yScale(nextPoint.Y))
                    .attr("stroke", "black") // Border color
                    .attr("stroke-width", 20) // Slightly larger than the main line
                    .attr("fill", "none")
                    .attr("opacity", 1)

                svg.append("line")
                    .attr("x1", xScale(currentPoint.x))
                    .attr("y1", yScale(currentPoint.y))
                    .attr("x2", xScale(nextPoint.X))
                    .attr("y2", yScale(nextPoint.Y))
                    .attr("stroke", fasterDriver === "driver1" ? "blue" : "red")
                    .attr("stroke-width", 15)
                    .attr("opacity", 0.7)
                    .on("mouseover", function (event) {
                        d3.select(this).attr("opacity", 1);

                        const svgRect = svgRef.current.getBoundingClientRect();

                        tooltip.style("display", "block")
                            .html(
                                `<table>
                                    <thead>
                                        <tr><th>Attribute</th><th>${driver1} ${i}</th><th>${driver2} ${j}</th></tr>
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
                        d3.select(this).attr("opacity", 0.7);
                        tooltip.style("display", "none");
                    })
                    .on("dblclick", function () {
                        setViewMode("track");
                        setSelectedSectorPoints([]);
                    });

                // Move the pointer for the closer driver
                if (closerDriver === "driver1") {
                    i++;
                } else {
                    j++;
                }

                // Update the current point
                currentPoint = {x: nextPoint.X, y: nextPoint.Y};
            }
        }
    }, [data, colorAttribute, viewMode, selectedSectorPoints]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default ComparisonTrackView;
