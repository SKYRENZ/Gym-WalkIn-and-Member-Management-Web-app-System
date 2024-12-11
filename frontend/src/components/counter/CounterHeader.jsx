import '../../css/counter/CounterHeader.css';
import dropdown from '../../assets/Dropdown.png';
import BrandName from '../BrandName.jsx';

function CounterHeader() {
    return (
      <header>
        <BrandName />
  
        <div className="user-info">
          <div>
            <p className="user">Laurenz</p>
            <p className="role">Receptionist</p>
          </div>
          <img src={dropdown} alt="Dropdown" />
        </div>
      </header>
    );
  }
  
  export default CounterHeader;