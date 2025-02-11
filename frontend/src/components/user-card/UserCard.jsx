import { useNavigate } from "react-router-dom";
import "./userCardStyles.css";
import { useSelector } from "react-redux";
import { selectStudentUser } from "../../redux/auth/studentAuthSlice";
import handleFollowButton from "../../pages/public/handleFollowButton";

const UserCard = ({ users }) => {
  const navigate = useNavigate();
  const studentUser = useSelector(selectStudentUser);
  const loggedInUserId = studentUser?.userId || null;

  return (
    <div className="users-container">
      {Array.isArray(users) &&
        users.slice(0, 4).map((user, index) => (
          <div
            className="user-card"
            onClick={(e) =>
              navigate(
                loggedInUserId === user.id ? `/profile` : `/user/${user.id}`
              )
            }
            key={index}
          >
            <div className="user">
              <div className="user-img">
                <img src={user.profilePic} alt="User profile" />
              </div>

              <div className="user-details">
                <span>
                  {user.fname} {user?.mname} {user.lname}
                </span>
                <span>
                  {user.college} {user.rating}
                </span>
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
              <button
                className="btn btn-rectangle primary"
                onClick={(e) => handleFollowButton(e, loggedInUserId, user.id)}
              >
                {user.action}
              </button>
              <button className="btn btn-rectangle secondary">Message</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default UserCard;
