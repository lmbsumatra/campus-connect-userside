import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import rentIcon from "../../../assets/images/cart/rent.svg";
import buyIcon from "../../../assets/images/cart/buy.svg";
import lookUpIcon from "../../../assets/images/cart/go-to.svg";

const Cart = ({ items = {}, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderItems = () => {
    if (Object.keys(items).length === 0) {
      return <p>Your cart is empty.</p>;
    }

    return Object.keys(items).map((seller, index) => (
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
        {items[seller].map((item, itemIndex) => (
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
                <img src={item.type === "To buy" ? buyIcon : rentIcon} alt={item.type} />
              </div>
              <div className="specs">
                {item.specs.slice(0, 2).map((spec, specIndex) => (
                  <p className="spec" key={specIndex}>
                    {spec.substring(0, 20)}{specIndex === 0 ? "," : "..."}
                  </p>
                ))}
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
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <div className="items">{renderItems()}</div>
      <button className="checkout-btn">Checkout</button>
    </div>
  );
};

export default Cart;
