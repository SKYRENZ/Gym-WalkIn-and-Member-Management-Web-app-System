
import PropTypes from 'prop-types';

const WalkInForm = ({ details, onChange }) => {
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <label className="input-label">Full Name</label>
                <input 
                    className="input-field"
                    type="text"
                    value={details.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="Enter Full Name"
                />
            </div>

            <div className="input-wrapper">
                <label className="input-label">Phone Number</label>
                <input 
                    className="input-field"
                    type="tel"
                    value={details.phoneNumber}
                    onChange={(e) => onChange('phoneNumber', e.target.value)}
                    placeholder="Enter Phone Number"
                />
            </div>

            <div className="input-wrapper">
                <label className="input-label">Email (Optional)</label>
                <input 
                    className="input-field"
                    type="email"
                    value={details.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    placeholder="Enter Email (Optional)"
                />
            </div>
        </div>
    );
};

WalkInForm.propTypes = {
    details: PropTypes.shape({
        name: PropTypes.string,
        phoneNumber: PropTypes.string,
        email: PropTypes.string
    }).isRequired,
    onChange: PropTypes.func.isRequired
};

export default WalkInForm;