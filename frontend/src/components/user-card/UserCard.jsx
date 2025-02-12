import { useNavigate } from "react-router-dom";
import "./userCardStyles.css";
import { useSelector, useDispatch } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";
import { updateUserAction } from "../../redux/user/allUsersSlice";

const UserCard = ({ users }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const studentUser = useSelector(selectStudentUser);
  const loggedInUserId = studentUser?.userId || null;

  return (
    <div className="users-container">
      {Array.isArray(users) &&
        users.map((user, index) => (
          <div
            className="user-card"
            onClick={() =>
              navigate(
                loggedInUserId === user.id ? `/profile` : `/user/${user.id}`
              )
            }
            key={index}
          >
            <div className="user">
              <div className="user-img">
                <img src={user.profilePic} alt={`${user.fname} profile`} />
              </div>

              <div className="user-details">
                <span>
                  <strong>
                    {user.fname} {user?.mname} {user.lname}
                  </strong>
                </span>
                <span>
                  {user.college} | ⭐ {user.rating}
                </span>
                {user.mutualFriends?.length > 0 && (
                  <div className="mutuals-container">
                    <div className="mutual-user">
                      {user.mutualFriends.slice(0, 3).map((mutual, idx) => (
                        <div className="user-img" key={idx}>
                          <img src={mutual.profilePic} alt="Mutual friend" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="action-btns">
              {user.action && user.action === "You" ? (
                <>
                  <button
                    className="btn btn-rectangle primary"
                    onClick={(e) => navigate("/profile")}
                  >
                    Go to profile
                  </button>
                  <button
                    className="btn btn-rectangle secondary"
                    onClick={(e) => navigate("/profile")}
                  >
                    Edit profile
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-rectangle primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(
                        updateUserAction({
                          loggedInUserId: loggedInUserId,
                          otherUserId: user.id,
                        })
                      );
                    }}
                  >
                    {user.action}
                  </button>
                  <button
                    className="btn btn-rectangle secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Message button clicked");
                    }}
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default UserCard;
