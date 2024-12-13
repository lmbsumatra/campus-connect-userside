// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

// Import custom components
import "./addPostStyles.css";
import { ImageUpload } from "../common-input-handler/ImageUpload";
import { HandleSpecifications } from "../common-input-handler/HandleSpecifications";
import UserToolbar from "../../../../components/users/user-toolbar/UserToolbar";
import { HandleCustomDateAndTime } from "../common-input-handler/HandleCustomDateAndTime";
import { HandleWeeklyDateAndTime } from "../common-input-handler/HandleWeeklyDateAndTime";
import FetchUserInfo from "../../../../utils/FetchUserInfo";

// AddPost Component
const AddPost = () => {
  // Define the state for form data, error handling, etc.
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

  // Toggle the expanded state for extra form fields
  const toggleGroup = () => setIsExpanded(!isExpanded);

  // Handle form submission (post creation)
  const handleSubmit = async () => {
    console.log(postData)
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
      {/* ToastContainer to show notifications globally */}
      <ToastContainer />

      {/* Title and Error Message */}
      <h2>Create Post</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Form Container */}
      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="form-preview w-100">
          {/* Image Upload Section */}
          <ImageUpload data={postData} setData={setPostData} />

          <div className="form-fields bg-white p-3 rounded">
            {/* Post Item Name */}
            <button className="btn btn-rounded thin">CIT</button>
            <input
              type="text"
              placeholder="Item Name"
              className="borderless"
              value={postData.post_item_name}
              onChange={(e) =>
                setPostData({ ...postData, post_item_name: e.target.value })
              }
            />
            <hr />

            {/* Rental Dates Section */}
            <div className="groupby bg-white p-0">
              <div className="rental-dates d-block">
                <label>Rental Dates</label>
                <div className="d-flex gap-2">
                  <input
                    type="radio"
                    id="custom-dates"
                    name="rentalDates"
                    checked={settingDateOption === "custom"}
                    onChange={() => SetSettingDateOption("custom")}
                  />
                  <label htmlFor="custom-dates">Custom Dates</label>
                </div>
                <div className="d-flex gap-2">
                  <input
                    type="radio"
                    id="weekly"
                    name="rentalDates"
                    checked={settingDateOption === "weekly"}
                    onChange={() => SetSettingDateOption("weekly")}
                  />
                  <label htmlFor="weekly">Weekly</label>
                </div>
              </div>

              {/* Custom Date and Time Selection */}
              {settingDateOption === "custom" && (
                <HandleCustomDateAndTime
                  data={postData}
                  setData={setPostData}
                />
              )}

              {/* Weekly Date and Time Selection */}
              {settingDateOption === "weekly" && (
                <HandleWeeklyDateAndTime
                  data={postData}
                  setData={setPostData}
                />
              )}

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
