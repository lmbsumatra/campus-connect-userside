import { useState } from "react";
import { Modal } from "react-bootstrap";
import "./heroActionCardsStyles.css";
import addItemIcon from "../assets/images/header/add-item.svg";
import createPostIcon from "../assets/images/header/create-post.svg";
import forRentIcon from "../assets/images/card/rent.svg";
import forSaleIcon from "../assets/images/card/buy.svg";
import { useDispatch, useSelector } from "react-redux";
import ShowAlert from "../utils/ShowAlert";
import { useNavigate } from "react-router-dom";
import { selectStudentUser } from "../redux/auth/studentAuthSlice";
import { checkSlotLimit } from "../components/item-card/checkSlotLimit";

const FOR_SALE = "itemForSale";
const FOR_RENT = "listingForRent";
const POST_LOOKING = "postLookingForItem";

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

const HeroActionCards = ({ show, hide }) => {
  const { user } = useSelector((state) => state.user);
  const studentUser = useSelector(selectStudentUser);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const token = studentUser?.token || "";
  const { config } = useSelector((state) => state.systemConfig);


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
        setShowTypeSelection(false);
        navigate("/profile/my-listings/add", {
          state: { itemType: itemType },
        });
      } else {
        setShowTypeSelection(false);
      }
    } catch (error) {
      console.error("Error checking slot availability:", error);
      ShowAlert(
        dispatch,
        "error",
        "Error",
        "Failed to check available slots. Please try again later."
      );
      setShowTypeSelection(false);
    }
  };

  const addItem = () => {
    hide();
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

    setShowTypeSelection(true);
  };

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

  return (
    <>
      {/* Main Modal for Action Selection */}
      <Modal centered show={show} onHide={hide} dialogClassName="modal-width">
        <div className="hero-actions-container">
          <div className="card" onClick={addItem}>
            <label>
              <img src={addItemIcon} alt="Add Item" />
              <h2>Add Item</h2>
            </label>
            <p>Choose if it's for sale or rent, adhering to our policy.</p>
          </div>

          <div className="card" onClick={createPost}>
            <label>
              <img src={createPostIcon} alt="Create Post" />
              <h2>Create Post</h2>
            </label>
            <p>Create a post for wanted items for rent or purchase.</p>
          </div>
        </div>
      </Modal>

      {/* Type Selection Popup */}
      {showTypeSelection && (
        <TypeSelectionPopup
          onSelect={handleTypeSelection}
          onClose={() => setShowTypeSelection(false)}
        />
      )}
    </>
  );
};

export default HeroActionCards;
