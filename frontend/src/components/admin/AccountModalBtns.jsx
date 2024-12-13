import React from 'react';
import PropTypes from 'prop-types';
import '../../css/admin/AccountModal.css';

function AccountModalBtns({ onAddAccount, onEditAccount, onDeactivate, isEditDisabled, isDeactivateDisabled }) {
    return (
        <div className="accountModalButtons">
            <button onClick={onAddAccount}>Add Account</button>
            <button onClick={onEditAccount} disabled={isEditDisabled}>Edit</button>
            <button onClick={onDeactivate} disabled={isDeactivateDisabled}>Deactivate</button>
        </div>
    );
}

AccountModalBtns.propTypes = {
    onAddAccount: PropTypes.func.isRequired,
    onEditAccount: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
    isEditDisabled: PropTypes.bool.isRequired,
    isDeactivateDisabled: PropTypes.bool.isRequired,
};

export default AccountModalBtns;