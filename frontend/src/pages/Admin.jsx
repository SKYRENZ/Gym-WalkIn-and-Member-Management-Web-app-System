import AdminHeader from '../components/admin/AdminHeader.jsx';
import Navigation from '../components/admin/Navigation.jsx';
import CustomerTracking from '../components/admin/CustomerTracking.jsx';
import MemberCounting from '../components/admin/MemberCounting.jsx';
import IncomeSummary from '../components/admin/IncomeSummary.jsx';
import '../css/admin/Admin.css';



function Admin() {
  return (
    <div className="admin-page">
      <AdminHeader />
      <div className="container">
        <div className="leftPane">
          <Navigation />
          <MemberCounting />
          <IncomeSummary />
        </div>
        <div className="rightPane">
          <CustomerTracking />
        </div>
      </div>
    </div>
  );
}

export default Admin;