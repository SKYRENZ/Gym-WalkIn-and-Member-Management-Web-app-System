import React from 'react';
import TransactionsTable from '../components/counter/TransactionsTable';
import Overview from '../components/counter/Overview';
import CreateStaffForm from '../components/staff/CreateStaffForm';  // Import the CreateStaffForm component

const Counter = () => {
  return (
    <div className="counter-page">
      <h1>Counter Dashboard</h1>
      <TransactionsTable />
      <Overview />
      <CreateStaffForm />  {/* Add the CreateStaffForm component */}
    </div>
  );
};

export default Counter;