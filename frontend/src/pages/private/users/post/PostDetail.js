import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostDetails } from "../../../../redux/post/postSlice";

// Custom hooks and utility functions
import { useAuth } from "../../../../context/AuthContext";
import { formatDate } from "../../../../utils/dateFormat";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";

// Assets
import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import UserToolbar from "../../../../components/users/user-toolbar/UserToolbar";
import "./postDetailStyles.css";

function PostDetail() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [college, setCollege] = useState("CIE");
  const { id } = useParams(); // Get the post ID from URL params
  const dispatch = useDispatch();
  
  // Fetch post details using the ID from the URL
  useEffect(() => {
    if (id) {
      dispatch(fetchPostDetails(id)); // Dispatch action to fetch post details by ID
    }
  }, [dispatch, id]);

  // Fetching post details from Redux store
  const { post, loading, error } = useSelector((state) => state.post);

  const { studentUser } = useAuth();
  const { userId } = studentUser;

  // State for the selected rental date
  const [selectedDate, setSelectedDate] = useState(null);

  // Images for the slider
  const images = [
    itemImage1,
    itemImage2,
    itemImage3,
    itemImage4,
    itemImage4,
    itemImage4,
    itemImage4,
  ];

  // Navigation for image slider
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };
  const highlightImage = (index) => {
    setCurrentIndex(index);
  };

  // Fetch post details using the ID from the URL
  useEffect(() => {
    if (id) {
      dispatch(fetchPostDetails(id)); // Dispatch action to fetch post details by ID
    }
  }, [dispatch, id]);

  // Debugging: Log the fetched post data to the console
  console.log(post);

  // Handle loading and error states
  if (loading) {
    return <p>Loading...</p>; // Show loading state
  }

  if (error) {
    return <p>Error: {error}</p>; // Show error if any
  }

  if (!post) {
    return <p>Item not found</p>; // Show if post is not found
  }

  const isProfileVisit = userId === post.renterId;

  return (
    <div className="container-content">
      <div className="post-container">
        <div className="imgs-container">
          <div className="highlight">
            <img
              src={images[currentIndex]}
              alt="Item"
              className="highlight-img"
            />
            <Tooltip
              title={"This is a tooltip"}
              componentsProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -10], // Adjust tooltip position
                      },
                    },
                  ],
                },
              }}
            >
              <img
                src={forRentIcon}
                alt={`Item is for rent`}
                className="item-type"
              />
            </Tooltip>
          </div>
          {/* Image Slider */}
          <div className="img-slider">
            <div className="btn-slider prev-btn" onClick={prevImage}>
              <img src={prevIcon} alt="Previous image" className="prev-btn" />
            </div>
            <img
              src={images[(currentIndex - 2 + images.length) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex - 2) % images.length)}
            />
            <img
              src={images[(currentIndex - 1 + images.length) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex - 1) % images.length)}
            />
            <img
              src={images[currentIndex]}
              alt="Item"
              className="item-img center"
            />
            <img
              src={images[(currentIndex + 1) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex + 1) % images.length)}
            />
            <img
              src={images[(currentIndex + 2) % images.length]}
              alt="Item"
              className="item-img"
              onClick={() => highlightImage((currentIndex + 2) % images.length)}
            />
            <div className="btn-slider next-btn" onClick={nextImage}>
              <img src={nextIcon} alt="Next image" className="next-btn" />
            </div>
          </div>
        </div>

        {/* Post Description */}
        <div className="item-desc">
          <div className="college-badge">
            <Tooltip title="This item is from CAFA." placement="bottom">
              <img
                src={require(`../../../../assets/images/colleges/CAFA.png`)}
                alt="College"
                style={{ height: "24px", width: "24px" }}
              />
              <span>CAFA</span>
            </Tooltip>
          </div>
          <div className="d-flex justify-content-between align-items-center m-0 p-0">
            <p>
              <i>Looking for </i>
              <strong>{post.name}</strong>
            </p>
          </div>
          <div className="d-flex justify-content-end">
            <button className="btn btn-rectangle secondary no-fill me-2">
              Message
            </button>
            <button className="btn btn-rectangle primary no-fill me-2">
              Offer
            </button>
          </div>
          <hr />
          <p>
            <strong>Request Dates</strong>
            {Array.isArray(post.rentalDates) && post.rentalDates.length > 0 ? (
              post.rentalDates.map((rental) => (
                <button
                  key={rental.date}
                  className="btn btn-rounded thin me-2 ms-2"
                  onClick={() => setSelectedDate(rental.date)}
                >
                  {formatDate(rental.date)}
                </button>
              ))
            ) : (
              <p>No rental dates available.</p>
            )}
          </p>

          <div>
            <p>
              <strong>Request Times</strong>
              {selectedDate ? (
                formatDate(selectedDate)
              ) : (
                <i>Please select a preferred date</i>
              )}{" "}
              :
            </p>
            {(selectedDate &&
              post.rentalDates
                .find((rental) => rental.date === selectedDate)
                ?.durations?.map((duration, index) => (
                  <button key={index} className="btn btn-rounded">
                    {formatTimeTo12Hour(duration.start_time)} -{" "}
                    {formatTimeTo12Hour(duration.end_time)}
                  </button>
                ))) || <p>No available times for this date</p>}
          </div>
        </div>
      </div>

      {/* <UserToolbar
        userProfilePic={""}
        user={post.renter}
        isProfileVisit={isProfileVisit}
        userRating={""}
        buttonText1="View Posts"
        buttonText2="View Profile"
        activeTab="Posts"
      /> */}

      {/* Item Specifications Section */}
      <div className="item-specs mt-5 p-4 bg-white">
        <h4>Item Specifications</h4>
        <table className="specifications-table">
          <thead>
            <tr>
              <th>Specification</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {post.specs && post.specs !== "undefined" ? (
              Object.entries(JSON.parse(post.specs)).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                  {value}
                </li>
              ))
            ) : (
              <p>No specifications available.</p>
            )}
          </tbody>
        </table>

        <hr />

        {/* Item Description Section */}
        <h4>Item Description</h4>
        <p>{post.desc}</p>

        {/* Tags Rendering */}
        <div className="tags-holder">
          {post.tags && post.tags !== "undefined" ? (
            JSON.parse(post.tags).map((tag, index) => (
              <div key={index} className="tag">
                {tag}
              </div>
            ))
          ) : (
            <p>No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
