import { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import * as d3 from 'd3';
import styles from '../styles/LapTimesGraph.module.css';
import '../styles/LapTimesGraph.css'


const LapTimesGraph = ({l1, l2, r1, r2, c1, c2}) => {

    const svgRef = useRef();
    const toolTipRef = useRef();
    const simulationRef = useRef();

    const [Svg, setSvg] = useState(null);
    const [btnDisabled, setBtnDisabled] = useState(false);

    useEffect(() => {

        let activeTooltip1 = false;
        let activeTooltip2 = false;

        if(l1.length === 0 || l2.length === 0)
            return;
        
        const margin = { top: 20, right: 30, bottom: 30, left: 50 };
        const width = 700 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const offset = 1;

        d3.selectAll("g").remove();

        // Create SVG canvas
        const svg = d3.select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up scales
        const xScale = d3.scaleLinear()
        .domain([0, Math.max(d3.max(l1, d => d.lap), d3.max(l2, d => d.lap))])
        .range([0, width]);

        const yScale = d3.scaleLinear()
        .domain([Math.min(
            d3.min(l1, d => d.lapTime), 
            d3.min(l2, d => d.lapTime)
        ) - offset, Math.max(
            d3.max(l1, d => d.lapTime), 
            d3.max(l2, d => d.lapTime)
        ) + offset])
        .range([height, 0]);

        
        const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`);
        const xAxis = d3.axisBottom(xScale).ticks(Math.max(l1.length, l2.length));
        xAxisGroup.call(xAxis)
        .selectAll(".tick text")
        .attr("dy", function(d) {
            return d % 2 === 0 ? "1.7em" : "0.7em";  // Lower even-numbered labels
        });
        
        // Create and add y-axis with custom formatting
        const yAxisGroup = svg.append("g");
        const yAxis = d3.axisLeft(yScale).tickFormat(formatTime).ticks(getTicksForYAxis());
        yAxisGroup.call(yAxis);

        function makeYGridlines() {
            return d3.axisLeft(yScale)
                     .ticks(getTicksForYAxis() / 2)
                     .tickSize(-width)
                     .tickFormat('');
          }
          
        function makeXGridlines(divider) {
            return d3.axisBottom(xScale)
                        .ticks(Math.max(l1.length, l2.length) / divider)
                        .tickSize(-height)
                        .tickFormat('');
        }

        // Append gridlines
        svg.append("g")
            .attr("class", styles.grid)
            .call(makeYGridlines());
            
        svg.append("g")
        .attr("class", styles.grid)
        .attr("transform", `translate(0, ${height})`)
        .call(makeXGridlines(10));

        //grid lines for animation
                  
        svg.append("g")
        .attr("class", "animation")
        .attr("transform", `translate(0, ${height})`)
        .call(makeXGridlines(1))
        .selectAll("line")
        .style("stroke", "yellow")
        .style("display", "none");

        // Line generator function for data1
        const line1 = d3.line()
        .x(d => xScale(d.lap))
        .y(d => yScale(d.lapTime));

        // Line generator function for data2
        const line2 = d3.line()
        .x(d => xScale(d.lap))
        .y(d => yScale(d.lapTime));

        // Append initial line for data1
        svg.append("path")
        .datum(l1)
        .style("fill", "none")
        .style("stroke", c1)
        .style("stroke-width", "3px")
        .attr("d", line1);

        // Append initial line for data2
        svg.append("path")
        .datum(l2)
        .style("fill", "none")
        .style("stroke", c2)
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke-width", "3px")
        .attr("d", line2);

        svg.append("text")
        .attr("class", "label")
        .attr("x", xScale(l1[l1.length-1].lap))
        .attr("y", yScale(l1[l1.length-1].lapTime))
        .attr("dy", "-0.5em")
        .style("fill", c1)
        .text(r1);
      
        svg.append("text")
        .attr("class", "label")
        .attr("x", xScale(l2[l2.length-1].lap))
        .attr("y", yScale(l2[l2.length-1].lapTime))
        .attr("dy", "-0.5em")
        .style("fill", c2)
        .text(r2);

        function getTicksForYAxis(){
            return Math.min((Math.max(d3.max(l1, d => d.lapTime), d3.max(l1, d => d.lapTime)) - Math.min(d3.min(l1, d => d.lapTime), d3.min(l1, d => d.lapTime)))*5, 20);
        }

        const tooltip = d3.select(toolTipRef.current);
        
        // Add circles at data points
        svg.selectAll("circle.l1")
        .data(l1)
        .enter()
        .append("circle")
        .attr("class", "l1")
        .attr("cx", d => xScale(d.lap))
        .attr("cy", d => yScale(d.lapTime))
        .attr("r", 4)
        .attr("fill", c1)
        .on("mouseover", (event, d) => {
            if(!activeTooltip2){
                tooltip.style("display", "block")
                       .html(`${r1}<br>Lap Time: ${formatTime(d.lapTime)}`);
            } else {
                tooltip.html(toolTipRef.innerHTML + `<br>${r2}<br>Lap Time: ${formatTime(d.lapTime)}`);
            }
            
            activeTooltip1 = true;
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            if(!activeTooltip2){
                tooltip.style("display", "none");
            }

            activeTooltip1 = false;
        });

        svg.selectAll("circle.l2")
        .data(l2)
        .enter()
        .append("circle")
        .attr("class", "l2")
        .attr("cx", d => xScale(d.lap))
        .attr("cy", d => yScale(d.lapTime))
        .attr("r", 4)
        .attr("fill", c2)
        .on("mouseover", (event, d) => {
            if(!activeTooltip1){
                tooltip.style("display", "block")
                       .html(`${r2}<br>Lap Time: ${formatTime(d.lapTime)}`);
            } else {
                tooltip.html(toolTipRef.innerHTML + `<br>${r2}<br>Lap Time: ${formatTime(d.lapTime)}`);
            }

            activeTooltip2 = true;
        })
        .on("mousemove", (event) => {
          tooltip.style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            if(!activeTooltip1){
                tooltip.style("display", "none");
            }

            activeTooltip2 = false;
        });

        setSvg(svg);

    }, [l1, l2, r1, r2, c1, c2]);

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const milliseconds = Math.floor((seconds % 1) * 1000); // Get milliseconds
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    function handleClick(e){
        if(Svg == null)
            return;

        const end = Math.max(l1.length, l2.length);
        let timeOut = null;

        function Animate(current){
            if(current >= end){
                if(simulationRef === null || simulationRef.current === null){
                    clearTimeout(timeOut);

                    return;
                }

                Svg.selectAll(".animation .tick")
                .each(function(d){
                    d3.select(this).select("line")
                            .style("stroke", "white");
                });

                setBtnDisabled(false);

                simulationRef.current.innerHTML = '';

                return;
            }

            Svg.selectAll(".animation .tick")
                .each(function(d) {
                    if (d === (current-1) && current > 0) { // Change the color of the grid line at y = 50
                        d3.select(this).select("line")
                            .style("display", "none");
                        }

                    if (d === current) { // Change the color of the grid line at y = 50
                    d3.select(this).select("line")
                        .style("display", "block");
                    }
                });

            ShowDifference(current);

            timeOut = setTimeout(() => Animate(current + 1), 1000);
        }

        function ShowDifference(i){
            let diff = 0;
            let d1 = '';
            let d2 = '';
            let sign = '';

            if(l1.length <= i){
                d1 = 'No Time'
                d2 = formatTime(l2[i].lapTime);
                diff = formatTime(0);
            } else if(l2.length <= i){
                d1 = formatTime(l1[i].lapTime);
                d2 = 'No Time'
                diff = formatTime(0);
            } else {
                d1 = formatTime(l1[i].lapTime);
                d2 = formatTime(l2[i].lapTime);
                diff = formatTime(Math.abs(l1[i].lapTime-l2[i].lapTime));
                sign = (l1[i].lapTime > l2[i].lapTime ? '-': (l2[i].lapTime > l1[i].lapTime ? '+' : ''));
            }

            const textColor = (sign==='-' ? 'redText': (sign==='+' ? 'greenText' : 'grayText'));

            if(simulationRef === null || simulationRef.current === null){
                clearTimeout(timeOut);
                return;
            }
            simulationRef.current.innerHTML = 
            `<table>
                <tr>
                    <td><h2>${d1}</h2></td>
                    <td class="${textColor}">${sign}${diff}</td>
                    <td><h2>${d2}</h2></td>
                </tr>
            </table>`;
        }

        setBtnDisabled(true);
        Animate(0);
        simulationRef.current.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <>
        <div className={styles.divStyle}>
            <svg width="700" height="400" ref={svgRef}></svg>
        </div>
            <div ref={toolTipRef} style={{ position: 'absolute', display: 'none', padding: '8px', backgroundColor: 'white', border: '1px solid #c0c0c0', borderRadius: '4px' }}></div>
            <div className={styles.divStyle}>
                <h1>{r1} vs {r2}</h1>
                <div ref={simulationRef} className={styles.centeredDiv}></div>
                <p>
                    <Button onClick={handleClick} variant="outlined" color="error" disabled={btnDisabled}>
                        <PlayArrowIcon sx={{color : '#FF1E00'}}/>
                    </Button>
                </p>
            </div>
        </>
    );
}

export default LapTimesGraph;
