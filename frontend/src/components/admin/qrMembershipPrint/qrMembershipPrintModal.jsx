import React from 'react';
import '../../../css/admin/qrMembershipPrint/qrMembershipPrint.css';

const QrMembershipPrintModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content qr-member-print">
        {/* Header */}
        <div className="modal-header">
          <div className="text-wrapper-9">Qr Membership Print</div>
          <img className="left" src="back-icon.png" alt="Back" onClick={onClose} />
        </div>

        {/* Divider */}
        <img className="img" src="divider.png" alt="Divider" />

        {/* Main Content */}
        <div className="group-4">
          {/* Left Section */}
          <div className="group-5">
            <div className="transaction-search">
              <div className="frame">
                <img className="vector" src="search-icon.png" alt="Search" />
                <div className="text-wrapper-10">Search</div>
              </div>
            </div>
            <div className="group-627">
              <h3>Members</h3>
              <ul>
                <li>Juan Dela Cruz</li>
                <li>Maria Santos</li>
                <li>Carlos Reyes</li>
                <li>Ana Mendoza</li>
                <li>Luis Aquino</li>
                <li>Gary Vasquez</li>
              </ul>
            </div>
          </div>

          {/* Right Section */}
          <div className="group-629">
            <h3>Preview:</h3>
            <div className="preview-area"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrMembershipPrintModal;