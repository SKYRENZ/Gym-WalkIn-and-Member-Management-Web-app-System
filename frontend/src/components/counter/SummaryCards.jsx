
import '../../css/counter/SummaryCards.css';
import CheckedInCard from './CheckinCard.jsx';
import WalkedInCard from './WalkInCard.jsx';
import NewMembersCard from './NewMembersCard.jsx';
import VoucherCodesCard from './VoucherCodesCard.jsx';
import PropTypes from 'prop-types';
function SummaryCards({ checkinCount }) {
    return (
        <div className="card-container">
            <CheckedInCard checkinCount={checkinCount} />
            <WalkedInCard />
            <NewMembersCard />
            <VoucherCodesCard />
        </div>
    );
}
// Add prop-types validation
SummaryCards.propTypes = {
    checkinCount: PropTypes.number.isRequired
};

export default SummaryCards;