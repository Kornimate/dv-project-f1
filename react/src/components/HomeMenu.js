import Box from "@mui/material/Box";
import HomeMenuItem from "./HomeMenuItem";
import raceImage from '../images/race.png';
import circuitImage from '../images/circuit.png';
import lapTimeImage from '../images/lap-time.png';
import strategyImage from '../images/strategy.png';

const HomeMenu = () => {
    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: "10px", height: '100%'}}>
            <HomeMenuItem url="/viz/results" title="Races" img={raceImage} />
            <HomeMenuItem url="/viz/circuits" title="Track Telemetry" img={circuitImage} />
            <HomeMenuItem url="/viz/laptimes" title="Lap times" img={lapTimeImage} />
            <HomeMenuItem url="/viz/strategies" title="Strategies" img={strategyImage} />
        </Box>
    );
}

export default HomeMenu;