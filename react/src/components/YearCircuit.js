import React, { useState, useEffect } from "react";
import axios from "axios";
import RaceStandings from "./RaceStandings";
import {MenuItem, FormControl, Select, InputLabel} from "@mui/material"

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
            <FormControl sx={{ minWidth: 150, marginBottom: 2 , marginTop: 3}}>
                <InputLabel>Select Year</InputLabel>
                <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Select Year"
                >
                    {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200, marginLeft: 2, marginBottom: 2, marginTop: 3}}>
                <InputLabel>Select Circuit</InputLabel>
                <Select
                    value={selectedCircuit}
                    onChange={(e) => setSelectedCircuit(e.target.value)}
                    label="Select Circuit"
                >
                    {circuits.map((circuit) => (
                        <MenuItem key={circuit} value={circuit}>{circuit}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <RaceStandings 
                year={year} 
                circuit={selectedCircuit} 
            />
        </div>
    );
};

export default YearCircuit;