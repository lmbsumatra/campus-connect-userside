import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import rentIcon from "../../../assets/images/cart/rent.svg";
import buyIcon from "../../../assets/images/cart/buy.svg";
import lookUpIcon from "../../../assets/images/cart/go-to.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeCartItem,
  selectCartItems,
  selectCartLoading,
  selectCartError,
  selectCartSuccessMessage,
  clearSuccessMessage,
} from "../../../redux/cart/cartSlice";
import { Modal, Button, Spinner } from "react-bootstrap"; // Import Bootstrap modal and spinner

const Cart = ({ isOpen, onClose }) => {
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const successMessage = useSelector(selectCartSuccessMessage);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Fetch cart items on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Close modal after success message
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setShowConfirm(false);
        dispatch(clearSuccessMessage());
      }, 1500);
    }
  }, [successMessage, dispatch]);

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setShowConfirm(true);
  };

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      dispatch(removeCartItem(itemToRemove.id));
    }
  };

  const handleCancelRemove = () => {
    setShowConfirm(false);
    setItemToRemove(null);
  };

  const renderItems = () => {
    if (!cartItems || cartItems.length === 0) {
      return <p>Your cart is empty.</p>;
    }

    const groupedItems = cartItems.reduce((acc, item) => {
      if (!acc[item.owner_id]) {
        acc[item.owner_id] = [];
      }
      acc[item.owner_id].push(item);
      return acc;
    }, {});

    return Object.keys(groupedItems).map((ownerId, index) => {
      const owner = groupedItems[ownerId];
      return (
        <div className="owner-group" key={index}>
          <div className="header">
            <input type="checkbox" className="checkbox" />
            <a href="" className="owner-name">
              {owner[0].owner.first_name}
              <img
                src={lookUpIcon}
                alt={`Go to profile ${owner[0].owner.first_name}`}
                className="icon look-up"
              />
            </a>
          </div>
          {owner.map((item, itemIndex) => {
            const specs = item.specs || {};
            const specValues = Object.values(specs);

            return (
              <div className="item" key={itemIndex}>
                <input type="checkbox" className="checkbox" />
                <img
                  src={item.image || "/placeholder.png"}
                  alt={`Image of ${item.item_name}`}
                  className="item-image"
                />
                <div className="description">
                  <p className="name">{item.item_name}</p>
                  <div className="type">
                    <img
                      src={item.transaction_type === "buy" ? buyIcon : rentIcon}
                      alt={item.transaction_type}
                    />
                  </div>
                  <div className="specs">
                    {specValues.length > 0 ? (
                      specValues.slice(0, 2).map((spec, specIndex) => (
                        <p className="spec" key={specIndex}>
                          {spec}
                          {specIndex === 0 ? "," : ""}
                        </p>
                      ))
                    ) : (
                      <p>No specs available</p>
                    )}
                  </div>
                  <p className="price">₱{item.price}</p>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveClick(item)}
                  >
                    Remove
                  </button>
                  <button className="find-similar-btn">
                    Find Similar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div>
      {/* Cart View */}
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

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={handleCancelRemove} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status" />
              <p>Removing item...</p>
            </div>
          ) : successMessage ? (
            <div className="text-success text-center">
              <p>{successMessage}</p>
            </div>
          ) : error ? (
            <div className="text-danger text-center">
              <p>{error}</p>
            </div>
          ) : (
            <p>Are you sure you want to remove this item from your cart?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!loading && !successMessage && (
            <>
              <Button variant="secondary" onClick={handleCancelRemove}>
                No
              </Button>
              <Button variant="danger" onClick={handleConfirmRemove}>
                Yes
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cart;
