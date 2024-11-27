import './App.css';
import RaceResults from './components/RaceResults.js';
import RaceStandings from './components/RaceStandings';
import LapStandings from './components/LapStandings';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route index element={<LapStandings />}/>
        </Routes>
      </Router>
      
    </div>
  );
}


export default App;
