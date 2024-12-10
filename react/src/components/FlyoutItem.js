import { ListItem, ListItemText, ListItemIcon, ListItemButton, Box } from '@mui/material';
import { Link } from "react-router-dom";
import '../styles/FlyoutItem.css'

const FlyoutItem = ({text, url,  img, icon}) => {
    return (
        <Link to={url} style={{textDecoration: 'none', color: 'black'}}>
            <ListItem key={text} disablePadding className='fl-item'>
                <ListItemButton sx={{'&:hover': { backgroundColor: '#C0C0C0'}}}>
                    <ListItemIcon>
                        { icon === null || icon === undefined ? <Box
                                component="img"
                                sx={{
                                    height: '10vh',
                                    width: '10vh',
                                    maxHeight: { xs: 233, md: 167 },
                                    maxWidth: { xs: 350, md: 250 },
                                }}
                                alt="The house from the offer."
                                src={img}
                            />
                            :
                            icon}
                    </ListItemIcon>
                    <ListItemText primary={text} sx={{color: 'black'}}/>
                </ListItemButton>
            </ListItem>
        </Link>
    );
}

export default FlyoutItem;