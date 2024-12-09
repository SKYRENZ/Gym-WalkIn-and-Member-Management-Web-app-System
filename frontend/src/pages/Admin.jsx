import Header from '../components/admin/Header.jsx';
import Navigation from '../components/admin/Navigation.jsx';
import MemberTracking from '../components/admin/MemberTracking.jsx';
import MemberCounting from '../components/admin/MemberCounting.jsx';
import IncomeSummary from '../components/admin/IncomeSummary.jsx';
import Workspace from '../components/admin/Workspace.jsx';
import '../css/admin/Admin.css';
import React from 'react';


function Admin() {
  return (
    <>
      <Header />
      <div className="container">
        <div className="leftPane">
          <Navigation />
          <MemberTracking />
          <MemberCounting />
          <IncomeSummary />
        </div>
        <div className="rightPane">
          <Workspace />
        </div>
      </div>
    </>
  );
}

export default Admin;