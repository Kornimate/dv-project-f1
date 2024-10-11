import './App.css';
import TrackView from "./components/TrackView";
import AppRoutes from './routes/AppRoutes.js';

function App() {
  return (
    <div className="App">
      <TrackView />
      <AppRoutes />
    </div>
  );
}

export default App;
