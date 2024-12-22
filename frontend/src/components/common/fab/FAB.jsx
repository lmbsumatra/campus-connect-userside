import React, { useState, useEffect } from "react";
import "./fabStyles.css";
import { useNavigate } from "react-router-dom";
import createPostIcon from "../../../assets/images/fab/POSTS.svg";
import addItemIcon from "../../../assets/images/fab/RENTALS.svg";
import cartIcon from "../../../assets/images/fab/cart.svg";
import Cart from "../../../pages/private/users/cart/Cart";

const FAB = ({ cartItems }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const createPost = () => navigate("/new-post");
  const addItem = () => navigate("/add-listing");
  const toggleCart = () => (isMobile ? navigate("/cart") : setIsCartOpen(!isCartOpen));

  return (
    <>
      <div className="fab-main-container">
        <div className={`fab-options ${isMenuOpen ? "open" : ""}`}>
          <div className="fab-option-wrapper">
            <span className="fab-text bg-blue-text">Add Item</span>
            <button className="fab-option bg-blue" onClick={addItem}>
              <img src={addItemIcon} alt="Add Item" />
            </button>
          </div>
          <div className="fab-option-wrapper">
            <span className="fab-text bg-orange-text">Create Post</span>
            <button className="fab-option bg-orange" onClick={createPost}>
              <img src={createPostIcon} alt="Create Post" />
            </button>
          </div>
          <div className="fab-option-wrapper">
            <span className="fab-text bg-fuschia-text">View Cart</span>
            <button className="fab-option bg-fuschia" onClick={toggleCart}>
              <img src={cartIcon} alt="View Cart" />
            </button>
          </div>
        </div>
        <button className={`fab-main ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
          +
        </button>
      </div>
      {!isMobile && <Cart items={cartItems} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
    </>
  );
};

export default FAB;
