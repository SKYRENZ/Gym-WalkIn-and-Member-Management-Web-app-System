import '../../css/counter/SearchBar.css'
import SearchIcon from '../../assets/Search.png'

function SearchBar() {
    return (
        <div className="search-bar-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search"
            />
            <button className="search-button">
                <img src={SearchIcon} alt = "Search"/>
            </button>
        </div>
    );
}

export default SearchBar;
