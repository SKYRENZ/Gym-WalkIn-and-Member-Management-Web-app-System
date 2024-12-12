import SearchBar from './SearchBar.jsx';
import FilterBtn from './FilterBtn.jsx';
import TransactionTable from './TransactionTable.jsx';
import '../../css/counter/MainTransaction.css'

function MainTransaction(){
    return(
        <div className="transactionContainer">
            <div className="top-bar">
                <h1>Transaction Logs</h1>
                <div className="search-filter-container">
                    <SearchBar />
                    <FilterBtn />
                </div>
            </div>
            <TransactionTable />
        </div>
    )
}

export default MainTransaction