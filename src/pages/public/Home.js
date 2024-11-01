import React, { useEffect, useState } from "react";
import axios from "axios";

import Header from "../../components/users/header/Header";
import Subheader from "../../components/subheader/Subheader";
import Categories from "../../components/categories/Categories";
import ItemList from "../../components/itemlisting/ItemList";
import Banner from "../../components/users/banner/Banner";
import BorrowingPost from "../../components/borrowingposts/BorrowingPost";
import FAB from "../../components/fab/FAB";

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/info`);
        console.log("Response data:", response.data);

        setPosts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, []);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/listings/info`);
        console.log("Response data:", response.data);

        setListings(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, []);

  const handleFabClick = (action) => {
    if (action === "add-item") {
      console.log("Add Item button clicked");
    } else if (action === "create-post") {
      console.log("Create Post button clicked");
    }
  };

  return (
    <div>
      <Header />
      <Subheader />
      <Categories />
      <div className="container-content">
        <ItemList listings={listings} title="Listings" />
      </div>
      <Banner />
      <div className="container-content">
      <BorrowingPost borrowingPosts={posts} title="Lend" />
      </div>
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
}

export default Home;
