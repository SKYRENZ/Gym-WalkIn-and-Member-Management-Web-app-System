import React from 'react';
import PropTypes from 'prop-types';
import '../../../css/admin/VoucherModal.css';

function MoreInfoBtn({ onMoreInfoBtn, disabled }) {
    return (
        <button className="moreInfoBtn" onClick={onMoreInfoBtn} disabled={disabled}>
            More Info
        </button>
    );
}

MoreInfoBtn.propTypes = {
    onMoreInfoBtn: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

MoreInfoBtn.defaultProps = {
    disabled: false,
};

export default MoreInfoBtn;