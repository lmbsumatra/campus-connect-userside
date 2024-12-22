import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { formatTimeTo12Hour } from "../../../../utils/timeFormat";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; 

import userProfilePicture from "../../../../assets/images/icons/user-icon.svg";
import prevIcon from "../../../../assets/images/pdp/prev.svg";
import nextIcon from "../../../../assets/images/pdp/next.svg";
import itemImage1 from "../../../../assets/images/item/item_1.jpg";
import itemImage2 from "../../../../assets/images/item/item_2.jpg";
import itemImage3 from "../../../../assets/images/item/item_3.jpg";
import itemImage4 from "../../../../assets/images/item/item_4.jpg";
import forRentIcon from "../../../../assets/images/card/rent.svg";
import forSaleIcon from "../../../../assets/images/card/buy.svg";
import "./itemForSaleDetailStyles.css";

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
import { fetchApprovedItemForSaleById } from "../../../../redux/item-for-sale/approvedItemForSaleByIdSlice";

function ItemForSaleDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [showDurations, setShowDurations] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    approvedItemForSaleById,
    loadingApprovedItemForSaleById,
    errorApprovedItemForSaleById,
  } = useSelector((state) => state.approvedItemForSaleById);
  const studentUser = useSelector(selectStudentUser);
  const { userId } = studentUser;
  const rentalDates = approvedItemForSaleById.rentalDates || [];
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
      dispatch(fetchApprovedItemForSaleById(id));
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
    const selectedRentalDate = approvedItemForSaleById.rentalDates.find(
      (rentalDate) => rentalDate.id === dateId
    );

    if (selectedRentalDate && selectedRentalDate.durations) {
      setSelectedDate(selectedRentalDate.date);
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
    if (college) {
      return require(`../../../../assets/images/colleges/${college}.png`);
    } else {
      return null;
    }
  };

  const handleSelectDeliveryMethod = (method) => {
    console.log(method);
  };


  if (loading) {
    return (
      <div className="container-content post-detail">
        <div className="itemforsale-container">
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
        <div className="itemforsale-container owner-info">
          <Skeleton width={60} height={60} circle />
          <Skeleton width={120} height={20} style={{ marginTop: "10px" }} />
          <Skeleton width={80} height={30} style={{ marginTop: "10px" }} />
        </div>
        <div className="itemforsale-container post-desc">
          <Skeleton width={200} height={20} />
          <Skeleton count={4} height={20} style={{ marginTop: "10px" }} />
        </div>
      </div>
    );
  }

  if (errorApprovedItemForSaleById) {
    return <p>Error: {errorApprovedItemForSaleById}</p>;
  }

  if (!approvedItemForSaleById) {
    return <p>Item not found</p>;
  }

  return (
    <div className="container-content post-detail">
      <div className="itemforsale-container">
        <div className="imgs-container">
          <Tooltip
            title={`This item is ${
              approvedItemForSaleById.itemType === FOR_RENT
                ? FOR_RENT
                : FOR_SALE
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
                approvedItemForSaleById.itemType === FOR_RENT
                  ? forRentIcon
                  : forSaleIcon
              }
              alt={
                approvedItemForSaleById.itemType === FOR_RENT
                  ? FOR_RENT
                  : FOR_SALE
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
              <Tooltip
                title={`This item is from ${
                  approvedItemForSaleById?.seller?.college
                    ? approvedItemForSaleById.seller.college
                    : ""
                }.`}
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
                <img
                  src={getCollegeBadgeUrl(
                    approvedItemForSaleById?.seller?.college
                      ? approvedItemForSaleById.seller.college
                      : ""
                  )}
                  alt="College"
                  style={{ height: "24px", width: "24px" }}
                />
                {approvedItemForSaleById?.seller?.college
                  ? approvedItemForSaleById.seller.college
                  : ""}
              </Tooltip>
            </div>
            <div className="category-badge">
              <Tooltip
                title={`This item is under ${approvedItemForSaleById.category} category.`}
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
                {approvedItemForSaleById.category ? (
                  <span>{approvedItemForSaleById.category}</span>
                ) : (
                  <span className="error-msg">No category</span>
                )}
              </Tooltip>
            </div>
          </div>
          <div className="item-title">
            <>
              <i>For rent </i>
              {approvedItemForSaleById.name ? (
                <span className="title">{approvedItemForSaleById.name}</span>
              ) : (
                <span className="error-msg">No available name.</span>
              )}
            </>
          </div>
          <div className="item-price">
            {approvedItemForSaleById.price ? (
              <span className="price">₱ {approvedItemForSaleById.price}</span>
            ) : (
              <span className="error-msg">No available price.</span>
            )}
          </div>
          <div className="action-btns">
            <button className="btn btn-rectangle secondary">Message</button>
            <button
              className="btn btn-rectangle primary"
              onClick={handleOfferClick}
            >
              {approvedItemForSaleById.itemType === FOR_RENT ? "Rent" : "Buy"}
            </button>
          </div>
          <hr />
          <div className="rental-dates-durations">
            <div className="date-picker">
              <span>
                Pick a date to{" "}
                {approvedItemForSaleById.itemType === FOR_RENT ? "rent" : "buy"}
                :
              </span>
              <DatePicker
                inline
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={(date) => {
                  const clickedDateId = rentalDates.find(
                    (rentalDate) =>
                      new Date(rentalDate.date).toDateString() ===
                      date.toDateString()
                  )?.id;

                  if (clickedDateId) {
                    handleDateClick(clickedDateId);
                  }
                  setSelectedDate(date);
                  const rentalDate = rentalDates.find(
                    (r) =>
                      new Date(r.date).toDateString() === date.toDateString()
                  );
                  if (rentalDate && rentalDate.status === "available") {
                    setShowDurations(rentalDate.durations);
                  } else {
                    setShowDurations(null);
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

            {approvedItemForSaleById.deliveryMethod ? (
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
                  {approvedItemForSaleById.deliveryMethod}
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
                        approvedItemForSaleById.deliveryMethod === MEET_UP
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectDeliveryMethod("meetup")}
                    >
                      Meet up
                    </button>
                    <button
                      className={`value ${
                        approvedItemForSaleById.deliveryMethod === PICK_UP
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

            {approvedItemForSaleById.paymentMethod ? (
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
                  {approvedItemForSaleById.paymentMethod}
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
                        approvedItemForSaleById.paymentMethod === PICK_UP
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
              {approvedItemForSaleById.itemCondition ? (
                <span className="value">
                  {approvedItemForSaleById.itemCondition}
                </span>
              ) : (
                <span className="error-msg">No item condition specified.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="itemforsale-container owner-info">
        <div className="user-link">
          <img
            src={userProfilePicture}
            alt="Profile picture"
            className="profile-avatar"
          />
          <div>
            <a href={``} className="username">
              {approvedItemForSaleById.owner &&
              approvedItemForSaleById.owner.fname &&
              approvedItemForSaleById.owner.lname
                ? `${approvedItemForSaleById.owner.fname} ${approvedItemForSaleById.owner.lname}`
                : "You"}
            </a>
          </div>
        </div>
        <div className="rating-label">Rating</div>
        <button className="btn btn-rectangle primary">View Listings</button>
        <button className="btn btn-rectangle secondary">View Profile</button>
      </div>

      <div className="itemforsale-container post-desc">
        <label className="sub-section-label">Specifications</label>
        <table className="specifications-table" role="table">
          <tbody>
            {(() => {
              try {
                const specs = approvedItemForSaleById.specs
                  ? Object.entries(JSON.parse(approvedItemForSaleById.specs))
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
          {approvedItemForSaleById.desc &&
          approvedItemForSaleById.tags !== "undefined" ? (
            approvedItemForSaleById.desc
          ) : (
            <span className="error-msg">No description</span>
          )}
        </p>

        <div className="tags-holder">
          <i>Tags: </i>
          {approvedItemForSaleById.tags &&
          approvedItemForSaleById.tags !== "undefined" ? (
            JSON.parse(approvedItemForSaleById.tags).map((tag, index) => (
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

export default ItemForSaleDetail;
