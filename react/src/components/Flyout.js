import * as React from 'react';
import { List, Box, IconButton, Drawer } from "@mui/material";
import  MenuIcon  from '@mui/icons-material/Menu'
import FlyoutItem from './FlyoutItem';
import raceImage from '../images/race.png';
import circuitImage from '../images/circuit.png';
import lapTimeImage from '../images/lap-time.png';
import strategyImage from '../images/strategy.png';
import HomeIcon from '@mui/icons-material/Home';


const Flyout = () => {

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    return (
        <>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}>
                <MenuIcon />
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)} sx={{'& .MuiDrawer-paper': { backgroundColor: '#C0C0C0'}}}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
                    <List>
                        <FlyoutItem text="Home" url="/" icon={<HomeIcon sx={{width: '11vh', height: '11vh', color: 'black'}}/>} />
                        <FlyoutItem text="Results" url="/viz/results" img={raceImage} />
                        <FlyoutItem text="Circuits" url="/viz/circuits" img={circuitImage} />
                        <FlyoutItem text="Lap times" url="/viz/laptimes" img={lapTimeImage} />
                        <FlyoutItem text="Strategies" url="/viz/strategies" img={strategyImage} />
                    </List>
                </Box>
            </Drawer>
        </>
    );
}

export default Flyout;