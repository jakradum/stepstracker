import { BrowserRouter as Router } from 'react-router-dom';
import Home from './Home';
import './index.css';

function App() {
  return (
    <Router>
      <Home />
    </Router>
  );
}

export default App;