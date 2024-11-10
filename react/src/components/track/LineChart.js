import * as d3 from "d3";
import { useEffect, useRef } from "react";

const LineChart = ({ data, colorAttribute }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data.driver1 || data.driver1.length === 0 || !data.driver2 || data.driver2.length === 0) return;

        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };

        svg.selectAll("*").remove();

        svg.append("defs")
            .append("clipPath")
            .attr("id", "chart-clip")
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);

        const distanceScale = d3.scaleLinear()
            .domain(d3.extent([...data.driver1, ...data.driver2], d => d.Distance))
            .range([margin.left, width - margin.right]);

        const valueScale = d3.scaleLinear()
            .domain(d3.extent([...data.driver1, ...data.driver2], d => d[colorAttribute]))
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => distanceScale(d.Distance))
            .y(d => valueScale(d[colorAttribute]))
            .curve(d3.curveMonotoneX);

        const xAxis = svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(distanceScale).ticks(10));

        const yAxis = svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(valueScale).ticks(10));

        svg.append("path")
            .datum(data.driver1)
            .attr("class", "driver1-line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("clip-path", "url(#chart-clip)")
            .attr("d", line);

        svg.append("path")
            .datum(data.driver2)
            .attr("class", "driver2-line")
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 2)
            .attr("clip-path", "url(#chart-clip)")
            .attr("d", line);

        const crosshairGroup = svg.append("g").attr("class", "crosshairs").style("display", "none");

        const line1 = crosshairGroup.append("line")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1)
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom);

        const line2 = crosshairGroup.append("line")
            .attr("stroke", "orange")
            .attr("stroke-width", 1)
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom);

        const marker1 = crosshairGroup.append("circle")
            .attr("fill", "steelblue")
            .attr("r", 4);

        const marker2 = crosshairGroup.append("circle")
            .attr("fill", "orange")
            .attr("r", 4);

        let currentXScale = distanceScale;
        let currentYScale = valueScale;

        svg.append("rect")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseover", () => crosshairGroup.style("display", null))
            .on("mouseout", () => crosshairGroup.style("display", "none"))
            .on("mousemove", function(event) {
                const [mouseX] = d3.pointer(event);
                const xValue = currentXScale.invert(mouseX);

                const closestDriver1 = data.driver1.reduce((prev, curr) =>
                    Math.abs(curr.Distance - xValue) < Math.abs(prev.Distance - xValue) ? curr : prev
                );

                const closestDriver2 = data.driver2.reduce((prev, curr) =>
                    Math.abs(curr.Distance - xValue) < Math.abs(prev.Distance - xValue) ? curr : prev
                );

                const xPos1 = currentXScale(closestDriver1.Distance);
                const yPos1 = currentYScale(closestDriver1[colorAttribute]);

                const xPos2 = currentXScale(closestDriver2.Distance);
                const yPos2 = currentYScale(closestDriver2[colorAttribute]);

                line1.attr("x1", xPos1).attr("x2", xPos1);
                line2.attr("x1", xPos2).attr("x2", xPos2);

                marker1.attr("cx", xPos1).attr("cy", yPos1);
                marker2.attr("cx", xPos2).attr("cy", yPos2);
            });

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
            .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
            .on("zoom", function(event) {
                const { transform } = event;
                currentXScale = transform.rescaleX(distanceScale);
                currentYScale = transform.rescaleY(valueScale);

                xAxis.call(d3.axisBottom(currentXScale).ticks(10));
                yAxis.call(d3.axisLeft(currentYScale).ticks(10));

                svg.selectAll(".driver1-line")
                    .attr("d", line.x(d => currentXScale(d.Distance)).y(d => currentYScale(d[colorAttribute])));

                svg.selectAll(".driver2-line")
                    .attr("d", line.x(d => currentXScale(d.Distance)).y(d => currentYScale(d[colorAttribute])));
            });

        svg.call(zoom);
    }, [data, colorAttribute]);


    return <svg ref={svgRef} width={800} height={600} />;
};

export default LineChart;
