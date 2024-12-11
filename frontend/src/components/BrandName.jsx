import '../css/BrandName.css';
import gymlogo from '../assets/gym-logo.png';

function BrandName() {
  return (
    <div className="brand">
            <div className="gymlogo">
            <img src ={gymlogo} alt="GymLogo" />
            </div>
            <h1 className="gymbrand">Cavin Fitness</h1>
    </div>
  );
}

export default BrandName;