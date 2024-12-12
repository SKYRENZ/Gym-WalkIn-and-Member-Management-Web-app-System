import '../../css/counter/FilterBtn.css'
import FilterIcon from '../../assets/Filter.png'

function FilterBtn() {
    return (
        <button className="filter-button">
            Filter
            <img src = {FilterIcon} alt = "Filter" className="filter-icon"/>
        </button>
    );
}

export default FilterBtn;