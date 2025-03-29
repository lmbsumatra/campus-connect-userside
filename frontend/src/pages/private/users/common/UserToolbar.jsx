import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import "./userToolbarStyles.css";

export const UserToolbar = ({ user, isYou }) => {
  return (
    <div className="owner-info">
      <div className="user-link">
        <img
          src={user?.profilePic || userProfilePicture}
          alt="Profile picture"
          className="profile-avatar"
        />
        <div>
          {isYou ? (
            <span className="username">
              {user && user.fname && user.lname
                ? `${user.fname} ${user.lname}`
                : "You"}
            </span>
          ) : (
            <a href={``} className="username">
              {user && user.fname && user.lname
                ? `${user.fname} ${user.lname}`
                : "You"}
            </a>
          )}
        </div>
      </div>
      <div className="rating-label">Rating</div>
      <button className="btn btn-rectangle primary" disabled={isYou}>
        View Listings
      </button>
      <button className="btn btn-rectangle secondary" disabled={isYou}>
        View Profile
      </button>
    </div>
  );
};

export default UserToolbar;
