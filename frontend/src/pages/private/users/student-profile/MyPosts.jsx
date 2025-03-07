import { useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import BorrowingPost from "../../../../components/post-card/PostCard";
import { useDispatch, useSelector } from "react-redux";
import TimeoutComponent from "../../../../utils/TimeoutComponent";
import LoadingPostCardSkeleton from "../../../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import Toolbar from "../../../../components/toolbar/Toolbar";
import { fetchAllPostsByUser } from "../../../../redux/post/allPostsByUserSlice";

function MyPosts() {
  const dispatch = useDispatch();
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const { allPostsByUser, loadingAllPostsByUser, errorAllPostsUser } =
    useSelector((state) => state.allPostsByUser);

  useEffect(() => {
    dispatch(fetchAllPostsByUser(userId));
  }, [dispatch]);

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
