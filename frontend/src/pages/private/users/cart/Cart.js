import React, { useEffect, useRef, useState } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import rentIcon from "../../../../assets/images/cart/rent.svg";
import buyIcon from "../../../../assets/images/cart/buy.svg";
import lookUpIcon from "../../../../assets/images/cart/go-to.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeCartItem,
  clearSuccessMessage,
  updateCartItemQty,
} from "../../../../redux/cart/cartSlice";
import { Modal, Button } from "react-bootstrap";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";
import { baseUrl, defaultImages } from "../../../../utils/consonants";
import CheckoutModal from "./CheckoutModal";
import QuantityControl from "../../../public/item-for-sale/QuantityControl";
const Cart = ({ isOpen, onClose }) => {
  const { cartItems, loading, error, successMessage } = useSelector(
    (state) => state.cart
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantities, setQuantities] = useState({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const cartRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    setSelectedItems([]);
    setSelectAll(false); 
  }, [cartItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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
    setShowConfirm(false);
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

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]); 
    } else {
      setSelectedItems(cartItems.map((item) => item.id)); 
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
        setSelectAll(false); 
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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Your cart is empty. Add items before checking out.",
        })
      );
      return;
    }

    if (selectedItems.length !== 1) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Please select exactly one item to proceed with checkout.",
        })
      );
      return;
    }
    setShowCheckout(true);
  };

  useEffect(() => {
    const newQuantities = {};
    cartItems.forEach((item) => {
      newQuantities[item.id] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cartItems]);


  const handleQuantityChange = async (itemId, newQuantity) => {
    await dispatch(updateCartItemQty({ itemId, quantity: newQuantity }));
    setQuantities((prev) => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  };

  const renderItems = () => {
    if (!cartItems || cartItems.length === 0) {
      return <p>Your cart is empty.</p>;
    }

    const groupedItems = cartItems.reduce((acc, item) => {
      if (!acc[item.owner.id]) {
        acc[item.owner.id] = [];
      }

      acc[item.owner.id].push(item);
      return acc;
    }, {});

    return Object.keys(groupedItems).map((ownerId, index) => {
      const owner = groupedItems[ownerId];
      return (
        <div className="owner-group" key={index}>
          <div className="header">
            <a href={`${baseUrl}/user/${ownerId}`} className="owner-name">
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
                src={item.image || defaultImages}
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
                {item.itemType === "buy" && (
                  <QuantityControl
                    quantity={quantities[item.id]}
                    setQuantity={(newQty) =>
                      handleQuantityChange(item.id, newQty)
                    }
                    min={1}
                    max={item?.stock || 10}
                  />
                )}

                <button
                  className="btn btn-danger"
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
    <div id="cart-popup">
      <div ref={cartRef} className={`cart container ${isOpen ? "open" : ""}`}>
        <div
          className="header2"
          style={{ display: "flex", alignItems: "center" }}
        >
          <h2 className="header-text">Your Cart</h2>
          <button className="close-btn2" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="idkna">
          <div className="bulk-actions2">
            <div
              className=" px-3"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <label>Select All</label>
              <button className="btn btn-danger" onClick={handleBulkRemove}>
                Remove Selected
              </button>
            </div>
          </div>
          <div className="cart-items">
            {renderItems()}
          </div>
          <button
            className="btn btn-primary checkout-btn px-3"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Item Removal */}
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

      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onHide={() => setShowCheckout(false)}
        items={cartItems.filter((item) => selectedItems.includes(item.id))}
      />
    </div>
  );
};

export default Cart;
