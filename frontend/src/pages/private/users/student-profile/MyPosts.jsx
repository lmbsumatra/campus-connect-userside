import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import BorrowingPost from "../../../../components/post-card/PostCard";
import { baseApi } from "../../../../App";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedPosts } from "../../../../redux/post/allApprovedPostsSlice";

function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const { allApprovedPosts, loadingAllApprovedPosts, errorAllApprovedPosts } =
    useSelector((state) => state.allApprovedPosts);

  useEffect(() => {
    dispatch(fetchAllApprovedPosts());
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
      <BorrowingPost
        borrowingPosts={allApprovedPosts}
        title="Looking for..."
        isProfileVisit={false}
      />
    </div>
  );
}
export default MyPosts;
