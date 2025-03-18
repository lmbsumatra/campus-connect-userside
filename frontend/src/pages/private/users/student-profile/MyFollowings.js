import React, { useEffect, useState } from "react";
import "./myFollowingsStyles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFollowings,
  updateFollowStatus,
} from "../../../../redux/user/followingsSlice";
import ShowAlert from "../../../../utils/ShowAlert";

const MyFollowings = () => {
  const dispatch = useDispatch();
  const { followings, followers, loading, error } = useSelector(
    (state) => state.followings
  );
  const { studentUser } = useSelector((state) => state.studentAuth || {});

  const [sortedFollowings, setSortedFollowings] = useState([]);
  const [sortedFollowers, setSortedFollowers] = useState([]);
  const [sortBy, setSortBy] = useState("followers");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (studentUser?.token) {
      dispatch(fetchFollowings(studentUser.token));
    }
  }, [dispatch, studentUser]);

  useEffect(() => {
    setSortedFollowings([...followings]);
    setSortedFollowers([...followers]);
  }, [followings, followers]);

  const handleSort = (type) => {
    const newDirection =
      sortBy === type && sortDirection === "asc" ? "desc" : "asc";
    setSortBy(type);
    setSortDirection(newDirection);
  };

  const handleFollowAction = async (e, otherUserId, isFollowing, userName) => {
    e.stopPropagation();
    if (!studentUser) {
      ShowAlert(dispatch, "error", "Not Logged In", "You must be logged in to perform this action.");
      return;
    }
    
    await dispatch(
      updateFollowStatus({ loggedInUserId: studentUser.userId, otherUserId })
    );
    
    if (isFollowing) {
      // User was following, now unfollowing
      ShowAlert(dispatch, "success", "Unfollowed", `You are no longer following ${userName || 'this user'}.`);
    } else {
      // User was not following, now following
      ShowAlert(dispatch, "success", "Following", `You are now following ${userName || 'this user'}.`);
    }
    
    dispatch(fetchFollowings(studentUser.token));
  };

  if (loading)
    return <div className="loading-message">Loading your connections...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="container rounded white my-followings-container">
      <div className="sort-buttons">
        <button
          className={`sort-btn ${sortBy === "followers" ? "active" : ""}`}
          onClick={() => handleSort("followers")}
        >
          Followers
        </button>
        <button
          className={`sort-btn ${sortBy === "following" ? "active" : ""}`}
          onClick={() => handleSort("following")}
        >
          Followings
        </button>
      </div>

      {sortBy !== "followers" && (
        <div className="users-section">
          <h2>People I Follow</h2>
          {followings.length === 0 ? (
            <p className="no-followings">You are not following anyone yet.</p>
          ) : (
            <div className="users-list">
              {followings.map((user) => (
                <div key={user.id} className="user-row">
                  <div className="user-avatar">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0)}</span>
                    )}
                  </div>

                  <a href={`/user/${user.id}`} className="user-name">
                    {user.name}
                  </a>
                  <button
                    className="btn btn-rectangle primary"
                    onClick={(e) => handleFollowAction(e, user.id, true, user.name)}
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {sortBy !== "following" && (
        <div className="users-section">
          <h2>People Following Me</h2>
          {followers.length === 0 ? (
            <p className="no-followers">No one is following you yet.</p>
          ) : (
            <div className="users-list">
              {followers.map((user) => (
                <div key={user.id} className="user-row">
                  <div className="user-avatar">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0)}</span>
                    )}
                  </div>

                  <a href={`/user/${user.id}`} className="user-name">
                    {user.name}
                  </a>
                  <button
                    className={`btn btn-rectangle ${
                      user.isFollowing ? "primary" : "secondary"
                    }`}
                    onClick={(e) => handleFollowAction(e, user.id, user.isFollowing, user.name)}
                  >
                    {user.isFollowing ? "Following" : "Follow Back"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyFollowings;