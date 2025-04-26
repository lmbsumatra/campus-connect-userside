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
  empty,
}) {
  return (
    <div className="container-content content-section">
      {title && <SectionTitle title={title} viewAllLink={viewAllLink} />}
      {error && <p className="error-message">Error: {error}</p>}
      <TimeoutComponent timeoutDuration={1000} fallback={fallback}>
        {!loading && (empty || children)}
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
    dispatch(fetchAllApprovedPosts("new_posts"));
    dispatch(fetchAllApprovedListings({ preference: "top_items_for_rent" }));
    dispatch(fetchAllApprovedItemForSale({ preference: "new_items_for_sale" }));
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
        title="📚 Most In-Demand Rentals This Semester"
        viewAllLink={`${baseUrl}/rent`}
        error={errorAllApprovedListings}
        loading={loadingAllApprovedListings}
        fallback={
          <div className="card-container minimal">
            {renderSkeleton(LoadingItemCardSkeleton, 6)}
          </div>
        }
        empty={
          !loadingAllApprovedListings &&
          Array.isArray(allApprovedListings) &&
          allApprovedListings.length === 0 && (
            <p className="empty-message">
              No listings available at the moment.
            </p>
          )
        }
      >
        <div className="card-wrapper">
          <ItemCard
            items={
              Array.isArray(allApprovedListings)
                ? allApprovedListings.slice(0, 4)
                : []
            }
          />
        </div>
      </ContentSection>

      <ContentSection
        title="💡 Freshly Listed: Must-Have Student Items"
        viewAllLink={`${baseUrl}/shop`}
        error={errorAllApprovedItemForSale}
        loading={loadingAllApprovedItemForSale}
        fallback={
          <div className="card-container minimal">
            {renderSkeleton(LoadingItemCardSkeleton, 6)}
          </div>
        }
        empty={
          !loadingAllApprovedItemForSale &&
          Array.isArray(allApprovedItemForSale) &&
          allApprovedItemForSale.length === 0 && (
            <p className="empty-message">No items for sale at the moment.</p>
          )
        }
      >
        <div className="card-wrapper">
          <ItemCard
            items={
              Array.isArray(allApprovedItemForSale)
                ? allApprovedItemForSale.slice(0, 4)
                : []
            }
          />
        </div>
      </ContentSection>

      <React.Suspense
        fallback={<div className="banner-loading">Loading Banner...</div>}
      >
        <Banner />
      </React.Suspense>

      <ContentSection
        title="📝 Recently Requested Items"
        viewAllLink={`${baseUrl}/lookingfor`}
        error={errorAllApprovedPosts}
        loading={loadingAllApprovedPosts}
        fallback={
          <div className="card-container minimal">
            {renderSkeleton(LoadingPostCardSkeleton, 4)}
          </div>
        }
        empty={
          !loadingAllApprovedPosts &&
          Array.isArray(allApprovedPosts) &&
          allApprovedPosts.length === 0 && (
            <p className="empty-message">No posts found.</p>
          )
        }
      >
        <div className="card-wrapper">
          <PostCard
            borrowingPosts={
              Array.isArray(allApprovedPosts)
                ? allApprovedPosts.slice(0, 4)
                : []
            }
          />
        </div>
      </ContentSection>
    </div>
  );
}

export default Home;
