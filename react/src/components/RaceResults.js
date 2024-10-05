import { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { DEV_URL } from "../shared-resources/constants";

const RaceResults = () => {

    const raceInfo = useMemo(() => {
        return     {
            year: 2024,
            circuit: 'Monza',
            session: 'Q'
        }
    },[]);

    const url = useMemo(() => (process.env.API_URL === null || process.env.API_URL === undefined ? DEV_URL : process.env.API_URL),[]);
    
    const [data, setData] = useState([]);

    useEffect(() => {

        async function fetchAPI(){

            try{
                const response = await axios.get(`${url}/f1-race-results`,{
                    params: raceInfo
                });
                
                setData(JSON.parse(response.data));
            }
            catch {
                setData([]);
            }
        }

        fetchAPI();

    }, [raceInfo, url]);

    return <div>
        <div>
            <h1>{raceInfo.year} - {raceInfo.circuit} - {raceInfo.session}</h1>
        </div>
        <ol>
            {
                data.map((racer) => (
                    <li key={racer.DriverId}>{racer.FirstName} {racer.LastName} ({racer.DriverNumber})</li>
                ))
            }
        </ol>
    </div>

}

export default RaceResults;