import React, { useEffect, useState } from "react";

import NavBar from "../../components/navbar/navbar/NavBar";
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
    title: "Hammer",
    price: "₱ 600",
    owner: "Alice Reyes",
    ownerImage: ownerImg,
    rating: 4,
    tags: ["Tool", "Hardware", "Essential"],
  },
  {
    image: item1,
    title: "Screwdriver",
    price: "₱ 300",
    owner: "John Doe",
    ownerImage: ownerImg,
    rating: 5,
    tags: ["Tool", "Hardware", "Handy"],
  },
  {
    image: item1,
    title: "Pliers",
    price: "₱ 450",
    owner: "Maria Santos",
    ownerImage: ownerImg,
    rating: 3,
    tags: ["Tool", "Hardware", "Essential"],
  },
  {
    image: item1,
    title: "Chisel",
    price: "₱ 350",
    owner: "Robert Garcia",
    ownerImage: ownerImg,
    rating: 2,
    tags: ["Tool", "Hardware", "Precision"],
  },
  {
    image: item1,
    title: "Saw",
    price: "₱ 700",
    owner: "Liza Cruz",
    ownerImage: ownerImg,
    rating: 4,
    tags: ["Tool", "Hardware", "Cutting"],
  },
  {
    image: item1,
    title: "Level",
    price: "₱ 400",
    owner: "Carlos Mendez",
    ownerImage: ownerImg,
    rating: 5,
    tags: [
      "Tool",
      "Hardware",
      "Measurement",
      "Hardware",
      "Measurement",
      "Hardware",
      "Measurement",
    ],
  },
];

function Home() {
  const [borrowingPosts, setBorrowingPosts] = useState([]);

  useEffect(() => {
    fetch("/Posts.json")
      .then((response) => response.json())
      .then((data) => setBorrowingPosts(data.borrowingPosts));
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
        <ItemList items={items} title="Listings" />
      </div>
      <Banner />
      <div className="container-content">
        <BorrowingPost borrowingPosts={borrowingPosts} title="Posts" />
      </div>
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
}

export default Home;
