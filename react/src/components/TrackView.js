import { useEffect, useState, useMemo, useRef } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import * as d3 from "d3";

const TrackView = () => {

    const svgRef = useRef();

    const raceInfo = useMemo(() => {
        return     {
            year: 2024,
            circuit: 'Monza',
            session: 'Q',
            driver: 'VER',
        }
    },[]);

    const url = useMemo(() => (process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL),[]);

    const [data, setData] = useState([]);

    const [error, setError] = useState('');

    useEffect(() => {

        async function fetchAPI(){

            try{
                const response = await axios.get(`${url}/f1-fastest-lap`,{
                    params: raceInfo
                });

                if(response.status !== 200){
                    setError(`${response.status} - ${response?.data?.message}`);
                }

                setData(JSON.parse(response.data));
            }
            catch {
                setData([]);
            }
        }

        fetchAPI();
        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;

        svg.attr("viewBox", `0 0 ${width} ${height}`).style("overflow", "visible");

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.X))
            .range([50, width - 50]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Y))
            .range([height - 50, 50]);

        const colorScale = d3.scaleSequential(d3.interpolateCool)
            .domain(d3.extent(data, d => d.Z));

        svg.selectAll("*").remove();

        data.slice(1).forEach((d, i) => {
            svg.append("line")
                .attr("x1", xScale(data[i].X))
                .attr("y1", yScale(data[i].Y))
                .attr("x2", xScale(d.X))
                .attr("y2", yScale(d.Y))
                .attr("stroke", colorScale(d.Z))  // Color each segment based on Z value
                .attr("stroke-width", 5)
                .attr("fill", "none");
        });
    }, [raceInfo, url]);

    return <svg ref={svgRef} width={800} height={600}/>
}

export default TrackView;