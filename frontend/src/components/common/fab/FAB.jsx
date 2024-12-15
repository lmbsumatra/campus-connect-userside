import React, { useState, useEffect } from "react";
import "./fabStyles.css";
import { useNavigate } from "react-router-dom";
import createPostIcon from "../../../assets/images/fab/POSTS.svg";
import addItemIcon from "../../../assets/images/fab/RENTALS.svg";
import cartIcon from "../../../assets/images/fab/cart.svg";
import Cart from "./Cart";

const FAB = ({ cartItems }) => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const createPost = () => navigate("/new-post");
  const addItem = () => navigate("/add-listing");
  const toggleCart = () => {
    if (isMobile) {
      navigate("/cart"); // Redirect to cart page on mobile
    } else {
      setIsCartOpen(!isCartOpen); // Toggle cart visibility on larger screens
    }
  };

  return (
    <>
      <div className="fabs-container">
        <button className="fab bg-blue" onClick={addItem}>
          <img src={addItemIcon} alt="Add Item" /> <span>Add item</span>
        </button>
        <button className="fab bg-orange" onClick={createPost}>
          <img src={createPostIcon} alt="Create Post" />
          <span>Create post</span>
        </button>
        <button className="fab bg-fuschia" onClick={toggleCart}>
          <img src={cartIcon} alt="View Cart" />
          <span>View cart</span>
        </button>
      </div>
      {!isMobile && (
        <Cart
          items={cartItems}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </>
  );
};

export default FAB;
