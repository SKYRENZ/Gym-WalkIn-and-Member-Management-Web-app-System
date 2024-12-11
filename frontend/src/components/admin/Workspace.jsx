import '../../css/admin/Workspace.css';
import AccountCreation from './AccountCreation.jsx';

function Workspace() {
  return (
    <>
    <div className="workspace">
      <h1>Workspace</h1>
      
        <div className="navworkspace">
          <AccountCreation />
        </div>
    </div>
    </>
  );
}

export default Workspace;