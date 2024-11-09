import { Link } from 'react-router-dom';
import '../styles/NotFound.css'

const NotFound = () => {
    return (
        <>
            <h1>
                404 Not Found
            </h1>
            <div>
                <Link to="/">
                    <button>
                        <h2>
                            Home
                        </h2>
                    </button>
                </Link>
            </div>
        </>
    )
}

export default NotFound;