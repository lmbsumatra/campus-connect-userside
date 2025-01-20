import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Importing components
import Header from "../../components/users/header/Header";
import Subheader from "../../components/common/subheader/Subheader";
import Categories from "../../components/common/categories/Categories";
import ItemCard from "../../components/item-card/ItemCard";
import Banner from "../../components/users/banner/Banner";
import PostCard from "../../components/post-card/PostCard";

// Redux actions
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import { fetchAllApprovedListings } from "../../redux/listing/allApprovedListingsSlice";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import TimeoutComponent from "../../utils/TimeoutComponent";

// TimeoutComponent

function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllApprovedPosts());
    dispatch(fetchAllApprovedListings());
    dispatch(fetchAllApprovedItemForSale());
  }, [dispatch]);

  const { allApprovedPosts, loadingAllApprovedPosts, errorAllApprovedPosts } =
    useSelector((state) => state.allApprovedPosts);

  const {
    allApprovedListings,
    loadingAllApprovedListings,
    errorAllApprovedListings,
  } = useSelector((state) => state.allApprovedListings);

  const {
    allApprovedItemForSale,
    loadingAllApprovedItemForSale,
    errorAllApprovedItemForSale,
  } = useSelector((state) => state.allApprovedItemForSale);

  return (
    <div>
      <Header />
      <Subheader />
      <Categories />

      {/* Listings Section */}
      <div className="container-content">
        {errorAllApprovedListings && (
          <p>Error loading listings: {errorAllApprovedListings}</p>
        )}
        <TimeoutComponent
          timeoutDuration={5000}
          fallback={
            <div className="card-container vertical">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingItemCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          {!loadingAllApprovedListings && (
            <ItemCard items={allApprovedListings} title="Listings" />
          )}
        </TimeoutComponent>
      </div>

      {/* Items For Sale Section */}
      <div className="container-content">
        {errorAllApprovedItemForSale && (
          <p>Error loading items for sale: {errorAllApprovedItemForSale}</p>
        )}
        <TimeoutComponent
          timeoutDuration={5000}
          fallback={
            <div className="card-container vertical">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingItemCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          {!loadingAllApprovedItemForSale && (
            <ItemCard items={allApprovedItemForSale} title="For Sale" />
          )}
        </TimeoutComponent>
      </div>

      <Banner />

      {/* Borrowing Posts Section */}
      <div className="container-content">
        {errorAllApprovedPosts && (
          <p>Error loading borrowing posts: {errorAllApprovedPosts}</p>
        )}
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
          {!loadingAllApprovedPosts && (
            <PostCard borrowingPosts={allApprovedPosts} title="Lend" />
          )}
        </TimeoutComponent>
      </div>
    </div>
  );
}

export default Home;
