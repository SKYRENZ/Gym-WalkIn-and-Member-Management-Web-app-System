import '../../css/counter/CheckInBtn.css';

function CheckInBtn({ onCheckInClick }) {
    return (
        <button className="checkInButton" onClick={onCheckInClick}>
            Check In
        </button>
    );
}

export default CheckInBtn;