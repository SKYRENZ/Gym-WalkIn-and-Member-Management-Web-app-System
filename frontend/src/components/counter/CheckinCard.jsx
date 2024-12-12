import checkInIcon from '../../assets/check-in icon.svg';

function CheckedInCard() {
    return (
        <div className="card checked-in">
            <h3>Checked-In</h3>
            <p>Check-in Entries</p>
            <div className="number">13</div>
            <div className="icon">
                <img src={checkInIcon} alt="Check-in Icon" />
            </div>
        </div>
    );
}

export default CheckedInCard;