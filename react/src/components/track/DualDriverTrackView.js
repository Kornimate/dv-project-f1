import {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import styles from '../../styles/TrackComponent.module.css';

const DualDriverTrackView = ({ data, driver1, driver2, colorAttribute, tooltipRef, reverseZIndex, showSectors }) => {
    const svgRef = useRef();
    const legendRef = useRef();
    const [selectedSector, setSelectedSector] = useState(null);

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


        const transformedXScale = (x) => xScale(x) * 1.0;
        const transformedYScale = (y) => yScale(y) * 1.0;

        return { transformedXScale, transformedYScale };
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

    const drawPolygons = (svg, polygons, data, lineWidth, transformedXScale, transformedYScale) => {
        const orderedPolygons = reverseZIndex ? [...polygons].reverse() : polygons;

        const lineGenerator = d3.line()
            .x((d) => transformedXScale(d.X))
            .y((d) => transformedYScale(d.Y))
            .curve(d3.curveCatmullRom);

        svg.append("path")
            .datum(data)
            .attr("d", lineGenerator)
            .attr("stroke", "black") // Border color
            .attr("stroke-width", lineWidth + 6) // Slightly wider than the main line
            .attr("fill", "none")
            .attr("opacity", 1);

        svg.append("path")
            .datum(data)
            .attr("d", lineGenerator)
            .attr("stroke", "white") // Border color
            .attr("stroke-width", lineWidth + 2) // Slightly wider than the main line
            .attr("fill", "none")
            .attr("opacity", 1);

        orderedPolygons.forEach((polygon, i) => {
            const dataIndex = reverseZIndex ? polygons.length - 1 - i : i;
            const color =
                data[dataIndex][colorAttribute] > data[dataIndex].otherDriverValue
                    ? "#0571b0"
                    : data[dataIndex][colorAttribute] === data[dataIndex].otherDriverValue
                        ? "#4d4d4d"
                        : "#e66101";

            svg.append("polygon")
                .attr("points", polygon.map((v) => `${v.x},${v.y}`).join(" "))
                .attr("fill", color)
                .attr("stroke", "black")
                .attr("stroke-width", 0)
                .attr("opacity", 0.7)
                .on("mouseover", function (event) {
                    d3.select(this).attr("opacity", 1).attr("stroke-width", 2);

                    const tooltipData = `
                        <div class="${styles.tooltipContent}">
                            <div class="${styles.tooltipColumn}">
                                 <div class="${styles.tooltipHeader}">${driver1}</div>
                                 <div class="${styles.tooltipValue}">${data[dataIndex][colorAttribute]}</div>
                            </div>
                            <div class="${styles.tooltipMiddle}">
                                <div class="${styles.distance}">
                                    Sector ${data[dataIndex].marshal_sector}
                                </div>
                                <div class="${styles.attribute}">${colorAttribute}</div>
                            </div>
                            <div class="${styles.tooltipColumn}">
                                <div class="${styles.tooltipHeader}">${driver2}</div>
                                <div class="${styles.tooltipValue}">${data[dataIndex].otherDriverValue}</div>
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
                    d3.select(this).attr("opacity", 0.7).attr("stroke-width", 0.1);
                    d3.select(tooltipRef.current).style("display", "none");
                });
        });
    };

    const mergePoints = (array1, array2) => {
        const calculateDistance = (p1, p2) => {
            return Math.sqrt(Math.pow(p1.X - p2.X, 2) + Math.pow(p1.Y - p2.Y, 2));
        };

        // Initial comparison to determine the first point in the merged array
        const [a1, a2] = array1.slice(0, 2);
        const [b1, b2] = array2.slice(0, 2);

        const distances = [
            calculateDistance(a1, a2),
            calculateDistance(a1, b2),
            calculateDistance(b1, a2),
            calculateDistance(b1, b2),
        ];

        const maxDistanceIndex = distances.indexOf(Math.max(...distances));
        let mergedArray = [];

        if (maxDistanceIndex === 0 || maxDistanceIndex === 1) {
            mergedArray.push({ ...a1, driver: "driver1", otherDriverValue: b1[colorAttribute] });
        } else {
            mergedArray.push({ ...b1, driver: "driver2" , otherDriverValue: a1[colorAttribute] });
        }

        let i = mergedArray[0].driver === "driver1" ? 1 : 0;
        let j = mergedArray[0].driver === "driver2" ? 1 : 0;

        while (i < array1.length && j < array2.length) {
            const lastPoint = mergedArray[mergedArray.length - 1];

            const distanceToA = i < array1.length ? calculateDistance(lastPoint, array1[i]) : Infinity;
            const distanceToB = j < array2.length ? calculateDistance(lastPoint, array2[j]) : Infinity;

            if (distanceToA <= distanceToB) {
                mergedArray.push({
                    ...array1[i],
                    driver: "driver1",
                    otherDriverValue: array2[j][colorAttribute]
                });
                i++;
            } else {
                mergedArray.push({
                    ...array2[j],
                    driver: "driver2",
                    otherDriverValue: array1[i][colorAttribute]
                });
                j++;
            }
        }
        mergedArray.push(...mergedArray, mergedArray[0])
        return mergedArray;
    };

    const groupByMarshalSector = (data) => {
        const result = [];
        let currentGroup = [];

        for (let i = 0; i < data.length; i++) {
            if (i === 0 || data[i].marshal_sector === data[i - 1].marshal_sector) {
                currentGroup.push(data[i]);
            } else {
                if (data[i - 1].marshal_sector === 17) {
                    console.log(data[i])
                }
                currentGroup.push(data[i]);
                result.push(currentGroup);
                currentGroup = [data[i]];
            }
        }

        if (currentGroup.length > 0) {
            const firstSector = result[0];
            if (currentGroup[0].marshal_sector === firstSector[0].marshal_sector) {
                firstSector.unshift(...currentGroup);
            } else {
                result.push(currentGroup);
            }
        }

        return result;
    };

    const drawTracks = (svg, lineWidth, smoothedData, transformedXScale, transformedYScale) => {
        const lineGenerator = d3.line()
            .x((d) => transformedXScale(d.X))
            .y((d) => transformedYScale(d.Y))
            .curve(d3.curveCatmullRom);

        const orderedData = reverseZIndex ? [...data.driver2].reverse() : data.driver2;
        const groupData = groupByMarshalSector(orderedData);
        groupData.forEach((group, sector) => {
            const driver1AvgSpeed = d3.mean(
                data.driver1.filter((p) => p.marshal_sector === sector + 1),
                (p) => p[colorAttribute]
            );

            const driver2AvgSpeed = d3.mean(
                data.driver2.filter((p) => p.marshal_sector === sector + 1),
                (p) => p[colorAttribute]
            );

            const color =
                driver1AvgSpeed > driver2AvgSpeed
                    ? "#0571b0"
                    : driver1AvgSpeed === driver2AvgSpeed
                        ? "#4d4d4d"
                        : "#e66101";

            svg.append("path")
                .datum(group)
                .attr("d", lineGenerator)
                .attr("stroke", "black") // Border color
                .attr("stroke-width", lineWidth + 6) // Slightly wider than the main line
                .attr("fill", "none")
                .attr("opacity", 1);

            svg.append("path")
                .datum(group)
                .attr("d", lineGenerator)
                .attr("stroke", "white") // Border color
                .attr("stroke-width", lineWidth + 2) // Slightly wider than the main line
                .attr("fill", "none")
                .attr("opacity", 1);

            svg.append("path")
                .datum(group)
                .attr("d", lineGenerator)
                .attr("stroke", color)
                .attr("stroke-width", lineWidth)
                .attr("fill", "none")
                .attr("opacity", 0.7)
                .on("mouseover", function (event) {
                    d3.select(this).attr("opacity", 1);
                    const tooltipData = `
                        <div class="${styles.tooltipContent}">
                            <div class="${styles.tooltipColumn}">
                                 <div class="${styles.tooltipHeader}">${driver1}</div>
                                 <div class="${styles.tooltipValue}">${driver1AvgSpeed.toFixed(2)}</div>
                            </div>
                            <div class="${styles.tooltipMiddle}">
                                <div class="${styles.distance}">
                                    Sector ${sector + 1}
                                </div>
                                <div class="${styles.attribute}">${colorAttribute}</div>
                            </div>
                            <div class="${styles.tooltipColumn}">
                                <div class="${styles.tooltipHeader}">${driver2}</div>
                                <div class="${styles.tooltipValue}">${driver2AvgSpeed.toFixed(2)}</div>
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
                    d3.select(this).attr("opacity", 0.7);
                    d3.select(tooltipRef.current).style("display", "none");
                })
        })
    };

    const addLegend = () => {
        const legendContainer = d3.select(legendRef.current);
        legendContainer.selectAll("*").remove(); // Clear previous legend

        const legendData = [
            { label: driver1, color: "#0571b0" },
            { label: driver2, color: "#e66101" },
            { label: "Equal Performance", color: "#4d4d4d" }
        ];

        const legend = legendContainer
            .selectAll("div")
            .data(legendData)
            .enter()
            .append("div")
            .attr("class", styles.legendItem)
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px");

        legend
            .append("div")
            .style("width", "15px")
            .style("height", "15px")
            .style("background-color", (d) => d.color)
            .style("margin-right", "10px");

        legend
            .append("span")
            .style("font-size", "14px")
            .text((d) => d.label);
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;
        const lineWidth = 10;

        setupSVG(svg, width, height);

        const dualDriverData = mergePoints(data.driver1, data.driver2);
        const smoothedData = smoothData(dualDriverData);

        const { transformedXScale, transformedYScale } = createScales(
            smoothedData,
            width,
            height,
            colorAttribute
        );

        addLegend();

        if (showSectors) {
            drawTracks(svg, 2 * lineWidth, smoothedData, transformedXScale, transformedYScale); // Render tracks
        } else {
            const dualDriverData = mergePoints(data.driver1, data.driver2);
            const smoothedData = smoothData(dualDriverData);

            const polygons = generatePolygons(smoothedData, transformedXScale, transformedYScale, lineWidth);

            drawPolygons(svg, polygons, smoothedData, 2 * lineWidth, transformedXScale, transformedYScale);
        }
    }, [data, colorAttribute, showSectors, selectedSector]);

    return (
        <div style={{position: "relative"}}>
            <svg ref={svgRef} width={800} height={600}/>
            <div ref={legendRef} style={{marginBottom: "10px"}}/>
            <div className={styles.tooltip}
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

export default DualDriverTrackView;
