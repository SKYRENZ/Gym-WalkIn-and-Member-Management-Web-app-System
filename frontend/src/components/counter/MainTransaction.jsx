import React, { useState } from 'react';
import SearchBar from './SearchBar.jsx';
import FilterBtn from './FilterBtn.jsx';
import TransactionTable from './TransactionTable.jsx';
import '../../css/counter/MainTransaction.css';

function MainTransaction() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOptions, setFilterOptions] = useState({ transactionType: '', paymentMethod: '' });

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleFilterApply = (filters) => {
        setFilterOptions(filters);
    };

    return (
        <div className="transactionContainer">
            <div className="top-bar">
                <h1>Transaction Logs</h1>
                <div className="search-filter-container">
                    <SearchBar onSearch={handleSearch} />
                    <FilterBtn onApply={handleFilterApply} />
                </div>
            </div>
            <TransactionTable searchTerm={searchTerm} filterOptions={filterOptions} />
        </div>
    );
}

export default MainTransaction;