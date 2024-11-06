import { ListItem, ListItemText, ListItemIcon, ListItemButton, Box } from '@mui/material';
import { Link } from "react-router-dom";

const DrawerItem = ({text, url,  img}) => {
    return (
        <Link to={url}>
            <ListItem key={text} disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        <Box
                        component="img"
                        sx={{
                            height: 233,
                            width: 350,
                            maxHeight: { xs: 233, md: 167 },
                            maxWidth: { xs: 350, md: 250 },
                        }}
                        alt="The house from the offer."
                        src={img}
                        />
                    </ListItemIcon>
                <ListItemText primary={text} />
                </ListItemButton>
            </ListItem>
        </Link>
    );
}

export default DrawerItem;