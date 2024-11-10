import { useState, useRef } from 'react';
import TrackDataProvider from './TrackDataProvider';
import TrackView from './TrackView';
import LineChart from './LineChart';
import {DRIVERS2024} from "../../shared-resources/constants";

const TrackComponent = () => {
    const [viewType, setViewType] = useState('line');
    const [colorAttribute, setColorAttribute] = useState('Speed');
    const [comparisonMode, setComparisonMode] = useState(false);

    const [driver1, setDriver1] = useState('VER'); // Default to Max Verstappen
    const [driver2, setDriver2] = useState('HAM'); // Default to Lewis Hamilton
    const [raceInfo] = useState({ year: 2024, circuit: 'Monza', session: 'Q' });


    const tooltipRef = useRef(); // Moved useRef here, at the top level of the component

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
            {({ data, error }) => (
                <>
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

                    {viewType === 'track' ? (
                        <TrackView data={data} colorAttribute={colorAttribute} tooltipRef={tooltipRef} comparisonMode={comparisonMode} />
                    ) : (
                        <LineChart data={data} colorAttribute={colorAttribute} />
                    )}
                </>
            )}
        </TrackDataProvider>
    );
};

export default TrackComponent;
