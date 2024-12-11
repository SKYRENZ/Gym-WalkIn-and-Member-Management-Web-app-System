import  { useEffect, useState } from 'react';
import '../../css/admin/MemberTracking.css';
import DatePicker from './DatePicker';

function MemberTracking() {
  const [customerData, setCustomerData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/customerTracking?date=${date}`);
        console.log('Response status:', response.status); // Log the response status
        const responseText = await response.text(); // Get the response text
        console.log('Response body:', responseText); // Log the response body
    
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} - ${responseText}`);
        }
    
        const data = JSON.parse(responseText); // Parse the response text as JSON
        console.log('Fetched customer data:', data);
        setCustomerData(data);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    fetchCustomerData();
  }, [date]); // Fetch data whenever the date changes

  return (
    <div className="member-tracking">
      <div className="member-tracking-header">
        <h1>Customer Tracking</h1>
        <DatePicker setDate={setDate} /> {/* Pass setDate to DatePicker to update the date */}
      </div>
      <table className="member-tracking-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Timestamp</th>
            <th>Role</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customerData.map((customer, index) => (
            <tr key={index}>
              <td>{customer.name}</td>
              <td>{customer.timestamp}</td>
              <td>{customer.role}</td>
              <td>{customer.payment || 'N/A'}</td>
              <td>{customer.status || 'Active'}</td> {/* Assuming status is not provided in the response */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTracking;