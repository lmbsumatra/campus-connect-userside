import React, { useEffect, useState } from "react";
import axios from "axios";

// Importing components for different sections of the page
import Header from "../../components/users/header/Header";
import Subheader from "../../components/common/subheader/Subheader";
import Categories from "../../components/common/categories/Categories";
import ItemList from "../../components/item-card/ItemCard";
import Banner from "../../components/users/banner/Banner";
import BorrowingPost from "../../components/post-card/PostCard";
import FAB from "../../components/common/fab/FAB";
import { baseApi } from "../../App";

// Custom hook for fetching approved items
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedPosts } from "../../redux/post/allApprovedPostsSlice";
import PostCard from "../../components/post-card/PostCard";
import ItemCard from "../../components/item-card/ItemCard";
import { fetchAllApprovedListings } from "../../redux/listing/allApprovedListingsSlice";
import { fetchAllApprovedItemForSale } from "../../redux/item-for-sale/allApprovedItemsForSaleSlice";

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
      <div className="container-content">
        {errorAllApprovedListings && (
          <p>Error loading listings: {errorAllApprovedListings}</p>
        )}
        {loadingAllApprovedListings && <p>Loading listings...</p>}
        <ItemCard items={allApprovedListings} title="Listings" />
      </div>

      <div className="container-content">
        {errorAllApprovedItemForSale && (
          <p>Error loading listings: {errorAllApprovedItemForSale}</p>
        )}
        {loadingAllApprovedItemForSale && <p>Loading listings...</p>}
        <ItemCard items={allApprovedItemForSale} title="For sale" />
      </div>

      <Banner />

      <div className="container-content">
        {errorAllApprovedPosts && (
          <p>Error loading borrowing posts: {errorAllApprovedPosts}</p>
        )}
        {loadingAllApprovedPosts && <p>Loading borrowing posts...</p>}
        <PostCard borrowingPosts={allApprovedPosts} title="Lend" />
      </div>
    </div>
  );
}

export default Home;
