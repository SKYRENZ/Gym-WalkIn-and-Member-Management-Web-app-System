import '../../css/counter/SearchBar.css'
import SearchIcon from '../../assets/Search.png'
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {

    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
        onSearch(term);
    };


    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="search-input"
                placeholder="Search"
            />
            <button className="search-button" onClick={handleSearch}>
                <img src={SearchIcon} alt = "Search"/>
            </button>
        </div>
    );
}

export default SearchBar;
