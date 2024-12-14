import { Routes, Route } from "react-router-dom"; // Import Routes and Route
import AdminHeader from "../components/admin/AdminHeader.jsx";
import Navigation from "../components/admin/Navigation.jsx";
import CustomerRecords from "../components/admin/CustomerRecords.jsx"; // Import CustomerRecords component
import MemberCounting from "../components/admin/MemberCounting.jsx";
import IncomeSummary from "../components/admin/IncomeSummary.jsx";
import "../css/admin/Admin.css";

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
          {/* Ensure the correct route is loaded here */}
          <Routes>
            <Route path="customer-records" element={<CustomerRecords />} />
            {/* Additional routes can be added here */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Admin;
