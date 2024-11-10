import './App.css';
import TrackViewComponent from "./components/track/TrackComponent";
import TrackView from "./components/TrackView";
import AppRoutes from './routes/AppRoutes.js';

function App() {
  return (
    <div className="App">
      <TrackView />
      <AppRoutes />
      <TrackViewComponent />
    </div>
  );
}

export default App;
