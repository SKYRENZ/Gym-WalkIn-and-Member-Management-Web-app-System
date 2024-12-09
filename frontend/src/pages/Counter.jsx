import React from 'react';
import TransactionsTable from '../components/counter/TransactionsTable';  // Import TransactionsTable
import Overview from '../components/counter/Overview';

const Counter = () => {  // Ensure this is only declared once
  return (
    <div className="counter-page">
      <h1>Counter Dashboard</h1>
      <TransactionsTable />  {/* Use the TransactionsTable component */}
      {/* Add other components or content as needed */}
    </div>
  );
};

export default Counter;
