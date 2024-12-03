import Header from './Header.jsx';
import Navigation from './Navigation.jsx';
import MemberTracking from './Member-tracking.jsx';
import MemberCounting from './Member-counting.jsx';
import IncomeSummary from './Income-summary.jsx';
import Workspace from './Workspace.jsx';
import './Admin.css';

function App() {
  return (
    <>
      <Header />
        <div className= "container">
          <div className="leftPane">
            <Navigation />
            <MemberTracking />
            <MemberCounting />
            <IncomeSummary />
          </div>
          <div className="rightPane">
            <Workspace />
          </div>
        </div>
    </>
  );
}

export default App;