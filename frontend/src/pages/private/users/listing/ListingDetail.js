import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApprovedListingById } from "../../../../redux/listing/approvedListingByIdSlice";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { useAuth } from "../../../../context/AuthContext";
import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "react-loading-skeleton"; // Import Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton styles

import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import cartIcon from "../../../../assets/images/pdp/cart.svg";
import expandIcon from "../../../../assets/images/pdp/plus.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/rent.svg";
import "./listingDetailStyles.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { selectStudentUser } from "../../../../redux/auth/studentAuthSlice";
import axios from "axios";
import {
  FOR_RENT,
  FOR_SALE,
  MEET_UP,
  PICK_UP,
} from "../../../../utils/consonants";
import { addCartItem } from "../../../../redux/cart/cartSlice";
import { showNotification } from "../../../../redux/alert-popup/alertPopupSlice";

function ListingDetail() {
  console.log(
    "Notification state:",
    useSelector((state) => state.notification)
  );
  const { id } = useParams();
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    approvedListingById,
    loadingApprovedListingById,
    errorApprovedListingById,
  } = useSelector((state) => state.approvedListingById);
  const studentUser = useSelector(selectStudentUser);
  const rentalDates = approvedListingById.rentalDates || [];
  const [loading, setLoading] = useState(true);
  const [expandTerm, setExpandTerm] = useState(false);

  const images = [
    itemImage1,
    itemImage2,
    itemImage3,
    itemImage4,
    itemImage4,
    itemImage4,
    itemImage4,
  ];

  useEffect(() => {
    if (id) {
      dispatch(fetchApprovedListingById(id));
    }

    //  gusto ko lang makita yung lading skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch, id]);

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

  const handleDateClick = (dateId) => {
    const formatDate = (d) => d.toLocaleDateString("en-CA"); // Uses ISO format YYYY-MM-DD

    const selectedRentalDate = approvedListingById.rentalDates.find(
      (rentalDate) => rentalDate.id === dateId
    );

    if (selectedRentalDate && selectedRentalDate.durations) {
      setSelectedDate(formatDate(new Date(selectedRentalDate.date))); // Format the date before setting it
      setShowDurations(selectedRentalDate.durations);
    }
  };

  const handleSelectDuration = (duration) => {
    setSelectedDuration(duration);
  };

  const availableDates = rentalDates
    .filter((rentalDate) => rentalDate.status === "available")
    .map((rentalDate) => new Date(rentalDate.date));

  const handleOfferClick = async () => {
    if (selectedDate && selectedDuration) {
      setShowModal(true);
    } else {
      alert("Please select a date and duration before offering.");
    }
  };
  const handleConfirmOffer = async () => {
    if (selectedDate && selectedDuration) {
      try {
        const response = await axios.post("http://localhost:3001/api/send");
        alert("Email sent!");
      } catch (err) {
        alert(err);
      }
    } else {
      alert("Please select a date and duration before offering.");
    }
  };

  const getCollegeBadgeUrl = (college) => {
    console.log(college);

    // Check if college is defined and not null
    if (college !== undefined && college !== null) {
      try {
        // Attempt to load the badge for the given college
        return require(`../../../../assets/images/colleges/${college}.png`);
      } catch (error) {
        console.warn(
          `College badge not found for: ${college}, using default badge.`
        );
        // Return default badge if specific badge is not found
        return require(`../../../../assets/images/colleges/CAFA.png`);
      }
    } else {
      // Return default badge if college is undefined or null
      console.warn("College is undefined or null, using default badge.");
      return require(`../../../../assets/images/colleges/CAFA.png`);
    }
  };

  const handleSelectDeliveryMethod = (method) => {
    console.log(method);
  };

  const handleExpandTerms = () => {
    setExpandTerm(!expandTerm);
  };

   // Show notifications if error or no item found
   useEffect(() => {
    if (errorApprovedListingById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Item not found!",
        })
      );
    } else if (!loadingApprovedListingById && !approvedListingById) {
      dispatch(
        showNotification({
          type: "error",
          title: "Not Found",
          text: "No item found with the given ID.",
        })
      );
    }
  }, [errorApprovedListingById, loadingApprovedListingById, approvedListingById, dispatch]);


  if (loading) {
    return (
      <div className="container-content listing-detail">
        <div className="listing-container">
          <div className="imgs-container">
            <Skeleton height={200} />
            <Skeleton count={3} width={60} style={{ marginTop: "10px" }} />
          </div>
          <div className="rental-details">
            <Skeleton width={100} height={30} />
            <Skeleton count={2} height={20} style={{ marginTop: "10px" }} />
            <Skeleton height={50} style={{ marginTop: "20px" }} />
            <Skeleton height={20} style={{ marginTop: "10px" }} />
            <Skeleton count={3} height={20} style={{ marginTop: "10px" }} />
          </div>
        </div>
        <div className="listing-container owner-info">
          <Skeleton width={60} height={60} circle />
          <Skeleton width={120} height={20} style={{ marginTop: "10px" }} />
          <Skeleton width={80} height={30} style={{ marginTop: "10px" }} />
        </div>
        <div className="listing-container post-desc">
          <Skeleton width={200} height={20} />
          <Skeleton count={4} height={20} style={{ marginTop: "10px" }} />
        </div>
      </div>
    );
  }

  if (errorApprovedListingById || !approvedListingById) {
    return <div>No item available to display.</div>;
  }

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();

    // Show loading notification
    dispatch(
      showNotification({
        type: "loading",
        title: "Processing...",
        text: "Adding item to cart...",
      })
    );

    // Validation checks
    if (!selectedDate || !selectedDuration) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Please select a date and duration before adding to cart.",
        })
      );
      return;
    }

    const selectedDateId = approvedListingById.rentalDates.find(
      (rentalDate) => rentalDate.date === selectedDate
    )?.id;
    if (!selectedDateId) {
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Invalid date selection.",
        })
      );
      return;
    }

    const selectedDurationId = selectedDuration.id;

    try {
      // Dispatch the action to add item to the cart
      await dispatch(
        addCartItem({
          user_id: studentUser,
          owner_id: item.owner.id,
          transaction_type:
            item.itemType === "FOR_RENT" ? "FOR_RENT" : "FOR_SALE",
          date: selectedDateId,
          duration: selectedDurationId,
          item_id: item.id,
          price: item.rate,
        })
      );

      // Show success notification
      dispatch(
        showNotification({
          type: "success",
          title: "Success!",
          text: "Item added to cart successfully!",
        })
      );
    } catch (error) {
      // Show error notification in case of failure
      dispatch(
        showNotification({
          type: "error",
          title: "Error",
          text: "Failed to add item to cart.",
        })
      );
    }
  };

  return (
    <div className="container-content post-detail">
      <div className="listing-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedListingById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
            }`}
            componentsProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [0, 0],
                    },
                  },
                ],
              },
            }}
          >
            <img
              src={
                approvedListingById.itemType === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={
                approvedListingById.itemType === FOR_RENT ? FOR_RENT : FOR_SALE
              }
              className="item-type"
            />
          </Tooltip>
          <div
            className="highlight-bg"
            style={{
              backgroundImage: `url(${images[currentIndex]})`,
            }}
          ></div>

          <div className="highlight">
            <img
              src={images[currentIndex]}
              alt="Item"
              className="highlight-img"
            />
          </div>
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

        <div className="rental-details">
          <div>
            <div className="college-badge">
              {approvedListingById?.owner?.college && (
                <Tooltip
                  title={`This item is from ${approvedListingById?.owner?.college}.`}
                  placement="bottom"
                  componentsProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 0],
                          },
                        },
                      ],
                    },
                  }}
                >
                  {approvedListingById.owner.college && (
                    <img
                      src={getCollegeBadgeUrl(
                        approvedListingById?.owner?.college ?? "CAFA"
                      )}
                      alt="College"
                    />
                  )}

                  {approvedListingById.owner.college && (
                    <span>{approvedListingById.owner.college}</span>
                  )}
                </Tooltip>
              )}
            </div>
            <div className="category-badge">
              <Tooltip
                title={`This item is under ${approvedListingById.category} category.`}
                placement="bottom"
                componentsProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 0],
                        },
                      },
                    ],
                  },
                }}
              >
                {approvedListingById.category ? (
                  <span>{approvedListingById.category}</span>
                ) : (
                  <span className="error-msg"></span>
                )}
              </Tooltip>
            </div>
          </div>
          <div className="item-title">
            <>
              <i>For rent </i>
              {approvedListingById.name ? (
                <span className="title">{approvedListingById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>
          <div className="item-price">
            {approvedListingById.rate ? (
              <span className="price">₱ {approvedListingById.rate}</span>
            ) : (
              <span className="error-msg">No available name.</span>
            )}
          </div>
          <div className="action-btns">
            <button
              className="btn-icon"
              onClick={(e) => handleAddToCart(e, approvedListingById)}
            >
              <img src={cartIcon} alt="Add to cart" />
            </button>
            <button className="btn btn-rectangle secondary">Message</button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
            >
              {approvedListingById.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedListingById.itemType === FOR_RENT ? "rent" : "buy"}:
              </span>
              <DatePicker
                inline
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) => {
                  const rentalDate = rentalDates.find(
                    (r) =>
                      new Date(r.date).toDateString() === date.toDateString()
                  );

                  if (rentalDate) {
                    handleDateClick(rentalDate.id);
                  } else {
                    setShowDurations(null);
                    setSelectedDate(date);
                  }
                }}
                highlightDates={availableDates}
                dayClassName={(date) => {
                  return availableDates.some(
                    (d) => d.toDateString() === date.toDateString()
                  )
                    ? "bg-green"
                    : "";
                }}
              />
            </div>
            <div className="duration-picker group-container">
              <strong>Available Durations:</strong>
              <div>
                {selectedDate ? (
                  showDurations && showDurations.length > 0 ? (
                    <div className="duration-list">
                      {showDurations.map((duration) => (
                        <div key={duration.id} className="duration-item">
                          <input
                            type="checkbox"
                            id={`duration-${duration.id}`}
                            onChange={() => handleSelectDuration(duration)}
                          />
                          {formatTimeTo12Hour(duration.timeFrom)} -{" "}
                          {formatTimeTo12Hour(duration.timeTo)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-duration-message">
                      No available duration for this date.
                    </p>
                  )
                ) : (
                  <p className="select-date-message">
                    Please select a date first.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="group-container delivery-method ">
            <label className="label">Delivery Method</label>

            {approvedListingById.deliveryMethod ? (
              <Tooltip
                title="Delivery method has been preselected by owner."
                placement="bottom"
                componentsProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -10],
                        },
                      },
                    ],
                  },
                }}
              >
                <span className="value selected">
                  {approvedListingById.deliveryMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="Owner did not set delivery method, you decide whether to meetup or pickup."
                  placement="bottom"
                  componentsProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, -10],
                          },
                        },
                      ],
                    },
                  }}
                >
                  <div className="action-btns">
                    <button
                      className={`value ${
                        approvedListingById.deliveryMethod === MEET_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                    >
                      Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedListingById.deliveryMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                    >
                      Pick up
                    </button>
                  </div>
                </Tooltip>
              </div>
            )}
          </div>

          <div className="group-container payment-method ">
            <label className="label">Payment Method</label>

            {approvedListingById.paymentMethod ? (
              <Tooltip
                title="Delivery method has been preselected by owner."
                placement="bottom"
                componentsProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -10],
                        },
                      },
                    ],
                  },
                }}
              >
                <span className="value selected">
                  {approvedListingById.paymentMethod}
                </span>
              </Tooltip>
            ) : (
              <div className="delivery-method">
                <Tooltip
                  title="Owner did not set delivery method, you decide whether to meetup or pickup."
                  placement="bottom"
                >
                  <div className="action-btns">
                    <button
                      className="value selected"
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                    >
                      Pay upon Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedListingById.paymentMethod === PICK_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("pickup")}
                    >
                      Gcash
                    </button>
                  </div>
                </Tooltip>
              </div>
            )}
          </div>

          <div className="group-container item-condition">
            <label className="label">Item Condition</label>
            <div>
              {approvedListingById.itemCondition ? (
                <span className="value">
                  {approvedListingById.itemCondition}
                </span>
              ) : (
                <span className="error-msg">No item condition specified.</span>
              )}
            </div>
          </div>

          <div className={`group-container terms-group`}>
            <label className="sub-section-label">
              Terms and Condition{" "}
              <button
                className={`expand-btn ${expandTerm ? "expand" : ""}`}
                onClick={handleExpandTerms}
              >
                <img src={expandIcon} alt="Expand terms and condition" />
              </button>
            </label>

            {expandTerm && (
              <div className="terms-popup">
                <div className="term late-charges">
                  <label className="label">Late Charges</label>
                  <div>
                    {approvedListingById.lateCharges ? (
                      <span className="value">
                        {approvedListingById.lateCharges}
                      </span>
                    ) : (
                      <span className="error-msg">
                        No late charges specified.
                      </span>
                    )}
                  </div>
                </div>
                <div className="term deposit">
                  <label className="label">Security Deposit</label>
                  <div>
                    {approvedListingById.securityDeposit ? (
                      <span className="value">
                        {approvedListingById.securityDeposit}
                      </span>
                    ) : (
                      <span className="error-msg">
                        No security deposit specified.
                      </span>
                    )}
                  </div>
                </div>
                <div className="term repair-replacement">
                  <label className="label">Repair and Replacement</label>
                  <div>
                    {approvedListingById.repairReplacement ? (
                      <span className="value">
                        {approvedListingById.repairReplacement}
                      </span>
                    ) : (
                      <span className="error-msg">
                        No repair and replacement specified.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="listing-container owner-info">
        <div className="user-link">
          <img
            src={userProfilePicture}
            alt="Profile picture"
            className="profile-avatar"
          />
          <div>
            <a href={``} className="username">
              {approvedListingById.owner &&
              approvedListingById.owner.fname &&
              approvedListingById.owner.lname
                ? `${approvedListingById.owner.fname} ${approvedListingById.owner.lname}`
                : "You"}
            </a>
          </div>
        </div>
        <div className="rating-label">Rating</div>
        <button className="btn btn-rectangle primary">View Listings</button>
        <button className="btn btn-rectangle secondary">View Profile</button>
      </div>

      <div className="listing-container post-desc">
        <label className="sub-section-label">Specifications</label>
        <table className="specifications-table" role="table">
          <tbody>
            {(() => {
              try {
                const specs = approvedListingById.specs
                  ? Object.entries(JSON.parse(approvedListingById.specs))
                  : [];

                if (specs.length === 0) {
                  return (
                    <span className="error-msg">
                      No specifications available.
                    </span>
                  );
                }

                return specs.map(([key, value]) => (
                  <tr key={key}>
                    <td className="key">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </td>
                    <td className="value">{value}</td>
                  </tr>
                ));
              } catch (error) {
                return (
                  <span className="error-msg">
                    Error loading specifications.
                  </span>
                );
              }
            })()}
          </tbody>
        </table>
        <label className="sub-section-label">Description</label>
        <p>
          {approvedListingById.desc &&
          approvedListingById.tags !== "undefined" ? (
            approvedListingById.desc
          ) : (
            <span className="error-msg">No description</span>
          )}
        </p>

        <div className="tags-holder">
          <i>Tags: </i>
          {approvedListingById.tags &&
          approvedListingById.tags !== "undefined" ? (
            JSON.parse(approvedListingById.tags).map((tag, index) => (
              <div key={index} className="tag">
                {tag}
              </div>
            ))
          ) : (
            <span className="error-msg">No tags available</span>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Date:</strong> {new Date(selectedDate).toDateString()}
          </p>
          <p>
            <strong>Duration:</strong>
            {selectedDuration
              ? selectedDuration.timeFrom && selectedDuration.timeTo
                ? `${selectedDuration.timeFrom} - ${selectedDuration.timeTo}`
                : "Invalid duration"
              : "Nooooooooooo"}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleConfirmOffer()}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListingDetail;
