import { useNavigate } from "react-router-dom";
import userProfilePicture from "../../../assets/images/icons/user-icon.svg";
import "./userToolbarStyles.css";

export const UserToolbar = ({ user, isYou, tab = "" }) => {
  const navigate = useNavigate();
  // console.log(user, isYou);
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

      <div className="d-flex">
        {user?.rating ? (
          <div className="d-flex flex-row align-items-center">
            <span className="fs-5 fw-bold text-success">{user?.rating}</span>
            <span className="ms-1 text-warning">
              <i
                className="bi-star-fill text-warning"
                style={{ fontSize: "1rem", verticalAlign: "middle" }} // Ensure star is inline with text
              />
            </span>
          </div>
        ) : (
          <span className="error-msg text-gray align-items-center">
            <i
              className="bi-star"
              style={{ fontSize: "1rem", verticalAlign: "middle" }}
            />{" "}
            No ratings yet
          </span>
        )}
      </div>

      <button
        className="btn btn-rectangle primary"
        disabled={isYou}
        onClick={() => navigate(`/user/${user.id}?tab=${tab}`)}
      >
        View {tab.slice(0, 1).toUpperCase()}{tab.slice(1)}
      </button>
      <button
        className="btn btn-rectangle secondary"
        disabled={isYou}
        onClick={() => navigate(`/user/${user.id}`)}
      >
        View Profile
      </button>
    </div>
  );
};

export default UserToolbar;
