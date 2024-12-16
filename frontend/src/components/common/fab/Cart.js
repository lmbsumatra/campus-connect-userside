import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import rentIcon from "../../../assets/images/cart/rent.svg";
import buyIcon from "../../../assets/images/cart/buy.svg";
import lookUpIcon from "../../../assets/images/cart/go-to.svg";
import { useSelector } from "react-redux";
import { selectCartItems } from "../../../features/cart/cartSlice";

const Cart = ({ isOpen, onClose }) => {
  const cartItems = useSelector(selectCartItems); // Get items from Redux store
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderItems = () => {
    if (cartItems.length === 0) {
      return <p>Your cart is empty.</p>;
    }

    const groupedItems = cartItems.reduce((acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    }, {});

    return Object.keys(groupedItems).map((seller, index) => (
      <div className="owner-group" key={index}>
        <div className="header">
          <input type="checkbox" className="checkbox" />
          <a href="" className="owner-name">
            {seller}
            <img
              src={lookUpIcon}
              alt={`Go to profile ${seller} icon`}
              className="icon look-up"
            />
          </a>
        </div>
        {groupedItems[seller].map((item, itemIndex) => (
          <div className="item" key={itemIndex}>
            <input type="checkbox" className="checkbox" />
            <img
              src={item.image || "/placeholder.png"}
              alt={`Image of ${item.name}`}
              className="item-image"
            />
            <div className="description">
              <p className="name">{item.name}</p>
              <div className="type">
                <img
                  src={item.type === "To buy" ? buyIcon : rentIcon}
                  alt={item.type}
                />
              </div>
              <div className="specs">
                {(item.specs && Array.isArray(item.specs)) ? 
                  item.specs.slice(0, 2).map((spec, specIndex) => (
                    <p className="spec" key={specIndex}>
                      {spec}
                      {specIndex === 0 ? "," : ""}
                    </p>
                  )) : <p>No specs available</p>
                }
              </div>
              <p className="price">₱{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  return isMobile ? (
    <div className="cart page">
      <h3 className="header-text">Your Cart</h3>
      <div className="items">{renderItems()}</div>
      <button className="checkout-btn">Checkout</button>
      <button className="close-btn" onClick={() => navigate(-1)}>
        Close
      </button>
    </div>
  ) : (
    <div className={`cart container ${isOpen ? "open" : ""}`}>
      <div className="header">
        <h3 className="header-text">Your Cart</h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="items">{renderItems()}</div>
      <button className="checkout-btn">Checkout</button>
    </div>
  );
};

export default Cart;
