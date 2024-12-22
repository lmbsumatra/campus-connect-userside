import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import "./userToolbarStyles.css";

export const UserToolbar = ({ user }) => {
  return (
    <div className="owner-info">
      <div className="user-link">
        <img
          src={userProfilePicture}
          alt="Profile picture"
          className="profile-avatar"
        />
        <div>
          <a href={``} className="username">
            {user && user.fname && user.lname
              ? `${user.fname} ${user.lname}`
              : "You"}
          </a>
        </div>
      </div>
      <div className="rating-label">Rating</div>
      <button className="btn btn-rectangle primary">View Listings</button>
      <button className="btn btn-rectangle secondary">View Profile</button>
    </div>
  );
};

export default UserToolbar;
