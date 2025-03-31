import React, { useState, useEffect } from "react";
import "./fabStyles.css";
import { useNavigate } from "react-router-dom";
import createPostIcon from "../../../assets/images/fab/POSTS.svg";
import addItemIcon from "../../../assets/images/fab/RENTALS.svg";
import cartIcon from "../../../assets/images/fab/cart.svg";
import Cart from "../../../pages/private/users/cart/Cart";
import useHandleActionWithAuthCheck from "../../../utils/useHandleActionWithAuthCheck";
import ShowAlert from "../../../utils/ShowAlert";
import { useDispatch, useSelector } from "react-redux";

const FAB = ({ cartItems }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();

  // Add effect to ensure cart state is consistent with menu state
  useEffect(() => {
    if (!isMenuOpen && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [isMenuOpen, isCartOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const createPost = () => {
    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot create posts.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot create post at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
    if (isVerified !== "verified" || isEmailVerified !== true) {
      ShowAlert(
        dispatch,
        "warning",
        "Access Denied",
        "You must be verified to proceed.",
        {
          text: "View Profile",
          action: () => {
            navigate("/profile/edit-profile");
          },
        }
      );
      return;
    }

    handleActionWithAuthCheck("/profile/my-listings/add");
  };

  const addItem = () => {
    // Ban check
    if (isVerified === "banned") {
      ShowAlert(
        dispatch,
        "warning",
        "Account Banned",
        "Your account is permanently banned. You cannot add item.",
        { text: "Ok" }
      );
      return;
    }

    // Restricted status check (regardless of date)
    if (isVerified === "restricted") {
      // Try to get the restriction end date
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
        // Try to extract from statusMsg
        const dateMatch = user.student.statusMsg.match(
          /restricted until ([^\.]+)/i
        );
        if (dateMatch && dateMatch[1]) {
          try {
            restrictionDate = new Date(dateMatch[1].trim());
          } catch (e) {
            console.error("Failed to parse date from statusMsg:", e);
          }
        }
      }

      // Check if the restriction is still active
      const isCurrentlyRestricted =
        restrictionDate &&
        !isNaN(restrictionDate.getTime()) &&
        restrictionDate > new Date();

      if (isCurrentlyRestricted) {
        ShowAlert(
          dispatch,
          "warning",
          "Account Restricted",
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot add items at this time.`,
          { text: "Ok" }
        );
      } else {
        // Restriction expired but status still "restricted"
        ShowAlert(
          dispatch,
          "warning",
          "Account Status Issue",
          "Your account has a restriction status that needs attention. Please contact support or check your profile.",
          {
            text: "View Profile",
            action: () => navigate("/profile/edit-profile"),
          }
        );
      }
      return;
    }

    // Other status checks (pending, flagged, etc.)
    if (isVerified !== "verified" || isEmailVerified !== true) {
      ShowAlert(
        dispatch,
        "warning",
        "Access Denied",
        "You must be verified to proceed.",
        {
          text: "View Profile",
          action: () => {
            navigate("/profile/edit-profile");
          },
        }
      );
      return;
    }

    handleActionWithAuthCheck("/profile/my-listings/add");
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

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
        <button
          className={`fab-main ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          +
        </button>
      </div>

      {/* Always render the Cart for non-mobile */}
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default FAB;
