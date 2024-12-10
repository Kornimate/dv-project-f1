import { useEffect, useState, useMemo, useRef } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants.js";
import TrackVisualization from "./TrackVisualization";
import LapDataChart from "./LapTimesGraph";

const RaceSessionWrapper = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [colorAttribute, setColorAttribute] = useState("Speed");
    const [viewType, setViewType] = useState("track");

    const raceInfo = useMemo(() => ({
        year: 2024,
        circuit: 'Monza',
        session: 'Q',
        driver: 'VER',
    }), []);

    const url = useMemo(() => process.env.API_URL ?? DEV_URL, []);

    // Fetch and process data
    useEffect(() => {
        const fetchAPI = async () => {
            try {
                const response = await axios.get(`${url}/f1-fastest-lap`, { params: raceInfo });
                if (response.status === 200) {
                    const rawData = JSON.parse(response.data);
                    const processedData = rawData.map(d => ({
                        ...d,
                        DRSStatus: categorizeDRS(d.DRS),
                    }));
                    setData(processedData);
                } else {
                    setError(`${response.status} - ${response?.data?.message}`);
                }
            } catch (error) {
                setData([]);
                setError("Failed to fetch data");
            }
        };

        const categorizeDRS = (drsValue) => {
            if (drsValue === 0 || drsValue === 1) {
                return "DRS Off";
            } else if (drsValue === 8) {
                return "DRS Detected, Eligible in Activation Zone";
            } else if (drsValue === 10 || drsValue === 12 || drsValue === 14) {
                return "DRS Active";
            } else {
                return "Unknown DRS Status";
            }
        };

        fetchAPI();
    }, [url, raceInfo]);

    const svgRef = useRef();
    const tooltipRef = useRef();

    // Toggle between Track and Line views
    const toggleViewType = () => {
        setViewType(prev => (prev === "track" ? "line" : "track"));
    };

    return (
        <>
            <button onClick={toggleViewType}>
                Switch to {viewType === "track" ? "Lap Time Chart" : "Track Visualization"}
            </button>
            <select onChange={(e) => setColorAttribute(e.target.value)} value={colorAttribute}>
                <option value="Speed">Speed (km/h)</option>
                <option value="RPM">RPM</option>
                <option value="nGear">Gear Number</option>
                <option value="Throttle">Throttle Pressure (%)</option>
                <option value="Brake">Brake Applied (boolean)</option>
            </select>
            {error && <p>{error}</p>}
            {viewType === "track" ? (
                <TrackVisualization data={data} colorAttribute={colorAttribute} />
            ) : (
                <LapDataChart data={data} colorAttribute={colorAttribute} />
            )}
        </>
    );
};

export default RaceSessionWrapper;
