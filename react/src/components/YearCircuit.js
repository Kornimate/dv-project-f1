import React, { useState, useEffect } from "react";
import axios from "axios";
import RaceStandings from "./RaceStandings";

const YearCircuit = () => {
    const [year, setYear] = useState(2024);
    const [circuits, setCircuits] = useState([]);
    const [selectedCircuit, setSelectedCircuit] = useState("");

    useEffect(() => {
        const fetchCircuits = async () => {
            try {
                const response = await axios.get(`/api/f1-circuits?year=${year}`);
                setCircuits(response.data.circuits);
            } catch (err) {
                console.error("Failed to load circuits:", err);
            }
        };

        fetchCircuits();
    }, [year]);

    return (
        <div>
            <label>Select Year: </label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
                {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>

            <label>Select Circuit: </label>
            <select 
                value={selectedCircuit} 
                onChange={(e) => setSelectedCircuit(e.target.value)}
            >
                <option value="" disabled>
                    Select a Circuit
                </option>
                {circuits.map((circuit) => (
                    <option key={circuit} value={circuit}>{circuit}</option>
                ))}
            </select>

            <RaceStandings year={year} circuit={selectedCircuit} />
        </div>
    );
};

export default YearCircuit;