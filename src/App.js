// src/App.js
import React from 'react';
import './App.css';

// components
import NavBar from "./components/navbar/NavBar";
import Header from "./components/header/Header";
import Subheader from "./components/subheader/Subheader";
import Categories from "./components/categories/Categories";
import ItemList from "./components/itemlisting/ItemList";
import Banner from "./components/banner/Banner";
import BorrowingPost from "./components/borrowingposts/BorrowingPost";
import FAB from "./components/fab/FAB";

function App() {
  const handleFabClick = (action) => {
    if (action === 'add-item') {
      console.log('Add Item button clicked');
      // Implement your logic for adding an item
    } else if (action === 'create-post') {
      console.log('Create Post button clicked');
      // Implement your logic for creating a post
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
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
}

export default App;
