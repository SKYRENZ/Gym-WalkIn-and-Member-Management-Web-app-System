import CheckInBtn from './CheckInBtn.jsx';
import NewTransactionBtn from './NewTransactionBtn.jsx';
import '../../css/counter/TopBar.css';

function TopBar({ onCheckInClick }) {
    return (
        <div className="topbarContainer">
            <h1>Overview</h1>
            <div className="buttonContainer">
                <CheckInBtn onCheckInClick={onCheckInClick} />
                <NewTransactionBtn />
            </div>
        </div>
    );
}

export default TopBar;