import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import "./userToolbarStyles.css";

export const UserToolbar = ({ user, isAdmin = true }) => {
  return (
    <div className="owner-info">
      <div className="user-link">
        <img
          src={userProfilePicture}
          alt="Profile picture"
          className="profile-avatar"
        />
        <div>
          {user.fname} {user.lname}
        </div>
      </div>
      <div className="rating-label">Rating</div>
      <button className="btn btn-rectangle primary" disabled={isAdmin}>
        View Listings
      </button>
      <button className="btn btn-rectangle secondary" disabled={isAdmin}>
        View Profile
      </button>
    </div>
  );
};

export default UserToolbar;
