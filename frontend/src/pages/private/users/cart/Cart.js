import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import rentIcon from "../../../../assets/images/cart/rent.svg";
import buyIcon from "../../../../assets/images/cart/buy.svg";
import lookUpIcon from "../../../../assets/images/cart/go-to.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeCartItem,
  selectCartItems,
  selectCartLoading,
  selectCartError,
  selectCartSuccessMessage,
  clearSuccessMessage,
} from "../../../../redux/cart/cartSlice";
import { Modal, Button } from "react-bootstrap";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";
import { ConsoleWriter } from "istanbul-lib-report";

const Cart = ({ isOpen, onClose }) => {
  const cartItems = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const successMessage = useSelector(selectCartSuccessMessage);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false); // New state for Select All

  // Fetch cart items on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  console.log(cartItems);

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
    if (!itemToRemove) return;

    const notify = (type, title, text) =>
      dispatch(showNotification({ type, title, text }));

    dispatch(removeCartItem(itemToRemove.id))
      .unwrap()
      .then(() => {
        notify("success", "Success!", "Item removed successfully.");
      })
      .catch((error) => {
        console.error("Error removing item from cart:", error);
        notify("error", "Error", "Failed to remove item from cart.");
      });
  };

  const handleCancelRemove = () => {
    setShowConfirm(false);
    setItemToRemove(null);
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  // Handle Select All logic
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]); // Deselect all if currently all are selected
    } else {
      setSelectedItems(cartItems.map((item) => item.id)); // Select all
    }
    setSelectAll(!selectAll);
  };

  const handleBulkRemove = () => {
    if (selectedItems.length === 0) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "No items selected for removal.",
        })
      );
      return;
    }

    Promise.all(
      selectedItems.map((itemId) => dispatch(removeCartItem(itemId)).unwrap())
    )
      .then(() => {
        dispatch(
          showNotification({
            type: "success",
            title: "Success!",
            text: "Selected items removed successfully.",
          })
        );
        setSelectedItems([]);
        setSelectAll(false); // Reset Select All when items are removed
      })
      .catch((error) => {
        console.error("Error removing selected items:", error);
        dispatch(
          showNotification({
            type: "error",
            title: "Error",
            text: "Failed to remove some items. Please try again.",
          })
        );
      });
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
            <a href="" className="owner-name">
              {owner[0].owner.fname}
              <img
                src={lookUpIcon}
                alt={`Go to profile ${owner[0].owner.fname}`}
                className="icon look-up"
              />
            </a>
          </div>
          {owner.map((item, itemIndex) => (
            <div className="item" key={itemIndex}>
              <input
                type="checkbox"
                className="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelectItem(item.id)}
              />
              <img
                src={item.image || "/placeholder.png"}
                alt={`Image of ${item.name}`}
                className="item-image"
              />
              <div className="description">
                <p className="name">{item.name}</p>
                <div className="type">
                  <img
                    src={item.itemType === "buy" ? buyIcon : rentIcon}
                    alt={item.itemType}
                  />
                </div>
                <p className="price">₱{item.price}</p>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveClick(item)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div>
      <div className={`cart container ${isOpen ? "open" : ""}`}>
        <div className="header">
          <h3 className="header-text">Your Cart</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="bulk-actions">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
          />
          <label>Select All</label>
          <button className="bulk-remove-btn" onClick={handleBulkRemove}>
            Remove Selected
          </button>
        </div>
        <div className="items">{renderItems()}</div>
        <button className="checkout-btn">Checkout</button>
      </div>

      <Modal show={showConfirm} onHide={handleCancelRemove} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove this item from your cart?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelRemove}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmRemove}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
export default Cart;
