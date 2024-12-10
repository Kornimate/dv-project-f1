import * as d3 from "d3";
import { useEffect, useRef } from "react";

const LineChart = ({ data, driver1, driver2, colorAttribute }) => {
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

    const createAxes = (svg, distanceScale, valueScale, height, margin) => {
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(distanceScale).ticks(10));

        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(valueScale).ticks(10));
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

    const addZoom = (svg, scales, margin, height, line, colorAttribute) => {
        const zoomX = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[margin.left, margin.top], [scales.width - margin.right, height - margin.bottom]])
            .extent([[margin.left, margin.top], [scales.width - margin.right, height - margin.bottom]])
            .on("zoom", (event) => {
                const newXScale = event.transform.rescaleX(scales.distanceScale);

                svg.select(".x-axis").call(d3.axisBottom(newXScale).ticks(10));

                const newLine = line.x(d => newXScale(d.Distance));
                svg.selectAll(".driver1-line").attr("d", newLine);
                svg.selectAll(".driver2-line").attr("d", newLine);
            });

        const zoomY = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[margin.left, margin.top], [scales.width - margin.right, height - margin.bottom]])
            .extent([[margin.left, margin.top], [scales.width - margin.right, height - margin.bottom]])
            .on("zoom", (event) => {
                const newYScale = event.transform.rescaleY(scales.valueScale);

                svg.select(".y-axis").call(d3.axisLeft(newYScale).ticks(10));

                svg.selectAll(".driver1-line").attr("d", line.y(d => newYScale(d[colorAttribute])));
                svg.selectAll(".driver2-line").attr("d", line.y(d => newYScale(d[colorAttribute])));
            });

        let currentZoom = zoomX; // Default to x-axis zoom

        // Apply initial zoom
        svg.call(currentZoom);

        const handleKeyDown = (event) => {
            if (event.key === "Shift" && currentZoom !== zoomY) {
                currentZoom = zoomY;
                svg.call(currentZoom);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === "Shift" && currentZoom !== zoomX) {
                currentZoom = zoomX;
                svg.call(currentZoom);
            }
        };

        // Add event listeners for keypress
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Cleanup event listeners on unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
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

        createAxes(svg, distanceScale, valueScale, height, margin);

        const line = d3.line()
            .x(d => distanceScale(d.Distance))
            .y(d => valueScale(d[colorAttribute]))
            .curve(d3.curveMonotoneX);

        drawLine(svg, data.driver1, line, "steelblue", "driver1-line");
        drawLine(svg, data.driver2, line, "orange", "driver2-line");

        // Apply zoom behavior
        const cleanupZoom = addZoom(svg, scales, margin, height, line, colorAttribute);

        // Cleanup function for useEffect
        return cleanupZoom;
    }, [data, colorAttribute]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default LineChart;
