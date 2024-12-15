import React, { useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

const Cart = ({ items = [], isOpen, onClose }) => {
  const navigate = useNavigate();

  // Determine screen size
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    return (
      <div className="cart-page">
        <h3>Your Cart</h3>
        <div className="cart-items">
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            items.map((item, index) => (
              <div className="cart-item" key={index}>
                <p>{item.name}</p>
                <p>Qty: {item.quantity}</p>
              </div>
            ))
          )}
        </div>
        <button className="checkout-btn">Checkout</button>
        <button className="close-btn" onClick={() => navigate(-1)}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
      <div className="cart-header">
        <h3>Your Cart</h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="cart-items">
        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          items.map((item, index) => (
            <div className="cart-item" key={index}>
              <p>{item.name}</p>
              <p>Qty: {item.quantity}</p>
            </div>
          ))
        )}
      </div>
      <button className="checkout-btn">Checkout</button>
    </div>
  );
};

export default Cart;
