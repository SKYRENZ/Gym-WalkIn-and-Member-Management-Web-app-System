import { useCustomerTracking } from '../../hooks/useCustomerTracking';
import DatePicker from './DatePicker';
import '../../css/admin/CustomerTracking.css';

function CustomerTracking() {
  const { 
    customerData, 
    isLoading, 
    error, 
    setDate, 
    formattedDate, 
    refetch 
  } = useCustomerTracking();

  const renderHeader = () => (
    <div className="member-tracking-header">
      <div>
        <h1>Customer Tracking</h1>
        <p className="current-date">{formattedDate}</p>
      </div>
      <DatePicker setDate={setDate} />
    </div>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="member-tracking">
        {renderHeader()}
        <div className="loading-container">
          Loading customer data...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="member-tracking">
        {renderHeader()}
        <div className="error-container">
          <p>Error loading data: {error}</p>
          <button onClick={refetch}>Retry</button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!customerData || customerData.length === 0) {
    return (
      <div className="member-tracking">
        {renderHeader()}
        <div className="empty-container">
          <p>No customer data found for the selected date.</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="member-tracking">
      {renderHeader()}
      <table className="member-tracking-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Timestamp</th>
            <th>Role</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {customerData.map((customer, index) => (
            <tr key={index}>
              <td>{customer.name}</td>
              <td>{customer.timestamp}</td>
              <td>{customer.role}</td>
              <td>{customer.payment ? `₱${parseFloat(customer.payment).toFixed(2)}` : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <p>Total Entries: {customerData.length}</p>
      </div>
    </div>
  );
}

export default CustomerTracking;