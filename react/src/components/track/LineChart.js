import * as d3 from "d3";
import { useEffect, useRef } from "react";
import styles from '../../styles/TrackComponent.module.css';

const LineChart = ({ data, driver1, driver2, colorAttribute, tooltipRef }) => {
    const svgRef = useRef();

    const setupSVG = (svg, width, height, margin) => {
        svg.selectAll("*").remove();

        svg.append("defs")
            .append("clipPath")
            .attr("id", "chart-clip")
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);
    };

    const createScales = (data, width, height, margin, colorAttribute) => {
        const distanceScale = d3.scaleLinear()
            .domain(d3.extent([...data.driver1, ...data.driver2], d => d.Distance))
            .range([margin.left, width - margin.right]);

        const valueScale = d3.scaleLinear()
            .domain(d3.extent([...data.driver1, ...data.driver2], d => d[colorAttribute]))
            .range([height - margin.bottom, margin.top]);

        return { distanceScale, valueScale };
    };

    const createAxes = (svg, distanceScale, valueScale, height, width, margin) => {
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(distanceScale).ticks(10));

        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(valueScale).ticks(10));

        // Add X-axis label
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", (margin.left + width - margin.right) / 2)
            .attr("y", height - 10)
            .style("font-size", "14px")
            .text("Distance (meters)");

        // Add Y-axis label
        // Add Y-axis label
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", -(height / 2))
            .attr("y", 15)
            .attr("transform", "rotate(-90)")
            .style("font-size", "14px")
            .text(colorAttribute + (
                colorAttribute === 'Speed' ? ' (km/h)'
                    : colorAttribute === 'Throttle' ? ' (%)' : ''));
    };

    const drawLine = (svg, data, line, color, className) => {
        svg.append("path")
            .datum(data)
            .attr("class", className)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("clip-path", "url(#chart-clip)")
            .attr("d", line);
    };

    const addLegend = (svg, driver1, driver2, colors, width, margin) => {
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${margin.left}, ${margin.top - 30})`);

        // Driver 1 legend
        legend.append("rect")
            .attr("x", width - margin.right - 150)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colors.driver1);

        legend.append("text")
            .attr("x", width - margin.right - 130)
            .attr("y", 12)
            .style("font-size", "12px")
            .text(driver1);

        // Driver 2 legend
        legend.append("rect")
            .attr("x", width - margin.right - 150)
            .attr("y", 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colors.driver2);

        legend.append("text")
            .attr("x", width - margin.right - 130)
            .attr("y", 32)
            .style("font-size", "12px")
            .text(driver2);
    };

    const interpolateData = (data, xValue, xAccessor, yAccessor) => {
        const bisect = d3.bisector(xAccessor).left;
        const index = bisect(data, xValue);
        const leftPoint = data[index - 1];
        const rightPoint = data[index];

        if (!leftPoint || !rightPoint) return null;

        const t = (xValue - xAccessor(leftPoint)) / (xAccessor(rightPoint) - xAccessor(leftPoint));
        return {
            x: xValue,
            y: yAccessor(leftPoint) + t * (yAccessor(rightPoint) - yAccessor(leftPoint))
        };
    };

    const addTooltip = (svg, width, margin) => {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("opacity", 0);

        return tooltip;
    };

    const addMovingPoints = (svg, data, scales, colors, tooltip, margin, width, height) => {
        const { distanceScale, valueScale } = scales;

        const movingPoints = svg.append("g").attr("class", "moving-points");

        const driver1Point = movingPoints.append("circle")
            .attr("r", 5)
            .attr("fill", colors.driver1);

        const driver2Point = movingPoints.append("circle")
            .attr("r", 5)
            .attr("fill", colors.driver2);

        const overlay = svg.append("rect")
            .attr("class", "overlay")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", function (event) {
                const [mouseX] = d3.pointer(event);
                const distance = distanceScale.invert(mouseX);

                const driver1Pos = interpolateData(data.driver1, distance, d => d.Distance, d => d[colorAttribute]);
                const driver2Pos = interpolateData(data.driver2, distance, d => d.Distance, d => d[colorAttribute]);

                if (driver1Pos) {
                    driver1Point.attr("cx", distanceScale(driver1Pos.x)).attr("cy", valueScale(driver1Pos.y));
                }

                if (driver2Pos) {
                    driver2Point.attr("cx", distanceScale(driver2Pos.x)).attr("cy", valueScale(driver2Pos.y));
                }

                if (driver1Pos && driver2Pos) {
                    tooltip
                        .html(`
                             <div class="${styles.tooltipLine}">
                                <div class="${styles.tooltipColumn}">
                                    <div class="${styles.tooltipHeader}">${driver1}</div>
                                    <div class="${styles.tooltipValue}">${driver1Pos.y.toFixed(2)}</div>
                                </div>
                                <div class="${styles.tooltipMiddle}">
                                    <div class="${styles.distance}">Distance: ${driver1Pos.x.toFixed(2)}</div>
                                    <div class="${styles.attribute}">${colorAttribute}</div>
                                </div>
                                <div class="${styles.tooltipColumn}">
                                    <div class="${styles.tooltipHeader}">${driver2}</div>
                                    <div class="${styles.tooltipValue}">${driver2Pos.y.toFixed(2)}</div>
                                </div>
                            </div>
                        `)
                        .style("left", `${event.pageX + 15}px`)
                        .style("top", `${event.pageY - 30}px`)
                        .style("opacity", 1);
                }
            })
            .on("mouseout", () => tooltip.style("opacity", 0));

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
            .on("zoom", (event) => {
                const newXScale = event.transform.rescaleX(distanceScale);

                svg.select(".x-axis").call(d3.axisBottom(newXScale).ticks(10));

                const updatedLine = d3.line()
                    .x(d => newXScale(d.Distance))
                    .y(d => valueScale(d[colorAttribute]))
                    .curve(d3.curveMonotoneX);

                svg.select(".driver1-line").attr("d", updatedLine(data.driver1));
                svg.select(".driver2-line").attr("d", updatedLine(data.driver2));

                overlay.on("mousemove", function (event) {
                    const [mouseX] = d3.pointer(event);
                    const distance = newXScale.invert(mouseX);

                    const driver1Pos = interpolateData(data.driver1, distance, d => d.Distance, d => d[colorAttribute]);
                    const driver2Pos = interpolateData(data.driver2, distance, d => d.Distance, d => d[colorAttribute]);

                    if (driver1Pos) {
                        driver1Point.attr("cx", newXScale(driver1Pos.x)).attr("cy", valueScale(driver1Pos.y));
                    }

                    if (driver2Pos) {
                        driver2Point.attr("cx", newXScale(driver2Pos.x)).attr("cy", valueScale(driver2Pos.y));
                    }

                    if (driver1Pos && driver2Pos) {
                        tooltip
                            .html(`
                                <div class="${styles.tooltipLine}">
                                    <div class="${styles.tooltipColumn}">
                                        <div class="${styles.tooltipHeader}">${driver1}</div>
                                        <div class="${styles.tooltipValue}">${driver1Pos.y.toFixed(2)}</div>
                                    </div>
                                    <div class="${styles.tooltipMiddle}">
                                        <div class="${styles.distance}">Distance: ${driver1Pos.x.toFixed(2)}</div>
                                        <div class="${styles.attribute}">${colorAttribute}</div>
                                    </div>
                                    <div class="${styles.tooltipColumn}">
                                        <div class="${styles.tooltipHeader}">${driver2}</div>
                                        <div class="${styles.tooltipValue}">${driver2Pos.y.toFixed(2)}</div>
                                    </div>
                                </div>
                            `)
                            .style("left", `${event.pageX + 15}px`)
                            .style("top", `${event.pageY - 30}px`)
                            .style("opacity", 1);
                    }
                });
            });

        svg.call(zoom);
    };

    useEffect(() => {
        if (!data.driver1 || !data.driver2 || data.driver1.length === 0 || data.driver2.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };

        setupSVG(svg, width, height, margin);

        const { distanceScale, valueScale } = createScales(data, width, height, margin, colorAttribute);
        const scales = { distanceScale, valueScale, width, height };

        createAxes(svg, distanceScale, valueScale, height, width, margin);

        const line = d3.line()
            .x(d => distanceScale(d.Distance))
            .y(d => valueScale(d[colorAttribute]))
            .curve(d3.curveMonotoneX);

        const colors = { driver1: "#e66101", driver2: "#0571b0" };

        const tooltip = addTooltip(svg, width, margin);

        drawLine(svg, data.driver1, line, colors.driver1, "driver1-line");
        drawLine(svg, data.driver2, line, colors.driver2, "driver2-line");

        addLegend(svg, driver1, driver2, colors, width, margin);

        addMovingPoints(svg, data, scales, colors, tooltip, margin, width, height);
    }, [data, colorAttribute]);

    return (
        <div style={{position: "relative"}}>
            <svg ref={svgRef} width={800} height={600}/>
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

export default LineChart;
