import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { YEARS, DEV_URL } from '../shared-resources/constants';
import axios from 'axios';
import LapTimesVisualization from './LapTimesVisualization';

const LapTimes = () => {

    const [year, setYear] = useState(0);
    const [race, setRace] = useState('');
    const [racer1, setRacer1] = useState('');
    const [racer2, setRacer2] = useState('');
    const [races, setRaces] = useState([]);
    const [racers, setRacers] = useState([]);
    const [racesVisible, setRacesVisible] = useState(false);
    const [racersVisible, setRacersVisible] = useState(false);
    const [startVisualization, setStartVisualization] = useState(false);

    const url = useMemo(() => (process.env.REACT_APP_API_URL === null || process.env.REACT_APP_API_URL === undefined ? DEV_URL : process.env.REACT_APP_API_URL),[]);
    
    function handleYearChange(e){
        if(e.target.value !== 0){
            setYear(e.target.value)
            setRacersVisible(false);
            setStartVisualization(false);
            setRace('');
        }
    }

    function handleRaceChange(e){
        if(e.target.value !== ''){
            setRace(e.target.value)
            setStartVisualization(false);
            setRacer1('');
            setRacer2('');
        }
    }

    function handleRacer1Change(e){
        if(e.target.value !== '' && e.target.value === racer2){
            alert('Choose different pilots for comparison!');
            return;
        }

        if(e.target.value !== ''){
            setRacer1(e.target.value)
        }
    }

    function handleRacer2Change(e){
        if(e.target.value !== '' && e.target.value === racer1){
            alert('Choose different pilots for comparison!');
            return;
        }

        if(e.target.value !== ''){
            setRacer2(e.target.value)
        }
    }

    useEffect(() => {
        async function getRaces(){
            if(year === 0)
                return;

            const response = await axios.get(`${url}/calendar-year-races`,{
                params : {
                    year : year
                }
            });
    
            setRaces(response.data)
            setRacesVisible(true)
        }

        getRaces();

    }, [year, url]);

    useEffect(() => {
        async function getRacers(){
            if(year === 0 || race === '')
                return;

            const response = await axios.get(`${url}/pilots-for-race`,{
                params : {
                    year : year,
                    race: race
                }
            });
    
            setRacers(response.data)
            setRacersVisible(true)
        }

        getRacers();

    }, [year, race, url]);

    useEffect(() => {

        function CheckforVisualizationStart(){
            setStartVisualization(year !== 0 && race !== '' && racer1 !== '' && racer2 !== '');
        }

        CheckforVisualizationStart();
        
    }, [year, race, racer1, racer2])

    return (
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Box sx={{ width: '50%', maxWidth: "700px"}}>
                <FormControl fullWidth sx={{marginTop: '5%'}}>
                    <InputLabel id="yearLabel">Year</InputLabel>
                    <Select
                        labelId="yearLabel"
                        id="yearSelect"
                        value={year !== 0 ? year : ''}
                        label="Year"
                        onChange={handleYearChange}
                        >
                    {
                        YEARS.map((year) => {
                            return <MenuItem value={year} key={year}>{year}</MenuItem>
                        })
                    }
                    </Select>
                </FormControl>
                { racesVisible && <FormControl  fullWidth sx={{marginTop: '2%'}}>
                    <InputLabel id="raceLabel">Race</InputLabel>
                    <Select
                        labelId="raceLabel"
                        id="raceSelect"
                        value={race}
                        label="Race"
                        onChange={handleRaceChange}
                        >
                    {
                        races && races.map((race, idx) => {
                            return <MenuItem value={idx + 1} key={idx}>{race}</MenuItem>
                        })
                    }
                    </Select>
                </FormControl> }
                { racersVisible && <Box>
                    <FormControl  fullWidth sx={{marginTop: '2%'}}>
                    <InputLabel id="racer1Label">Pilot 1</InputLabel>
                    <Select
                        labelId="racer1Label"
                        id="racer1Select"
                        value={racer1}
                        label="Pilot 1"
                        onChange={handleRacer1Change}
                        >
                        {
                            racers && racers.map((racer) => {
                                return <MenuItem value={racer.abbr} key={racer.abbr}>{racer.name}</MenuItem>
                            })
                        }
                        </Select>
                    </FormControl>
                    <FormControl  fullWidth sx={{marginTop: '2%'}}>
                    <InputLabel id="racer2Label">Pilot 2</InputLabel>
                    <Select
                        labelId="racer2Label"
                        id="racer2Select"
                        value={racer2}
                        label="Pilot 2"
                        onChange={handleRacer2Change}
                        >
                        {
                            racers && racers.map((racer) => {
                                return <MenuItem value={racer.abbr} key={racer.abbr}>{racer.name}</MenuItem>
                            })
                        }
                        </Select>
                    </FormControl>
                </Box>}
                { startVisualization && <LapTimesVisualization year={year} race={race} racer1={racer1} racer2={racer2} />}
            </Box>
        </Box>
    )
}

export default LapTimes;