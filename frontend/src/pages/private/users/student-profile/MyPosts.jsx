import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import BorrowingPost from "../../../../components/post-card/PostCard";
import { baseApi } from "../../../../App";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedPosts } from "../../../../redux/post/allApprovedPostsSlice";
import TimeoutComponent from "../../../../utils/TimeoutComponent";
import LoadingPostCardSkeleton from "../../../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import Toolbar from "../../../../components/toolbar/Toolbar";
import { fetchAllPostsByUser } from "../../../../redux/post/allPostsByUserSlice";

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const { allPostsByUser, loadingAllPostsByUser, errorAllPostsUser } =
    useSelector((state) => state.allPostsByUser);

  useEffect(() => {
    dispatch(fetchAllPostsByUser(userId));
  }, [dispatch]);

  // useEffect(() => {
  //   const fetchItem = async () => {
  //     try {
  //       const response = await axios.get(`${baseApi}/posts/info`);
  //       const userPosts = response.data.filter(
  //         (post) => post.renter_id === userId
  //       );
  //       setPosts(userPosts);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (userId) {
  //     fetchItem();
  //   }
  // }, [userId]);

  return (
    <div className="container rounded bg-white">
      <Toolbar />
      <TimeoutComponent
        timeoutDuration={5000}
        fallback={
          <div className="card-container">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingPostCardSkeleton key={index} />
            ))}
          </div>
        }
      >
        <BorrowingPost
          borrowingPosts={allPostsByUser}
          title="Looking for...???"
          isProfileVisit={false}
        />
      </TimeoutComponent>
    </div>
  );
}
export default MyPosts;
