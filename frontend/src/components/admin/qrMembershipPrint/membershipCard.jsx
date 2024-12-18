import React, { forwardRef } from 'react';
import '../../../css/admin/membershipCard.css';

const MembershipCard = forwardRef(({ qrCodePath, member }, ref) => {
  const handleImageError = () => {
    console.error(`Image not found: ${qrCodePath}`);
    debugger; // Add debugger if image is not found
  };

  const handleImageLoad = () => {
    console.log(`Image loaded: ${qrCodePath}`);
    debugger; // Add debugger if image is found
  };

  return (
    <div ref={ref} className="membership-card">
      <div className="card-header">
        <div className="header-left">
          <img src="/src/assets/Gym Icon.svg" alt="Gym Icon" className="gym-icon" 
          style={{ width: '40px', height: '40px' }}
          />
        </div>
        <div className="header-right">
          <h1>CAVIN FITNESS GYM</h1>
          <span>MEMBER CARD</span>
        </div>
      </div>
      <div className="card-body">
        <div className="left-side">
          <p className="member-title">Member Name</p>
          <p className="member-name">{member.name}</p>
          <p>
            <img src="/src/assets/Phone.svg" alt="Phone Icon" style={{ width: '20px', height: '20px' }} /> 0995 922 6260
          </p>
          <p>
            <img src="/src/assets/Letter.svg" alt="Letter Icon" style={{ width: '20px', height: '20px' }} /> alvinagas73@gmail.com
          </p>
        </div>
        <div className="right-side">
          <div className="qr-container">
            <img
              src={qrCodePath}
              alt="QR Code"
              className="qr-code"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            <span className="member-label">GYM MEMBER</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MembershipCard;