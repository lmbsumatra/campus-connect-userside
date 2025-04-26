import React, { useState, useEffect } from "react";
import "./fabStyles.css";
import { useNavigate } from "react-router-dom";
import createPostIcon from "../../../assets/images/fab/POSTS.svg";
import addItemIcon from "../../../assets/images/fab/RENTALS.svg";
import cartIcon from "../../../assets/images/fab/cart.svg";
import forRentIcon from "../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../assets/images/card/buy.svg";
import Cart from "../../../pages/private/users/cart/Cart";
import useHandleActionWithAuthCheck from "../../../utils/useHandleActionWithAuthCheck";
import ShowAlert from "../../../utils/ShowAlert";
import { useDispatch, useSelector } from "react-redux";
import { FOR_RENT, FOR_SALE } from "../../../utils/consonants";
import { checkSlotLimit } from "../../../components/item-card/checkSlotLimit";
import { selectStudentUser } from "../../../redux/auth/studentAuthSlice";

const FAB = ({ cartItems }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;
  const studentUser = useSelector(selectStudentUser);
  const token = studentUser?.token || "";
  const { config } = useSelector((state) => state.systemConfig);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showTypeSelectionPopup, setShowTypeSelectionPopup] = useState(false);

  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();

  useEffect(() => {
    if (!isMenuOpen && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [isMenuOpen, isCartOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const createPost = async () => {
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

    if (isVerified === "restricted") {
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
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

    if (!user || Object.keys(user).length === 0) {
      ShowAlert(dispatch, "warning", "Action Required", "Please login first", {
        text: "Login",
        action: () =>
          navigate("/", { state: { showLogin: true, authTab: "loginTab" } }),
      });
      return;
    }

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

    try {
      const hasAvailableSlots = await checkSlotLimit({
        dispatch,
        navigate,
        user,
        token,
        config,
        listingType: "postLookingForItem",
      });

      if (hasAvailableSlots) {
        navigate("/profile/my-posts/new");
      } else {
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Failed to check available slots. Please try again later."
      );
    }
  };

  const handleTypeSelection = async (itemType) => {
    try {
      const hasAvailableSlots = await checkSlotLimit({
        dispatch,
        navigate,
        user,
        token,
        config,
        listingType:
          itemType === FOR_RENT
            ? "listingForRent"
            : itemType === FOR_SALE
            ? "itemForSale"
            : "postLookingForItem",
      });

      if (hasAvailableSlots) {
        setShowTypeSelectionPopup(false);
        navigate("/profile/my-listings/add", {
          state: { itemType: itemType },
        });
      } else {
        setShowTypeSelectionPopup(false);
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Failed to check available slots. Please try again later."
      );
      setShowTypeSelectionPopup(false);
    }
  };

  const addItem = () => {
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

    if (isVerified === "restricted") {
      let restrictionDate = null;
      if (user?.student?.restricted_until) {
        restrictionDate = new Date(user.student.restricted_until);
      } else if (user?.student?.statusMsg) {
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

    if (!user || Object.keys(user).length === 0) {
      ShowAlert(dispatch, "warning", "Action Required", "Please login first", {
        text: "Login",
        action: () =>
          navigate("/", { state: { showLogin: true, authTab: "loginTab" } }),
      });
      return;
    }

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

    setShowTypeSelectionPopup(true);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const TypeSelectionPopup = ({ onSelect, onClose }) => {
    return (
      <div className="type-selection-overlay">
        <div className="type-selection-popup">
          <h3>What would you like to add?</h3>

          <div className="type-options">
            <button className="type-option" onClick={() => onSelect(FOR_RENT)}>
              <img src={forRentIcon} alt="For Rent" />
              <span>Item for Rent</span>
            </button>

            <button className="type-option" onClick={() => onSelect(FOR_SALE)}>
              <img src={forSaleIcon} alt="For Sale" />
              <span>Item for Sale</span>
            </button>
          </div>

          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
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

      {/* Item Type Selection Popup */}
      {showTypeSelectionPopup && (
        <TypeSelectionPopup
          onSelect={handleTypeSelection}
          onClose={() => setShowTypeSelectionPopup(false)}
        />
      )}

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
