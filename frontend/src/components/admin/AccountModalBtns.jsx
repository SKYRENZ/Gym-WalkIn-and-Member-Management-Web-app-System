import React from 'react';
import PropTypes from 'prop-types';
import '../../css/admin/AccountModal.css';

function AccountModalButtons({ onAddAccount, onDeactivate }) {
    return (
        <div className="accountModalButtons">
            <button onClick={onAddAccount}>Add Account</button>
            <button onClick={onDeactivate}>Deactivate</button>
        </div>
    );
}

AccountModalButtons.propTypes = {
    onAddAccount: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
};

export default AccountModalButtons;