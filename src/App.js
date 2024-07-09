// src/App.js
import React from "react";
import "./App.css";

// components
import NavBar from "./components/navbar/NavBar";
import Header from "./components/header/Header";
import Subheader from "./components/subheader/Subheader";
import Categories from "./components/categories/Categories";
import ItemList from "./components/itemlisting/ItemList";
import Banner from "./components/banner/Banner";
import BorrowingPost from "./components/borrowingposts/BorrowingPost";
import FAB from "./components/fab/FAB";
import Footer from "./components/footer/Footer";

function App() {
  const handleFabClick = (action) => {
    if (action === "add-item") {
      console.log("Add Item button clicked");
    } else if (action === "create-post") {
      console.log("Create Post button clicked");
    }
  };

  return (
    <div>
      <NavBar />
      <Header />
      <Subheader />
      <Categories />
      <ItemList />
      <Banner />
      <BorrowingPost />
      <Footer />
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
}

export default App;
