import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { YEARS, DEV_URL } from '../shared-resources/constants';
import axios from 'axios';

const LapTimes = () => {

    const [year, setYear] = useState(0);
    const [race, setRace] = useState('');
    const [races, setRaces] = useState([]);
    const [racesVisible, setRacesVisible] = useState(false);
    // const [racersVisible, setRacersVisible] = useState(false);

    const url = useMemo(() => (process.env.REACT_APP_API_URL === null || process.env.REACT_APP_API_URL === undefined ? DEV_URL : process.env.REACT_APP_API_URL),[]);

    function handleRaceChange(e){
        console.log(e.target.value)
        if(e.target.value !== 0){
            setRace(e.target.value)
        }
    }

    function handleYearChange(e){
        console.log(e.target.value)
        if(e.target.value !== 0){
            setYear(e.target.value)
            setRacesVisible(true)
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
    
            console.log(response.data);
            setRaces(response.data)
        }

        getRaces();

    }, [year, url])

    return (
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Box sx={{ width: '50%'}}>
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
                { racesVisible && <FormControl  fullWidth sx={{marginTop: '5%'}}>
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
            </Box>
        </Box>
    )
}

export default LapTimes;