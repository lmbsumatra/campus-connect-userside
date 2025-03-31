import { Modal } from "react-bootstrap";
import "./heroActionCardsStyles.css";
import addItemIcon from "../assets/images/header/add-item.svg";
import createPostIcon from "../assets/images/header/create-post.svg";
import useHandleActionWithAuthCheck from "../utils/useHandleActionWithAuthCheck";
import { useDispatch, useSelector } from "react-redux";
import ShowAlert from "../utils/ShowAlert";
import { useNavigate } from "react-router-dom";
import { selectStudentUser } from "../redux/auth/studentAuthSlice";

const HeroActionCards = ({ show, hide }) => {
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const studentUser = useSelector(selectStudentUser);
  const isVerified = user?.student?.status ?? false;
  const isEmailVerified = user?.user?.emailVerified ?? false;
  const restrictedUntil = user?.student?.restricted_until;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addItem = (hide) => {
    // First check if user is logged in
    if (studentUser === null) {
      hide(); // Hide modal first
      ShowAlert(dispatch, "warning", "Action Required", "Please login first", {
        text: "Login",
        action: () => {
          navigate("/", { state: { showLogin: true, authTab: "loginTab" } });
        },
      });
      return;
    }

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

    // User is logged in and verified, proceed
    navigate("/profile/my-listings/add");
    hide();
  };

  const createPost = (hide) => {
    // First check if user is logged in
    if (studentUser === null) {
      hide(); // Hide modal first
      ShowAlert(dispatch, "warning", "Action Required", "Please login first", {
        text: "Login",
        action: () => {
          navigate("/", { state: { showLogin: true, authTab: "loginTab" } });
        },
      });
      return;
    }

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
          `Your account is temporarily restricted until ${restrictionDate.toLocaleString()}. You cannot create posts at this time.`,
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

    // User is logged in and verified, proceed
    navigate("/profile/my-posts/new");
    hide();
  };

  return (
    <>
      <Modal centered show={show} onHide={hide} dialogClassName="modal-width">
        <div className="hero-actions-container">
          <div className="card" onClick={() => addItem(hide)}>
            <label>
              <img src={addItemIcon} alt="" />
              <h2>Add Item</h2>
            </label>
            <p>
              Click here to add an item. <br />
              You can choose whether it is for sale or rent only as long as it
              adheres to our policy. Read <a href="">here.</a>
            </p>
          </div>

          <div className="card" onClick={() => createPost(hide)}>
            <label>
              <img src={createPostIcon} alt="" />
              <h2>Create Post</h2>
            </label>
            <p>
              Click here to create new post. <br />
              You are allowed to post items you are looking for either renting
              or buying as long as it is aligned with our policy. Read{" "}
              <a href="">here.</a>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HeroActionCards;
