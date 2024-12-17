import React, { useState, useRef } from 'react';
import Modal from 'react-modal';
import useMembers from '../../../hooks/useMembers';
import '../../../css/admin/qrMembershipPrintModal.css';
import backIcon from '../../../assets/Back.png'; // Import the back icon
import searchIcon from '../../../assets/Search.png'; // Import the search icon
import MembershipCard from './membershipCard'; // Import the MembershipCard component
import html2pdf from 'html2pdf.js';

// Set the app element for accessibility
Modal.setAppElement('#root');

const QrMembershipPrintModal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const { members, loading, error } = useMembers();
  const cardRef = useRef();

  console.log('Members:', members);
  console.log('Loading:', loading);
  console.log('Error:', error);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleItemClick = (member) => {
    console.log('Clicked member:', member);
    setSelectedMember(member);
  };

  const handlePrint = () => {
    const element = cardRef.current;
    const opt = {
      margin: 1,
      filename: 'membership_card.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderListItems = () => {
    if (loading) return <li>Loading...</li>;
    if (error) return <li>{error}</li>;
    if (!filteredMembers.length) return <li>No records found</li>;

    return filteredMembers.map((member) => (
      <li key={member.membership_id} onClick={() => handleItemClick(member)} className="clickable">
        {member.name}
      </li>
    ));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Qr Membership Print"
      className="qr-modal-content qr-member-print"
      overlayClassName="qr-modal-overlay"
    >
      {/* Header */}
      <div className="modal-header">
        <img className="left" src={backIcon} alt="Back" onClick={onClose} />
        <div className="text-wrapper-9">Qr Membership Print</div>
      </div>

      {/* Main Content */}
      <div className="qr-modal-body">
        {/* Left Section */}
        <div className="left-section">
          <div className="transaction-search-container">
            <div className="transaction-search">
              <div className="search-container">
                <img className="vector" src={searchIcon} alt="Search" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search"
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          <div className="members-list">
            <h2>Members</h2>
            <hr className="members-divider" />
            <ul>
              {renderListItems()}
            </ul>
          </div>
        </div>

        {/* Right Section */}
        <div className="qr-preview-container">
          <h3>Preview:</h3>
          <div className="preview-area">
            {selectedMember && (
              <MembershipCard
                ref={cardRef}
                member={selectedMember}
                qrCodePath={`/images/qrcodes/${selectedMember.membership_id}.png`}
              />
            )}
          </div>
          <button onClick={handlePrint}>Print</button> {/* Add print button */}
        </div>
      </div>
    </Modal>
  );
};

export default QrMembershipPrintModal;