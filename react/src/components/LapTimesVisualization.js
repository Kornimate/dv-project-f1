import { useEffect, useState, useMemo } from 'react';
import { DEV_URL } from '../shared-resources/constants';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import LapTimesGraph from './LapTimesGraph';


const LapTimesVisualization = ({year, race, racer1, racer2}) =>{

    const url = useMemo(() => (process.env.REACT_APP_API_URL === null || process.env.REACT_APP_API_URL === undefined ? DEV_URL : process.env.REACT_APP_API_URL),[]);



    const [l1, setL1] = useState([]);
    const [l2, setL2] = useState([]);
    const [r1, setR1] = useState('');
    const [r2, setR2] = useState('');
    const [c1, setC1] = useState('');
    const [c2, setC2] = useState('');

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function GetRaceLapTimesForDrivers(){
            const response = await axios.get(`${url}/pilots-times-for-race`,{
                params: {
                    year: year,
                    race: race,
                    racer1: racer1,
                    racer2: racer2
                }
            });

            setL1(response.data[0].laps);
            setL2(response.data[1].laps);
            setR1(response.data[0].driver);
            setR2(response.data[1].driver);
            setC1(response.data[0].color);
            setC2(response.data[1].color);
        }

        setLoaded(false);

        GetRaceLapTimesForDrivers();

    }, [year, race, racer1, racer2, url]);

    useEffect(() => {
        if(l1.length > 0 && l2.length > 0 && r1 !== '' && r2 !== '' && c1 !== '' && c2!==''){
            setLoaded(true);
        }
    }, [l1, l2, r1, r2, c1, c2])

    return (
        <Box sx={{ marginTop: '5%', borderWidth: 5, borderBlock: 'black', borderRadius: 5}}>
            {!loaded ?
                <CircularProgress size="3rem" color='error'/>
                :
                <LapTimesGraph year={year} race={race} l1={l1} l2={l2} r1={r1} r2={r2} c1={c1} c2={c2} /> }
        </Box>
    );
}

export default LapTimesVisualization;