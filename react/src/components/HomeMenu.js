import { Link } from "react-router-dom";

const HomeMenu = () => {
    return (
        <>
            <div>
                <Link to="/results">
                    <button>Results</button>
                </Link>
            </div>
            <div>
                <Link to="/circuits">
                    <button>Circuits</button>
                </Link>
            </div>
            <div>
                <Link to="/laptimes">
                    <button>Lap times</button>
                </Link>
            </div>
            <div>
                <Link to="/strategies">
                    <button>Strategies</button>
                </Link>
            </div>
        </>
    );
}

export default HomeMenu;