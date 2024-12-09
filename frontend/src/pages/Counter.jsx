import { useState } from 'react';
import TransactionsTable from '../components/counter/TransactionsTable';  // Import TransactionsTable
import Overview from '../components/counter/Overview';
import TransactionTypePopup from '../components/counter/TransactionTypePopup'; // Import the popup component

const Counter = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);

  const handleNewTransactionClick = () => {
      setPopupVisible(true);
  };

  const handleClosePopup = () => {
      setPopupVisible(false);
  };

  return (
      <div className="counter-page">
          <h1>Counter Dashboard</h1>
          <div className="button-container">
              <button className="new-transaction-button" onClick={handleNewTransactionClick}>
                  New Transaction
              </button>
          </div>
          {isPopupVisible && <TransactionTypePopup onClose={handleClosePopup} />}
          <TransactionsTable />
          <Overview />
      </div>
  );
};

export default Counter;