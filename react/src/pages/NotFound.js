import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <>
            <h1>
                404 Not Found
            </h1>
            <div>
                <Link to="/">
                    <button>Home</button>
                </Link>
            </div>
        </>
    )
}

export default NotFound;