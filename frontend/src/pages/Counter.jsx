import CounterHeader from '../components/counter/CounterHeader.jsx';
import SummaryCards from '../components/counter/SummaryCards.jsx';
import TopBar from '../components/counter/TopBar.jsx';
import '../css/counter/Counter.css';

function Counter(){
    return (
        <>
        <CounterHeader />
        <div className="counterContainer">
            <div className="top">
                <TopBar />
                <SummaryCards />
            </div>
        </div>
        </>
    );
}

export default Counter;