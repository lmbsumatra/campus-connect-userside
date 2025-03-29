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
      <div className="rating-label">
        <div className="d-flex align-items-center my-1">
          {user?.rating ? (
            <>
              <span className="price me-2 fs-5 fw-bold text-success">
                {user.rating}
              </span>
              <div className="">
                {"("}
                <i
                  className="bi-star-fill text-warning"
                  style={{ fontSize: "1 rem" }}
                />
              </div>
              {")"}
            </>
          ) : (
            <span className="error-msg text-gray fs-5">
              <i className="bi-star" style={{ fontSize: "1 rem" }} /> No ratings
              yet
            </span>
          )}
        </div>
      </div>
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
