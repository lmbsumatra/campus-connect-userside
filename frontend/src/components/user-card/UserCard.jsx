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
                <span><strong>{user.fname} {user?.mname} {user.lname}</strong></span>
                <span>{user.college} | ⭐ {user.rating}</span>
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
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents navigating when clicking the button
                  handleFollowButton(e, loggedInUserId, user.id);
                }}
              >
                {user.action}
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Message button clicked");
                }}
              >
                Message
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default UserCard;
