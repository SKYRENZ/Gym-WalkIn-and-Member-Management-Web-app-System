import newMemberIcon from '../../assets/new member icon.svg';

function NewMembersCard() {
    return (
        <div className="card new-members">
            <h3>New Members</h3>
            <p>Recently Registered Members</p>
            <div className="number">18</div>
            <div className="icon">
                <img src={newMemberIcon} alt="New Member Icon" />
            </div>
        </div>
    );
}

export default NewMembersCard;