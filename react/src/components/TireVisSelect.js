import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'; 
import { YEARS, DEV_URL } from '../shared-resources/constants';
import axios from 'axios';
import TireStrategyVisualization from './TireStrategyVisualisation';

const TireVisSelect = () => {

    const [year, setYear] = useState(0);
    const [race, setRace] = useState('');
    const [races, setRaces] = useState([]);
    const [racesVisible, setRacesVisible] = useState(false);
    const [startVisualization, setStartVisualization] = useState(false);
    
    // eslint-disable-next-line
    const [searchParams, _] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const url = useMemo(() => (process.env.REACT_APP_API_URL === null || process.env.REACT_APP_API_URL === undefined ? DEV_URL : process.env.REACT_APP_API_URL),[]);
    
    function handleYearChange(e){
        if(e.target.value !== 0){
            setYear(e.target.value)
            setStartVisualization(false);
            setRace('');
        }
    }

    function handleRaceChange(e){
        if(e.target.value !== ''){
            setRace(e.target.value)
            setStartVisualization(false);
        }
    }


    useEffect(() => {

        if(Array.from(new URLSearchParams(location.search)).length === 0)
            return;

        try{
            const y = parseInt(searchParams.get('year'));
            
            if(isNaN(y) || y === null || y === undefined || y < YEARS[YEARS.length-1] || y > YEARS[0])
                throw new Error("invalid year");

            const r = searchParams.get('race');

            if(r === null)
                throw new Error('invalid query string');

            setYear(y);
            setRace(r);

        } catch {
            alert('Invalid data in URL! Navigating back to Home Page!');
            navigate('/');
        }
    }, [navigate, searchParams, location])

    useEffect(() => {
        async function getRaces(){
            if(year === 0 || isNaN(year) || year === '' || year === undefined || year === null)
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

        function CheckforVisualizationStart(){
            setStartVisualization(year !== 0 && race !== '');
        }

        CheckforVisualizationStart();
        
    }, [year, race])

    return (
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Box sx={{ width: '100%', maxWidth: "900px"}}>
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
                { racesVisible && <FormControl  fullWidth sx={{marginTop: '2%', marginBottom: '2%'}}>
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
                { startVisualization && <TireStrategyVisualization year={year} race={race} />}
            </Box>
        </Box>
    )
}

export default TireVisSelect;