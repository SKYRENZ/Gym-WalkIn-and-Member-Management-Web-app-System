import '../../css/admin/CustomerTracking.css';
import DatePicker from './DatePicker';

function CustomerTracking() {
  return (
    <div className="member-tracking">
      <div className="member-tracking-header">
        <h1>Customer Tracking</h1>
        <DatePicker />
      </div>
        <table className = "member-tracking-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Timestamp</th>
              <th>Role</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
    </div>
  );
}

export default CustomerTracking;