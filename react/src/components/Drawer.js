import * as React from 'react';
import { List, Box, IconButton } from "@mui/material";
import  MenuIcon  from '@mui/icons-material/Menu'
import DrawerItem from './DrawerItem';
import raceImage from '../images/race.png';
import circuitImage from '../images/circuit.png';
import lapTimeImage from '../images/lap-time.png';
import strategyImage from '../images/strategy.png';


const Drawer = () => {

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
                    onClick={toggleDrawer(true)}
                >
                    <MenuIcon />
                </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
                    <List>
                        {/* <DrawerItem text="Home" url="/" img={} /> */}
                        <DrawerItem text="/viz/results" url="" img={raceImage} />
                        <DrawerItem text="/viz/circuits" url="" img={circuitImage} />
                        <DrawerItem text="/viz/laptimes" url="" img={lapTimeImage} />
                        <DrawerItem text="/viz/stretegies" url="" img={strategyImage} />
                    </List>
                </Box>
            </Drawer>
        </>
    );
}

export default Drawer;