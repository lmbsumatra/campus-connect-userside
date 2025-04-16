import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import { fetchAllApprovedListings } from "../../redux/listing/allApprovedListingsSlice";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";
import { useEffect } from "react";
import ItemCard from "../../components/item-card/ItemCard";
import PostCard from "../../components/post-card/PostCard";
import UserCard from "../../components/user-card/UserCard";
import { fetchAllUsers } from "../../redux/user/allUsersSlice";
import { Link } from "react-router-dom";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import TimeoutComponent from "../../utils/TimeoutComponent";
import "./homeStyles.css";

// Skeleton loader component
const SkeletonLoader = ({ type, count }) => {
  const SkeletonComponent =
    type === "item" ? LoadingItemCardSkeleton : LoadingPostCardSkeleton;
  return (
    <div className="card-container minimal">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
};

// Section Title
function SectionTitle({ title, viewAllLink }) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {viewAllLink && (
        <Link to={viewAllLink} className="view-all-link">
          View All
        </Link>
      )}
    </div>
  );
}

// Empty state message
const EmptyState = ({ message }) => (
  <div className="empty-state">
    <p>{message}</p>
  </div>
);

const SearchResults = () => {
  const { search } = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(search);

  const keyword = searchParams.get("q")?.trim() || "N/A";
  const type = searchParams.get("type") || "all";

  useEffect(() => {
    dispatch(fetchAllApprovedPosts({keyword}));
    dispatch(fetchAllApprovedListings({keyword}));
    dispatch(fetchAllApprovedItemForSale({keyword}));
    dispatch(fetchAllUsers(keyword));
  }, [dispatch, keyword]);

  const {
    allApprovedPosts,
    loadingAllApprovedPosts,
    errorAllApprovedPosts,
    allApprovedListings,
    loadingAllApprovedListings,
    errorAllApprovedListings,
    allApprovedItemForSale,
    loadingAllApprovedItemForSale,
    errorAllApprovedItemForSale,
    allUsers,
    loadingAllUsers,
    errorAllUsers,
  } = useSelector((state) => ({
    ...state.allApprovedPosts,
    ...state.allApprovedListings,
    ...state.allApprovedItemForSale,
    ...state.allUsers,
  }));

  return (
    <div className="container-content">
      <h2>Search Results</h2>
      <p>
        Showing results for <strong>{type}</strong>: <em>{keyword}</em>
      </p>

      {/* Users Section */}
      <div className="content-section py-3">
        <SectionTitle title="Users" />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="item" count={6} />}
        >
          {!loadingAllUsers &&
            (allUsers.length > 0 ? (
              <UserCard users={allUsers} />
            ) : (
              <EmptyState message="No users found." />
            ))}
        </TimeoutComponent>
      </div>

      {/* Listings Section */}
      <div className="content-section py-3">
        <SectionTitle title="Listings" viewAllLink={`/rent?q=${keyword}`} />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="item" count={6} />}
        >
          {!loadingAllApprovedListings &&
            (allApprovedListings.length > 0 ? (
              <ItemCard items={allApprovedListings.slice(0, 6)} />
            ) : (
              <EmptyState message="No listings found." />
            ))}
        </TimeoutComponent>
      </div>

      {/* Items for Sale Section */}
      <div className="content-section py-3">
        <SectionTitle title="For Sale" viewAllLink={`/shop?q=${keyword}`} />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="item" count={6} />}
        >
          {!loadingAllApprovedItemForSale &&
            (allApprovedItemForSale.length > 0 ? (
              <ItemCard items={allApprovedItemForSale.slice(0, 6)} />
            ) : (
              <EmptyState message="No items for sale found." />
            ))}
        </TimeoutComponent>
      </div>

      {/* Posts Section */}
      <div className="content-section py-3">
        <SectionTitle title="Lend" viewAllLink={`/lookingfor?q=${keyword}`} />
        <TimeoutComponent
          timeoutDuration={1000}
          fallback={<SkeletonLoader type="post" count={4} />}
        >
          {!loadingAllApprovedPosts &&
            (allApprovedPosts.length > 0 ? (
              <PostCard borrowingPosts={allApprovedPosts.slice(0, 4)} />
            ) : (
              <EmptyState message="No posts found." />
            ))}
        </TimeoutComponent>
      </div>
    </div>
  );
};

export default SearchResults;
