import '../../css/counter/SummaryCards.css';
import CheckedInCard from './CheckinCard.jsx';
import WalkedInCard from './WalkInCard.jsx';
import NewMembersCard from './NewMembersCard.jsx';
import VoucherCodesCard from './VoucherCodesCard.jsx';

function SummaryCards() {
    return (
        <div className="card-container">
            <CheckedInCard />
            <WalkedInCard />
            <NewMembersCard />
            <VoucherCodesCard />
        </div>
    );
}

export default SummaryCards;