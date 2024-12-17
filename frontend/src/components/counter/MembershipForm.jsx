

const MembershipForm = ({ details, onChange }) => {
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <label className="input-label">Name*</label>
                <input 
                    type="text" 
                    className="input-field" 
                    value={details.name} 
                    onChange={(e) => onChange('name', e.target.value)} 
                />
            </div>
            <div className="input-wrapper">
                <label className="input-label">Email*</label>
                <input 
                    type="email" 
                    className="input-field" 
                    value={details.email} 
                    onChange={(e) => onChange('email', e.target.value)} 
                />
            </div>
            <div className="input-wrapper">
                <label className="input-label">Phone Number*</label>
                <input 
                    type="text" 
                    className="input-field" 
                    value={details.phoneNumber} 
                    onChange={(e) => onChange('phoneNumber', e.target.value)} 
                />
            </div>
        </div>
    );
};

export default MembershipForm;