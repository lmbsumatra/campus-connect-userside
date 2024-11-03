export const UserToolbar = ({ userInfo }) => {
  return (
    <>
      <div className="user-info mt-5 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={""} alt="Profile" className="profile-pic me-2" />
            <div>
              <a href={``} className="text-dark small text-decoration-none">
                {userInfo.user.first_name} {userInfo.user.last_name}
              </a>
            </div>
          </div>
          <div className="rating">
            <span>Rating:</span>
            {"★"}
            {"☆"}
          </div>
          <button className="btn btn-rectangle secondary me-2">
            View Listings
          </button>
          <button className="btn btn-rectangle secondary me-2">
            View Profile
          </button>
        </div>
      </div>
    </>
  );
};
