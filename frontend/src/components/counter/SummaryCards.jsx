import '../../css/counter/SummaryCards.css';
import CheckedInCard from './CheckinCard.jsx';
import WalkedInCard from './WalkInCard.jsx';
import NewMembersCard from './NewMembersCard.jsx';
import VoucherCodesCard from './VoucherCodesCard.jsx';
import PropTypes from 'prop-types';

function SummaryCards({ checkinCount }) {
    return (
        <div className="summary-card-container">
            <CheckedInCard checkinCount={checkinCount} className="checked-in-card" />
            <WalkedInCard className="walked-in-card" />
            <NewMembersCard className="new-members-card" />
            <VoucherCodesCard className="voucher-codes-card" />
        </div>
    );
}

// Add prop-types validation
SummaryCards.propTypes = {
    checkinCount: PropTypes.number.isRequired
};

export default SummaryCards;