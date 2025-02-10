import "./userCardStyles.css";
const UserCard = () => {
  console.log();
  return (
    <div className="user-card">
      <div className="user">
        <div className="user-img">
          <img alt="User profile" />
        </div>

        <div className="user-details">
          <span>Missy Sumatra</span>
          <span>COS Rating</span>
          <div className="mutuals-container">
            <div className="mutual-user">
              <div className="user-img">
                <img alt="User profile" />
              </div>
              <div className="user-img">
                <img alt="User profile" />
              </div>
              <div className="user-img">
                <img alt="User profile" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-btns">
        <button className="btn btn-rectangle primary">Follow</button>
        <button className="btn btn-rectangle secondary">Message</button>
      </div>
    </div>
  );
};

export default UserCard;
