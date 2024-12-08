import { useState, useRef } from 'react';
import TrackDataProvider from './TrackDataProvider';
import LineChart from './LineChart';
import {DRIVERS2024} from "../../shared-resources/constants";
import ComparisonTrackView from "./ComparisonTrackView";
import SingleDriverTrackView from "./SingleDriverTrackView";

const TrackComponent = () => {
    const [viewType, setViewType] = useState('line');
    const [colorAttribute, setColorAttribute] = useState('Speed');
    const [comparisonMode, setComparisonMode] = useState(false);

    const [driver1, setDriver1] = useState('VER'); // Default to Max Verstappen
    const [driver2, setDriver2] = useState('VER'); // Default to Lewis Hamilton
    const [raceInfo] = useState({ year: 2024, circuit: 'Spa', session: 'Q' });


    const tooltipRef = useRef();

    const handleColorAttributeChange = (e) => {
        setColorAttribute(e.target.value);
    };

    const handleDriver1Change = (e) => {
        setDriver1(e.target.value);
    };

    const handleDriver2Change = (e) => {
        setDriver2(e.target.value);
    };

    const toggleViewType = () => {
        setViewType(prev => (prev === 'track' ? 'line' : 'track'));
    };

    const toggleComparisonMode = () => {
        setComparisonMode(prev => !prev);
    };

    return (
        <TrackDataProvider raceInfo={raceInfo} driver1={driver1} driver2={driver2} colorAttribute={colorAttribute}>
            {({ data, error, loading }) => (
                <>
                    <div ref={tooltipRef} style={{
                        position: 'absolute',
                        display: 'none',
                        background: 'white',
                        padding: '5px',
                        border: '1px solid gray',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        zIndex: 10
                    }}></div>
                    <div>
                        <label>Choose Driver 1:</label>
                        <select onChange={handleDriver1Change} value={driver1}>
                            {DRIVERS2024.map(driver => (
                                <option key={driver.code} value={driver.code}>
                                    {driver.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Choose Driver 2:</label>
                        <select onChange={handleDriver2Change} value={driver2}>
                            {DRIVERS2024.map(driver => (
                                <option key={driver.code} value={driver.code}>
                                    {driver.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={toggleViewType}>
                        Switch to {viewType === 'track' ? 'Line Chart' : 'Track View'}
                    </button>
                    <button onClick={toggleComparisonMode}>
                        {comparisonMode ? 'Single Driver Mode' : 'Comparison Mode'}
                    </button>
                    <select onChange={handleColorAttributeChange} value={colorAttribute}>
                        <option value="Speed">Speed (km/h)</option>
                        <option value="RPM">RPM</option>
                        <option value="nGear">Gear Number</option>
                        <option value="Throttle">Throttle Pressure (%)</option>
                        <option value="Brake">Brake Applied (boolean)</option>
                        <option value="DRS">DRS Status</option>
                    </select>

                    {loading ? (
                        <div>Loading data...</div>
                    ) : error ? (
                        <div>Error: {error}</div>
                    ) : viewType === 'track' ? (
                        comparisonMode ? (
                            <ComparisonTrackView data={data} driver1={driver1} driver2={driver2}
                                                 colorAttribute={colorAttribute} tooltipRef={tooltipRef}/>
                        ) : (
                            <SingleDriverTrackView data={data} driver1={driver1} colorAttribute={colorAttribute}
                                                   tooltipRef={tooltipRef}/>
                        )
                    ) : (
                        <LineChart data={data} driver1={driver1} driver2={driver2} colorAttribute={colorAttribute}/>
                    )}
                </>
            )}
        </TrackDataProvider>
    );
};

export default TrackComponent;
