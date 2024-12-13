import * as d3 from "d3";
import {useEffect, useRef} from "react";

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


         // Default to x-axis zoom
        svg.call(zoomX);

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

        const colors = { driver1: "#e66101", driver2: "#0571b0"}

        drawLine(svg, data.driver1, line, colors.driver1, "driver1-line");
        drawLine(svg, data.driver2, line, colors.driver2, "driver2-line");

        addLegend(svg, driver1, driver2, colors, width, margin);

        // Apply zoom behavior
        const cleanupZoom = addZoom(svg, scales, margin, height, line, colorAttribute);

        // Cleanup function for useEffect
        return cleanupZoom;
    }, [data, colorAttribute]);

    return <svg ref={svgRef} width={800} height={600} />;
};

export default LineChart;
