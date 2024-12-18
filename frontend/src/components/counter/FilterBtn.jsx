import '../../css/counter/FilterBtn.css'
import FilterIcon from '../../assets/Filter.png'
import React, { useState } from 'react';
import FilterModal from './FilterModal.jsx';

function FilterBtn({ onApply }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <button className="filter-button" onClick={openModal}>
                Filter
                <img src={FilterIcon} alt="Filter" className="filter-icon" />
            </button>
            <FilterModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onApply={onApply}
            />
        </>
    );
}

export default FilterBtn;