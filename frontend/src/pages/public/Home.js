import React, { useEffect, useState } from "react";
import axios from "axios";

// Importing components for different sections of the page
import Header from "../../components/users/header/Header";
import Subheader from "../../components/common/subheader/Subheader";
import Categories from "../../components/common/categories/Categories";
import ItemList from "../../components/itemlisting/ItemList";
import Banner from "../../components/users/banner/Banner";
import BorrowingPost from "../../components/borrowingposts/BorrowingPost";
import FAB from "../../components/common/fab/FAB";
import { baseApi } from "../../App";

// Custom hook for fetching approved items
import useFetchApprovedItems from "../../hooks/useFetchApprovedItems";

function Home() {
  const baseUrl = "http://localhost:3001";

  // Fetch listings data (approved items for sale or rent)
  const { items: listings, loading: loadingListings, error: errorListings } = useFetchApprovedItems(`${baseApi}/listings/available`);

  // Fetch listings data (approved items for sale or rent)
  const { items: itemsforsale, loading: loadingItemsforsale, error: errorItemsforsale} = useFetchApprovedItems(`${baseApi}/item-for-sale/available`);
  
  // Fetch borrowing posts data (approved posts for lending)
  const { items: posts, loading: loadingPosts, error: errorPosts } = useFetchApprovedItems(`${baseApi}/posts/approved`);

  return (
    <div>
      {/* Header and Subheader */}
      <Header />
      <Subheader />

      {/* Categories Section */}
      <Categories />

      {/* Listings Section */}
      <div className="container-content">
        {errorListings && <p>Error loading listings: {errorListings}</p>}
        {loadingListings && <p>Loading listings...</p>}
        <ItemList items={listings} title="Listings" />
      </div>
      {/* For sale items Section */}
      <div className="container-content">
        {errorItemsforsale && <p>Error loading listings: {errorItemsforsale}</p>}
        {loadingItemsforsale && <p>Loading listings...</p>}
        <ItemList items={itemsforsale} title="For sale" />
      </div>

      {/* Banner Section */}
      <Banner />

      {/* Borrowing Posts Section */}
      <div className="container-content">
        {errorPosts && <p>Error loading borrowing posts: {errorPosts}</p>}
        {loadingPosts && <p>Loading borrowing posts...</p>}
        <BorrowingPost borrowingPosts={posts} title="Lend" />
      </div>

     
    </div>
  );
}

export default Home;
