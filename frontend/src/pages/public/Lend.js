import React, { useEffect, useState } from "react";
import PostCard from "../../components/post-card/PostCard";
import FAB from "../../components/common/fab/FAB";
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import { baseApi } from "../../App";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import TimeoutComponent from "../../utils/TimeoutComponent";
import LoadingPostCardSkeleton from "../../components/loading-skeleton/loading-post-card-skeleton/LoadingPostCardSkeleton";
import { useLocation } from "react-router-dom";
import FilterToolbar from "../../components/item-filter/FilterToolbar";
import FilterFunction from "../../components/item-filter/FilterFunction";
import FilterModal from "../../components/item-filter/FilterModal";
import ResetFilters from "../../components/item-filter/ResetFilters";
import { defaultFilters } from "../../utils/consonants";

const Lend = () => {
  const dispatch = useDispatch();

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [showAdvancefilter, setShowAdvanceFilter] = useState(false);

  const keyword = searchParams.get("q")?.trim() || "";

  useEffect(() => {
    dispatch(fetchAllApprovedPosts(keyword));
  }, [dispatch]);

  const { allApprovedPosts, loadingAllApprovedPosts, errorAllApprovedPosts } =
    useSelector((state) => state.allApprovedPosts);

  const [filteredItems, setFilteredItems] = useState(allApprovedPosts);

  useEffect(() => {
    setFilteredItems(allApprovedPosts);
  }, [allApprovedPosts]);

  const handleFilterChange = (filters) => {
    const updatedItems = FilterFunction(allApprovedPosts, filters, false);
    setFilteredItems(updatedItems);
  };

  return (
    <div className="container-content">
      {/* Display Borrowing Posts */}
      {errorAllApprovedPosts && (
        <p>Error loading borrowing posts: {errorAllApprovedPosts}</p>
      )}
      {loadingAllApprovedPosts && <p>Loading borrowing posts...</p>}

      <FilterToolbar
        showPriceRange={false}
        onFilterChange={handleFilterChange}
      />
      <button
        className="btn btn-rectangle primary"
        onClick={() => setShowAdvanceFilter(!showAdvancefilter)}
      >
        Advance Filter
      </button>

      <ResetFilters
        setFilteredItems={setFilteredItems}
        setFilters={(e) => handleFilterChange()}
        allApprovedPosts={allApprovedPosts}
      />

      {showAdvancefilter && (
        <FilterModal
          showFilterModal={showAdvancefilter}
          close={(e) => setShowAdvanceFilter(!showAdvancefilter)}
          applyFilters={handleFilterChange}
        />
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
          <PostCard borrowingPosts={filteredItems} title="Lend" />
        )}
      </TimeoutComponent>
    </div>
  );
};

export default Lend;
