import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/users/header/Header";
import Subheader from "../../components/common/subheader/Subheader";
import Categories from "../../components/common/categories/Categories";
import ItemCard from "../../components/item-card/ItemCard";
import LoadingItemCardSkeleton from "../../components/loading-skeleton/loading-item-card-skeleton/LoadingItemCardSkeleton";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import TimeoutComponent from "../../utils/TimeoutComponent";
import Banner from "../../components/users/banner/Banner";
import PostCard from "../../components/post-card/PostCard";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import { fetchAllApprovedListings } from "../../redux/listing/allApprovedListingsSlice";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";

function ContentSection({ error, loading, fallback, children }) {
  return (
    <div className="container-content">
      {error && <p>Error: {error}</p>}
      <TimeoutComponent timeoutDuration={5000} fallback={fallback}>
        {!loading && children}
      </TimeoutComponent>
    </div>
  );
}

function renderSkeleton(Component, count) {
  return Array.from({ length: count }).map((_, index) => <Component key={index} />);
}


function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllApprovedPosts());
    dispatch(fetchAllApprovedListings());
    dispatch(fetchAllApprovedItemForSale());
  }, [dispatch]);

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
  } = useSelector((state) => ({
    ...state.allApprovedPosts,
    ...state.allApprovedListings,
    ...state.allApprovedItemForSale,
  }));

  return (
    <div>
      <Header />
      <Subheader />
      <Categories />

      <ContentSection
        error={errorAllApprovedListings}
        loading={loadingAllApprovedListings}
        fallback={<div className="card-container vertical">{renderSkeleton(LoadingItemCardSkeleton, 6)}</div>}
      >
        <ItemCard items={allApprovedListings} title="Listings" />
      </ContentSection>

      <ContentSection
        error={errorAllApprovedItemForSale}
        loading={loadingAllApprovedItemForSale}
        fallback={<div className="card-container vertical">{renderSkeleton(LoadingItemCardSkeleton, 6)}</div>}
      >
        <ItemCard items={allApprovedItemForSale} title="For Sale" />
      </ContentSection>

      <React.Suspense fallback={<div>Loading Banner...</div>}>
        <Banner />
      </React.Suspense>

      <ContentSection
        error={errorAllApprovedPosts}
        loading={loadingAllApprovedPosts}
        fallback={<div className="card-container">{renderSkeleton(LoadingPostCardSkeleton, 4)}</div>}
      >
        <PostCard borrowingPosts={allApprovedPosts} title="Lend" />
      </ContentSection>
    </div>
  );
}

export default Home;
