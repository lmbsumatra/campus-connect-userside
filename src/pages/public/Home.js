import React from "react";


import NavBar from "../../components/navbar/NavBar";
import Header from "../../components/header/Header";
import Subheader from "../../components/subheader/Subheader";
import Categories from "../../components/categories/Categories";
import ItemList from "../../components/itemlisting/ItemList";
import Banner from "../../components/banner/Banner";
import BorrowingPost from "../../components/borrowingposts/BorrowingPost";
import FAB from "../../components/fab/FAB";
import Footer from "../../components/footer/Footer";


import item1 from "../../assets/images/item/item_1.jpg";
import ownerImg from "../../assets/images/icons/user-icon.svg";


const items = [
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 3,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 2,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 5,
  },
  {
    image: item1,
    title: "Wrench",
    price: "₱ 500",
    owner: "Ebe Dencel",
    ownerImage: ownerImg,
    rating: 1,
  },
];

function Home() {
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
      <ItemList items={items} />
      <Banner />
      <BorrowingPost />
      <Footer />
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
}

export default Home;
