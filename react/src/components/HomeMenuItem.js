import { Link } from "react-router-dom";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

const HomeMenuItem = ({url, title, img}) => {
    return (
        <Link to={url}>
            <Card sx={{ 
                width: 200,
                    ':hover': {
                    boxShadow: 20,
                },
                padding: '10px',
                margin: '10px'
            }}
            variant="outlined">
            <CardMedia
                sx={{ height: 200 }}
                image={img}
                title={title}
            />
            <CardContent>
                <Typography gutterBottom variant="h5" component="div" sx={{ textDecoration: 'none' }}>
                    {title}
                </Typography>
            </CardContent>
            </Card>
        </Link>
    );
}

export default HomeMenuItem;