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
        <h1>CAVIN FITNESS GYM</h1>
        <span>MEMBER CARD</span>
      </div>
      <div className="card-body">
        <div className="left-side">
          <h2>Member Name</h2>
          <p>{member.name}</p>
          <p>📞 0995 922 6260</p>
          <p>📧 alvinagas73@gmail.com</p>
        </div>
        <div className="right-side">
          <div className="qr-container">
            <img
              src={qrCodePath}
              alt="QR Code"
              className="qr-code"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ width: '100px', height: '100px' }} // Limit size to 50px by 50px
            />
            <span className="member-label">GYM MEMBER</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MembershipCard;