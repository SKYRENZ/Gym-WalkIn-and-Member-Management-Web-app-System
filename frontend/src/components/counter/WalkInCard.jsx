import walkInIcon from '../../assets/walk-in icon.svg';

function WalkedInCard() {
    return (
        <div className="card walked-in">
            <h3>Walked In</h3>
            <p>Walk-in Entries</p>
            <div className="number">20</div>
            <div className="icon">
                <img src={walkInIcon} alt="Walk-in Icon" />
            </div>
        </div>
    );
}

export default WalkedInCard;