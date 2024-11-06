import { Outlet } from "react-router-dom";
import { Box, AppBar, Toolbar } from '@mui/material';


const HomeLayout = () => {
    return (
        <>
            <AppBar position="static">
            <Toolbar>
            </Toolbar>
        </AppBar>
            <Box sx={{ width: '100%', height: "80vh"}}>
                <Outlet />
            </Box>
        </>
    );
}

export default HomeLayout;