import React from 'react';
import './style.css';
// import productImage from "../../assets/images/icons/product-image.png"; // Replace with actual product image path

const ProductCard = () => {
  return (
    <div className="product-card">
      <img src='' alt="Product" />
      <div className="product-info">
        <h5>Product Name</h5>
        <p>Product description goes here. This is a brief description of the product.</p>
        <div className="product-price">
          <span>$20.00</span>
          <button className="buy-btn">Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
