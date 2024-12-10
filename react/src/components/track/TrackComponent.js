import {useState, useRef, useEffect, useMemo} from 'react';
import TrackDataProvider from './TrackDataProvider';
import LineChart from './LineChart';
import {DRIVERS2024} from "../../shared-resources/constants";
import ComparisonTrackView from "./ComparisonTrackView";
import SingleDriverTrackView from "./SingleDriverTrackView";
import {CircularProgress} from "@mui/material";

import { YEARS, DEV_URL } from '../../shared-resources/constants';

import styles from '../../styles/TrackComponent.module.css';
import axios from "axios"; // Import the module CSS

const TrackComponent = () => {
    const url = useMemo(() => (process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL), []);

    const [viewType, setViewType] = useState('line');
    const [colorAttribute, setColorAttribute] = useState('Speed');
    const [comparisonMode, setComparisonMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const [races, setRaces] = useState([]);
    const [racers, setRacers] = useState([]);

    const [params, setParams] = useState({
        year: '2024',
        race: '1',
        driver1: 'VER',
        driver2: 'HAM',
        lap1: '',
        lap2: '',
        fastest: true,
    });

    const tooltipRef = useRef();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);

        const year = queryParams.get('year');
        const race = queryParams.get('race');
        const driver1 = queryParams.get('racer1');
        const driver2 = queryParams.get('racer2');
        const lap1 = queryParams.get('lap1');
        const lap2 = queryParams.get('lap2');

        // Only update state if at least one query param is not null
        if (year && race && driver1 && driver2 && lap1 && lap2) {
            setParams({
                year: year || undefined,
                race: race || undefined,
                driver1: driver1 || undefined,
                driver2: driver2 || undefined,
                lap1: lap1 || undefined,
                lap2: lap2 || undefined,
                fastest: false,
            });
        }

        setLoading(false);
    }, [params]);

    const updateParam = (key, value) => {
        const updatedParams = { ...params, [key]: value, fastest: true };
        setParams(updatedParams);

        const urlParams = new URLSearchParams(updatedParams);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    };

    useEffect(() => {
        async function getRaces(){
            if(params.year === 0 || isNaN(params.year) || params.year === '' || params.year === undefined || params.year === null)
                return;

            const response = await axios.get(`${url}/calendar-year-races`,{
                params : {
                    year : params.year
                }
            });
            console.log(response.data)

            setRaces(response.data)
            //setRacesVisible(true)
        }
        getRaces();
    }, [params.year, url]);

    const handleColorAttributeChange = (e) => {
        setColorAttribute(e.target.value);
    };

    const toggleViewType = () => {
        setViewType(prev => (prev === 'track' ? 'line' : 'track'));
    };

    const toggleComparisonMode = () => {
        setComparisonMode(prev => !prev);
    };

    return loading ? (
        <div className={styles.appContainer}>Loading...</div>
    ) : (
        <TrackDataProvider raceInfo={{ year: params.year, circuit: params.race, session: 'R' }} driver1={params.driver1} driver2={params.driver2} lap1={params.lap1} lap2={params.lap2} fastest={params.fastest}>
            {({ data, error, loading }) => (
                <div className={styles.appContainer}>
                    <div
                        ref={tooltipRef}
                        className={`${styles.tooltip}`}
                    ></div>
                    <div className={styles.dropdownGroupContainer}>
                        <div className={styles.dropdownContainer}>
                            <label className={styles.label}>Choose Year:</label>
                            <select className={styles.selectDropdown}
                                    onChange={(e) => updateParam('year', e.target.value)} value={params.year}>
                                {YEARS.map(y => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.dropdownContainer}>
                            <label className={styles.label}>Choose Year:</label>
                            <select className={styles.selectDropdown}
                                    onChange={(e) => updateParam('race', e.target.value)} value={params.race || ''}>
                                <option value="" disabled>
                                    Select a race
                                </option>
                                {races.map((race, index) => (
                                    <option key={index} value={index + 1}>
                                        {race}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className={styles.dropdownContainer}>
                            <label className={styles.label}>Choose Driver 1:</label>
                            <select className={styles.selectDropdown}
                                    onChange={(e) => updateParam('driver1', e.target.value)} value={params.driver1}>
                                {DRIVERS2024.map(driver => (
                                    <option key={driver.code} value={driver.code}>
                                        {driver.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.dropdownContainer}>
                            <label className={styles.label}>Choose Driver 2:</label>
                            <select className={styles.selectDropdown}
                                    onChange={(e) => updateParam('driver2', e.target.value)} value={params.driver2}>
                                {DRIVERS2024.map(driver => (
                                    <option key={driver.code} value={driver.code}>
                                        {driver.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.dropdownContainer}>
                            <label className={styles.label}>Choose Data:</label>
                            <select className={styles.comparisonDropdown} onChange={handleColorAttributeChange}
                                    value={colorAttribute}>
                                <option value="Speed">Speed (km/h)</option>
                                <option value="RPM">RPM</option>
                                <option value="nGear">Gear Number</option>
                                <option value="Throttle">Throttle Pressure (%)</option>
                                <option value="Brake">Brake Applied (boolean)</option>
                                <option value="DRS">DRS Status</option>
                            </select>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button className={styles.button} onClick={toggleViewType}>
                                Switch to {viewType === 'track' ? 'Line Chart' : 'Track View'}
                            </button>
                            {viewType === 'track' && (
                                <button className={styles.button} onClick={toggleComparisonMode}>
                                    {comparisonMode ? 'Single Driver Mode' : 'Comparison Mode'}
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <CircularProgress size="3rem" color="error"/>
                    ) : error ? (
                        <div className={styles.error}>Error: {error}</div>
                    ) : viewType === 'track' ? (
                        comparisonMode ? (
                            <ComparisonTrackView data={data} driver1={params.driver1} driver2={params.driver2}
                                                 colorAttribute={colorAttribute} tooltipRef={tooltipRef}/>
                        ) : (
                            <SingleDriverTrackView data={data} driver1={params.driver1} colorAttribute={colorAttribute}
                                                   tooltipRef={tooltipRef}/>
                        )
                    ) : (
                        <LineChart data={data} driver1={params.driver1} driver2={params.driver2}
                                   colorAttribute={colorAttribute}/>
                    )}
                </div>
            )}
        </TrackDataProvider>
    );
};

export default TrackComponent;