// src/components/counter/TopBar.jsx
import CheckInBtn from './CheckInBtn.jsx';
import NewTransactionBtn from './NewTransactionBtn.jsx';
import '../../css/counter/TopBar.css';

function TopBar({ onCheckInClick, onNewTransactionClick }) {
    return (
        <div className="topbarContainer">
            <h1>Overview</h1>
            <div className="buttonContainer">
                <CheckInBtn onCheckInClick={onCheckInClick} />
                <NewTransactionBtn onClick={onNewTransactionClick} /> {/* Pass the click handler */}
            </div>
        </div>
    );
}

export default TopBar;