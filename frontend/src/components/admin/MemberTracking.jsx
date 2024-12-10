import '../../css/admin/MemberTracking.css';
import DatePicker from './DatePicker';

function MemberTracking() {
  return (
    <div className="member-tracking">
      <div className="member-tracking-header">
        <h1>Member Tracking</h1>
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
              <td>Laurenz Listangco</td>
              <td>10:00:00</td>
              <td>Walk In</td>
              <td>Payamaya</td>
              <td>Paid</td>
            </tr>
          </tbody>
        </table>
    </div>
  );
}

export default MemberTracking;