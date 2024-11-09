import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./addPostStyles.css";
import { ImageUpload } from "./ImageUpload";
import { HandleSpecifications } from "./HandleSpecifications";
import { UserToolbar } from "./UserToolbar";
import { HandleCustomDateAndTime } from "./HandleCustomDateAndTime";
import { HandleWeeklyDateAndTime } from "./HandleWeeklyDateAndTime";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const AddPost = () => {
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

  const { studentUser } = useAuth();
  const {userId} = studentUser;

  const {
    user,
    student,
    errorMessage: fetchErrorMessage,
  } = FetchUserInfo({userId});
  const [errorMessage, setErrorMessage] = useState(fetchErrorMessage);



  useEffect(() => {
    if (user.user_id && student.college) {
      setPostData((prevData) => ({
        ...prevData,
        renter_id: user.user_id,
        category: student.college,
      }));
    }
  }, [user, student]);

  const [newTag, setNewTag] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [settingDateOption, SetSettingDateOption] = useState("custom");

  const toggleGroup = () => setIsExpanded(!isExpanded);

  const handleSubmit = async () => {
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

      console.log(response.data);
      //toast success notification
      toast.success('Post created successfully!', {
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
    toast.error('Failed to create post. Please try again.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
    }
  };

  const handlePaymentChange = (event) => {
    setPostData((prevData) => ({
      ...prevData,
      paymentMode: event.target.value,
    }));
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag !== "") {
      setPostData((prevData) => ({
        ...prevData,
        tags: [...prevData.tags, trimmedTag],
      }));
      setNewTag("");
    } else {
      alert("Tag cannot be empty!");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPostData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  return (
    <div className="container-content">
      {/* ToastContainer at the root level */}
      <ToastContainer />
      <h2>Create Post</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="form-preview w-100">
          <ImageUpload postData={postData} setPostData={setPostData} />

          <div className="form-fields bg-white p-3 rounded">
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

            <div className="groupby bg-white p-0">
              <div className="rental-dates d-block">
                <label>Rental Dates</label>
                <input
                  type="radio"
                  id="custom-dates"
                  name="rentalDates"
                  checked={settingDateOption === "custom"}
                  onChange={() => SetSettingDateOption("custom")}
                />
                <label htmlFor="custom-dates">Custom Dates</label>
                <input
                  type="radio"
                  id="weekly"
                  name="rentalDates"
                  checked={settingDateOption === "weekly"}
                  onChange={() => SetSettingDateOption("weekly")}
                />
                <label htmlFor="weekly">Weekly</label>
              </div>

              {settingDateOption === "custom" && (
                <HandleCustomDateAndTime
                  postData={postData}
                  setPostData={setPostData}
                />
              )}

              {settingDateOption === "weekly" && (
                <HandleWeeklyDateAndTime
                  postData={postData}
                  setPostData={setPostData}
                />
              )}

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
                  <div><button className="btn btn-primary"onClick={handleAddTag}>+</button></div>
                  
                </div>
                <div className="tags-list">
                  {postData.tags.map((tag, index) => (
                    <div key={index} className="tag-display">
                      {tag}
                      <button className="btn btn-danger" onClick={() => handleRemoveTag(tag)}>
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

      <UserToolbar userInfo={{ user, student }} />
      <HandleSpecifications postData={postData} setPostData={setPostData} />
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default AddPost;
