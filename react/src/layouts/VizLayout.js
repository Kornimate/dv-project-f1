import { Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import { Toolbar, AppBar } from "@mui/material";
import Drawer from "../components/Drawer";
const VizLayout = () => {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Drawer />
                </Toolbar>
            </AppBar>
            <Box sx={{ width: '100%', height: "90vh"}}>
                <Outlet />
            </Box>
        </>
    );
}

export default VizLayout;