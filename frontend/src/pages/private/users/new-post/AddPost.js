// Import necessary libraries and components
import React, { useState, useEffect, useReducer } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import {
  onBlur,
  onInputChange,
  UPDATE_POSTING_FORM,
} from "../../../../hooks/input-reducers/postingInputReducer";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";

// Import custom components
import "./addPostStyles.css";
import { ImageUpload } from "../common-input-handler/ImageUpload";
import { HandleSpecifications } from "../common-input-handler/HandleSpecifications";
import UserToolbar from "../../../../components/users/user-toolbar/UserToolbar";
import { HandleCustomDateAndTime } from "../common-input-handler/HandleCustomDateAndTime";
import { HandleWeeklyDateAndTime } from "../common-input-handler/HandleWeeklyDateAndTime";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import DateDurationPicker from "./DateDurationPicker";

const initialState = {
  itemName: { value: "", triggered: false, hasError: true, error: "" },
  description: { value: "", triggered: false, hasError: true, error: "" },
  category: { value: "", triggered: false, hasError: true, error: "" },
  tags: { value: [], triggered: false, hasError: true, error: "" },
  status: { value: "", triggered: false, hasError: true, error: "" },
  images: { value: [], triggered: false, hasError: true, error: "" },
  userId: { value: "", triggered: false, hasError: true, error: "" },
  specifications: { value: [], triggered: false, hasError: true, error: "" },
  dateAndTime: { value: "", triggered: false, hasError: true, error: "" },
};

// Reducer to manage form state updates and validation errors
const formsReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_POSTING_FORM:
      return {
        ...state,
        [action.data.name]: {
          ...state[action.data.name],
          value: action.data.value,
          hasError: action.data.hasError,
          error: action.data.error,
          triggered: action.data.triggered,
        },
        isFormValid: action.data.isFormValid, // Update form validity based on input state
      };
    default:
      return state;
  }
};

// AddPost Component
const AddPost = () => {
  const [postDataState, dispatch] = useReducer(formsReducer, initialState);
  const [postData, setPostData] = useState({
    post_item_name: "",
    description: "",
    category: "",
    tags: [],
    status: "approved",
    images: [],
    renter_id: "",
    specifications: [],
    dateAndTime: [],
  });

  const { studentUser } = useAuth(); // Access current user context
  const { userId } = studentUser;

  const {
    user,
    student,
    errorMessage: fetchErrorMessage,
  } = FetchUserInfo({ userId });
  const [errorMessage, setErrorMessage] = useState(fetchErrorMessage); // Error message state

  // Sync post data with user and student info when they change
  useEffect(() => {
    if (user.user_id && student.college) {
      setPostData((prevData) => ({
        ...prevData,
        renter_id: user.user_id,
        category: student.college,
      }));
    }
  }, [user, student]);

  // Other form-related state
  const [newTag, setNewTag] = useState(""); // For adding new tags
  const [isExpanded, setIsExpanded] = useState(false); // Toggle for expanded fields
  const [settingDateOption, SetSettingDateOption] = useState("custom"); // Date option (custom or weekly)
  const [selectedDates, setSelectedDates] = useState([]); // To hold the selected date and time periods

  // Toggle the expanded state for extra form fields
  const toggleGroup = () => setIsExpanded(!isExpanded);

  // Handle form submission (post creation)
  const handleSubmit = async () => {
    console.log(postData);
    try {
      const response = await axios.post("http://localhost:3001/posts/create", {
        post: {
          post_item_name: postData.post_item_name,
          description: postData.description,
          category: postData.category,
          tags: [...postData.tags],
          status: postData.status,
          images: postData.images,
          renter_id: postData.renter_id,
          specifications: postData.specifications,
        },
        rental_dates: postData.dateAndTime,
      });

      //toast success notification
      toast.success("Post created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      setErrorMessage("Failed to create post.");
      // toast error notification
      toast.error("Failed to create post. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Add a tag to the post data
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag !== "") {
      setPostData((prevData) => ({
        ...prevData,
        tags: [...prevData.tags, trimmedTag],
      }));
      setNewTag(""); // Clear input after adding tag
    } else {
      alert("Tag cannot be empty!");
    }
  };

  // Remove a specific tag from the post data
  const handleRemoveTag = (tagToRemove) => {
    setPostData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="container-content">
      <ToastContainer />
      <label>Create Post</label>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Form Container */}
      <div className="form-container">
        <div className="form-preview w-100">
          {/* Image Upload Section */}
          <ImageUpload data={postData} setData={setPostData} />

          <div className="">
            {/* Post Item Name */}
            <div className="field-container">
              <button className="btn btn-rounded thin">CIT</button>
            </div>

            <div>
              <DateDurationPicker
                show={true}
                onClose={() => console.log("Modal closed")}
                onDateChange={(selectedDates) => setSelectedDates(selectedDates)} // Update selected dates when changed
              />
            </div>

            {/* Display a summary of selected dates and time periods */}
            <div>
              <h3>Selected Dates and Time Periods:</h3>
              {selectedDates.length === 0 ? (
                <p>No dates selected yet.</p>
              ) : (
                <ul>
                  {selectedDates.map((dateItem, index) => (
                    <li key={index}>
                      <strong>{dateItem.date.toDateString()}</strong>
                      {dateItem.timePeriods.length === 0 ? (
                        <p>No time periods added for this date.</p>
                      ) : (
                        <ul>
                          {dateItem.timePeriods.map((period, index) => (
                            <li key={index}>
                              {`Start: ${period.startTime} | End: ${period.endTime}`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="field-container">
              <div className="input-wrapper">
                <input
                  id="itemName"
                  name="itemName"
                  className="input"
                  placeholder="Item name"
                  required
                  type="text"
                  value={postDataState.itemName.value}
                  onChange={(e) =>
                    onInputChange(
                      "itemName",
                      e.target.value,
                      dispatch,
                      postDataState
                    )
                  }
                  onBlur={(e) =>
                    onBlur("itemName", e.target.value, dispatch, postDataState)
                  }
                />
              </div>
              {postDataState.itemName.triggered &&
                postDataState.itemName.hasError && (
                  <div className="validation error">
                    <img
                      src={warningIcon}
                      className="icon"
                      alt="Error on middle name"
                    />{" "}
                    <span className="text">{postDataState.itemName.error}</span>
                  </div>
                )}
            </div>
            <hr />

            {/* Rental Dates Section */}
            <div className="groupby bg-white p-0">
              {/* Tags Section */}
              <div>
                <label>Tags</label>
                <div className="tag-input d-flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="borderless"
                  />
                  <button className="btn btn-primary" onClick={handleAddTag}>
                    +
                  </button>
                </div>
                {/* Display Added Tags */}
                <div className="tags-list">
                  {postData.tags.map((tag, index) => (
                    <div key={index} className="tag-display">
                      {tag}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        -
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Toolbar and Specifications */}
      <UserToolbar
        userProfilePic={""}
        user={user}
        isProfileVisit={false}
        userRating={""}
        buttonText1="View Posts"
        buttonText2="View Profile"
        activeTab="Posts"
        isDisabled={true}
      />
      <HandleSpecifications data={postData} setData={setPostData} />

      {/* Submit Button */}
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default AddPost;
