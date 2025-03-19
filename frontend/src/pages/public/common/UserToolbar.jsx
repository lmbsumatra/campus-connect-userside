import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import "./userToolbarStyles.css";

export const UserToolbar = ({ user, isYou }) => {
  // console.log(user, isYou);
  return (
    <div className="owner-info">
      <div className="user-link">
        <img
          src={userProfilePicture}
          alt="Profile picture"
          className="profile-avatar"
        />
        <div>
          {isYou ? (
            <a href={`/profile`} className="username">
           You
          </a>
          ) : (
            user && (
              <a href={`/user/${user.id}`} className="username">
                {user.fname && user.lname
                  ? `${user.fname} ${user.lname}`
                  : "User"}
              </a>
            )
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
