import CheckIn from './CheckInBtn.jsx';
import NewTransaction from './NewTransactionBtn.jsx';
import '../../css/counter/TopBar.css';


function TopBar() {
    return (
        <div className= "topbarContainer">
            <h1>Overview</h1>
            <div className="buttonContainer">
                <CheckIn />
                <NewTransaction />
            </div>
        </div>
    );
}

export default TopBar;