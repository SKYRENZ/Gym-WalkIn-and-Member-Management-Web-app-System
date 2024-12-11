import '../../css/admin/MemberTracking.css';
import DatePicker from './DatePicker';

function MemberTracking() {
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
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

export default MemberTracking;