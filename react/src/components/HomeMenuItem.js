import { Link } from "react-router-dom";
import { Card, CardMedia, CardContent, Typography, Divider } from "@mui/material";

const HomeMenuItem = ({url, title, img}) => {
    return (
        <Link to={url} style={{textDecoration: 'none', color: 'black'}}>
            <Card sx={{ 
                width: 200,
                '&:hover': {
                    boxShadow: 20,
                },
                padding: '10px 10px 0 10px',
                margin: '10px',
                backgroundColor: '#C0C0C0',
                borderWidth: 3,
                borderColor: '#1C1C1E'
            }}
            variant="outlined">
            <CardMedia
                sx={{ height: 200, marginBottom: 5 }}
                image={img}
                title={title}
            />
            <Divider />
            <CardContent sx={{alignContent: 'center'}}>
                <Typography gutterBottom variant="h6" component="div" sx={{ textDecoration: 'none' }}>
                    {title}
                </Typography>
            </CardContent>
            </Card>
        </Link>
    );
}

export default HomeMenuItem;