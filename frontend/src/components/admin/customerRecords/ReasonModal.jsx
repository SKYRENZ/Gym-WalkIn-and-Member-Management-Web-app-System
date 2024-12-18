import React from 'react';
import Modal from 'react-modal';
import "../../../css/admin/ReasonModal.css";

const ReasonModal = ({ isOpen, onClose, selectedRow, deactivationReason, setDeactivationReason, handleDeactivate }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Deactivate Account Modal"
      className="reasonModalContent"
      overlayClassName="reasonModalOverlay"
    >
      <h2>Deactivate Account</h2>
      <p>Are you sure you want to deactivate the account for <strong>{selectedRow !== null ? `${selectedRow}` : ""}</strong>?</p>
      <textarea
        placeholder="Reason for deactivation"
        value={deactivationReason}
        onChange={(e) => setDeactivationReason(e.target.value)}
      />
      <div className="reasonModalButtons">
        <button className="Cancelbtn" onClick={onClose}>Cancel</button>
        <button className="Confirmbtn" onClick={handleDeactivate}>Confirm</button>
      </div>
    </Modal>
  );
};

export default ReasonModal;