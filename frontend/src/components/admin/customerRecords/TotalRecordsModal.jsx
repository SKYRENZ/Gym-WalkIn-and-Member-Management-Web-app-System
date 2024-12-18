import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../../../css/admin/TotalRecordsModal.css';
import BackIcon from '../../../assets/Back.png';
import api from '../../../api';
import PropTypes from 'prop-types';

Modal.setAppElement('#root'); // Set the root element for accessibility

const TotalRecordsModal = ({ isOpen, onClose, customerName }) => {
  const [totalRecords, setTotalRecords] = useState(null);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerRecords = async () => {
      if (isOpen && customerName) {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch total records (existing endpoint)
          const totalRecordsResponse = await api.get(`/getCustomerMember_TotalRecords/${customerName}`);
          setTotalRecords(totalRecordsResponse.data);

          // Fetch detailed payment records (new endpoint from previous suggestion)
          const paymentRecordsResponse = await api.get(`/getCustomerPaymentRecords/${customerName}`);
          setPaymentRecords(paymentRecordsResponse.data);
        } catch (err) {
          console.error('Error fetching customer records:', err);
          setError('Failed to fetch customer records');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCustomerRecords();
  }, [isOpen, customerName]);

  if (isLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="totalRecordsModalContent"
        overlayClassName="totalRecordsModalOverlay"
      >
        <div className="loading-container">Loading...</div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="totalRecordsModalContent"
        overlayClassName="totalRecordsModalOverlay"
      >
        <div className="error-container">{error}</div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
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
        <h2>{customerName}</h2>
      </div>
      
      <div className="table-container">
        <table className="records-table">
          <thead>
            <tr>
              <th className="records-table-header">Payment Amount</th>
              <th className="records-table-header">Payment Method</th>
              <th className="records-table-header">Date of Payments</th>
            </tr>
          </thead>
          <tbody>
            {paymentRecords.length > 0 ? (
              paymentRecords.map((record, index) => (
                <tr key={index} className="records-table-row">
                  <td className="records-table-cell">₱{parseFloat(record.amount).toFixed(2)}</td>
                  <td className="records-table-cell">{record.method}</td>
                  <td className="records-table-cell">{new Date(record.payment_date).toLocaleDateString('en-PH')}</td>
                </tr>
              ))
            ) : (
              <tr className="records-table-row">
                <td className="records-table-cell" colSpan="3">No payment records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="total-info">
        <div className='total-info-left'>
          <p><strong>Total Check-ins: </strong><span>{totalRecords?.total_checkins || 0}</span></p>
          <p><strong>Total Payments: </strong><span>{totalRecords?.total_payments || 0}</span></p>
        </div>
        <div>
          <p><strong>Total Payment Amount: </strong><span>₱{parseFloat(totalRecords?.total_payment || 0).toFixed(2)}</span></p>
        </div>
      </div>
    </Modal>
  );
};

TotalRecordsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customerName: PropTypes.string.isRequired
};

export default TotalRecordsModal;