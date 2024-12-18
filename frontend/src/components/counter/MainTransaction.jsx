import React, { useState } from 'react';
import SearchBar from './SearchBar.jsx';
import FilterBtn from './FilterBtn.jsx';
import TransactionTable from './TransactionTable.jsx';
import '../../css/counter/MainTransaction.css';

function MainTransaction() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="transactionContainer">
            <div className="top-bar">
                <h1>Transaction Logs</h1>
                <div className="search-filter-container">
                    <SearchBar onSearch={handleSearch} />
                    <FilterBtn />
                </div>
            </div>
            <TransactionTable searchTerm={searchTerm} />
        </div>
    );
}

export default MainTransaction;