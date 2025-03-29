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
import TrialOnHeroSection from "../../trials/TrialOnHeroSection";
import BrowseByCollection from "../../components/browse-by-collection/BrowseByCollection.jsx";
import { Link } from "react-router-dom";
import "./homeStyles.css";
import { baseUrl } from "../../utils/consonants.js";

// Section Title component with View All link
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

function ContentSection({
  error,
  loading,
  fallback,
  children,
  title,
  viewAllLink,
}) {
  return (
    <div className="container-content content-section">
      {title && <SectionTitle title={title} viewAllLink={viewAllLink} />}
      {error && <p className="error-message">Error: {error}</p>}
      <TimeoutComponent timeoutDuration={1000} fallback={fallback}>
        {!loading && children}
      </TimeoutComponent>
    </div>
  );
}

function renderSkeleton(Component, count) {
  return Array.from({ length: count }).map((_, index) => (
    <Component key={index} />
  ));
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
    <div className="">
      <TrialOnHeroSection />
      <Subheader />

      <ContentSection
        title="Listings"
        viewAllLink={`${baseUrl}/rent`}
        error={errorAllApprovedListings}
        loading={loadingAllApprovedListings}
        fallback={
          <div className="card-container minimal">
            {renderSkeleton(LoadingItemCardSkeleton, 6)}
          </div>
        }
      >
        <div className="card-wrapper">
          <ItemCard items={allApprovedListings.slice(0, 6)} />
        </div>
      </ContentSection>

      <ContentSection
        title="For Sale"
        viewAllLink={`${baseUrl}/shop`}
        error={errorAllApprovedItemForSale}
        loading={loadingAllApprovedItemForSale}
        fallback={
          <div className="card-container minimal">
            {renderSkeleton(LoadingItemCardSkeleton, 6)}
          </div>
        }
      >
        <div className="card-wrapper">
          <ItemCard items={allApprovedItemForSale.slice(0, 6)} />
        </div>
      </ContentSection>

      <React.Suspense
        fallback={<div className="banner-loading">Loading Banner...</div>}
      >
        <Banner />
      </React.Suspense>

      <ContentSection
        title="Looking for..."
        viewAllLink={`${baseUrl}/lookingfor`}
        error={errorAllApprovedPosts}
        loading={loadingAllApprovedPosts}
        fallback={
          <div className="card-container minimal">
            {renderSkeleton(LoadingPostCardSkeleton, 4)}
          </div>
        }
      >
        <div className="card-wrapper">
          <PostCard borrowingPosts={allApprovedPosts.slice(0, 4)} />
        </div>
      </ContentSection>
    </div>
  );
}

export default Home;
