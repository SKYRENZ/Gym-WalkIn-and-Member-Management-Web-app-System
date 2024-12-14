import React from 'react';
import Modal from 'react-modal';
import '../../css/admin/TotalRecordsModal.css';
import BackIcon from '../../assets/Back.png';

Modal.setAppElement('#root'); // Set the root element for accessibility

const TotalRecordsModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Total Records Modal"
      className="totalRecordsModalContent"
      overlayClassName="totalRecordsModalOverlay"
    >
      <div className="AccountHeader">
        <button className="accountBackButton" onClick={onClose}>
          <img src={BackIcon} alt="Back Icon" />
        </button>
        <h2>Total Records</h2>
      </div>

      <div className="customer-name">
        <h2>N/A</h2> {/* Placeholder for customer name */}
      </div>
      
      <div className="records-table">
        <table className="customer-table">
          <thead>
            <tr className="table-header">
              <th>Payment Amount</th>
              <th>Payment Method</th>
              <th>Date of Payments</th>
            </tr>
          </thead>
          <tbody>
            {/* Placeholder rows for data */}
            <tr className="table-row">
              <td>N/A</td> {/* Placeholder for payment amount */}
              <td>N/A</td> {/* Placeholder for payment method */}
              <td>N/A</td> {/* Placeholder for payment date */}
            </tr>
            <tr className="table-row">
              <td>N/A</td> {/* Placeholder for payment amount */}
              <td>N/A</td> {/* Placeholder for payment method */}
              <td>N/A</td> {/* Placeholder for payment date */}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="total-info">
        <p>Total Entries: <span>N/A</span></p> {/* Placeholder for total entries */}
        <p>Total Payment: <span>N/A</span></p> {/* Placeholder for total payment */}
      </div>
    </Modal>
  );
};

export default TotalRecordsModal;