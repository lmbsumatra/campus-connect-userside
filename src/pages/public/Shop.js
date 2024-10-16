import React from "react";
import NavBar from "../../components/navbar/navbar/NavBar";
import ListingItem from "../../components/listings/ListingItem";
import Footer from "../../components/footer/Footer";
import { Link } from "react-router-dom";
import ItemList from "../../components/itemlisting/ItemList";

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

const Shop = () => {
  return (
    <>
      <div className="container-content">
        <div className="row">
          <div className="col-md-2">
            <h5>Filters</h5>
            <div className="mb-3">
              <label className="form-label">By Category</label>
              <select className="form-select">
                <option value="COE">COE</option>
                <option value="CIT">CIT</option>
                <option value="COS">COS</option>
                <option value="CLA">CLA</option>
                <option value="CE">CE</option>
                <option value="CAFA">CAFA</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">By Rate</label>
              <select className="form-select">
                <option value="1">1 star</option>
                <option value="2">2 star</option>
                <option value="3">3 star</option>
                <option value="4">4 star</option>
                <option value="5">5 star</option>
              </select>
            </div>
            <Link to="/add-item" className="btn btn-primary no-fill">
              Add New Item
            </Link>
          </div>
          <div className="col-md-10">
            <ItemList items={items}  title="Shop"/>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
