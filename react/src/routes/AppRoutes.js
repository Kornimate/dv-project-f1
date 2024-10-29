import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from '../pages/HomePage';
import CircuitsPage from '../pages/CircuitsPage';
import LapTimesPage from '../pages/LapTimesPage';
import RaceResultsPage from '../pages/RaceResultsPage';
import StrategiesPage from '../pages/StrategiesPage';
import NotFound from '../pages/NotFound';
import Layout from '../layouts/Layout';

const AppRoutes = () => {
    return (
        // <Router>
        //     <Routes>
        //         <Route path='/' element={<TestPage />} />
        //     </Routes>
        // </Router>

        <Router>
            <Routes>
                <Route path='/' element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path='circuits' element={<CircuitsPage />} />
                    <Route path='laptimes' element={<LapTimesPage />} />
                    <Route path='results' element={<RaceResultsPage />} />
                    <Route path='strategies' element={<StrategiesPage />} />
                    <Route path='*' element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default AppRoutes;