import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import styles from '../styles/VisualizationsNavigation.module.css'


const VisualizationsNavigation = ({year, race, r1, r2, l1, l2}) => {

    const navigate = useNavigate();

    function navigateToResults(){
        navigate(`/viz/results?year=${year}&race=${race}`)
    }

    function navigateToCircuits(){
        if(l1 === null || l2 === null || l1 === undefined || l2 === undefined){
            alert("Choose 2 points to proceed with to the other page!")
            return;
        }

        navigate(`/viz/circuits?year=${year}&race=${race}&racer1=${l1.driver}&racer2=${l2.driver}&lap1=${l1.lapNumber}&lap2=${l2.lapNumber}`)
    }

    function navigateToStrategies(){
        navigate(`/viz/strategies?year=${year}&race=${race}`)
    }

    return (
        <div className={styles.divStyle}>
            <Button onClick={navigateToResults}>Results</Button>
            <Button onClick={navigateToCircuits}>Circuits</Button>
            <Button onClick={navigateToStrategies}>Strategies</Button>
        </div>
    )
}

export default VisualizationsNavigation;