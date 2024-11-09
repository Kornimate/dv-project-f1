import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import { Toolbar, AppBar } from "@mui/material";
import Flyout from "../components/Flyout";
const VizLayout = () => {
    return (
        <>
            <AppBar position="static" sx={{backgroundColor: "#FF1E00"}}>
                <Toolbar>
                    <Flyout />
                </Toolbar>
            </AppBar>
            <Box sx={{ width: '100%', height: "90vh"}}>
                <Outlet />
            </Box>
        </>
    );
}

export default VizLayout;