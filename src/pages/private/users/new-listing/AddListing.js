import React, { useEffect, useState } from "react";

//  Styles
import "./addListingStyles.css";

//  Components
import { ImageUpload } from "../common-input-handler/ImageUpload";
import { HandleSpecifications } from "../common-input-handler/HandleSpecifications";
import { HandleCustomDateAndTime } from "../common-input-handler/HandleCustomDateAndTime";
import { HandleWeeklyDateAndTime } from "../common-input-handler/HandleWeeklyDateAndTime";

//  Contexts and Utilities
import { useAuth } from "../../../../context/AuthContext";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import { useSocket } from "../../../../context/SocketContext";

//  Libraries
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserToolbar from "../../../../components/users/user-toolbar/UserToolbar";

const AddListing = () => {
  //  Contexts & State
  const { studentUser } = useAuth();
  const { userId } = studentUser;
  const socket = useSocket();

  const {
    user,
    student,
    errorMessage: fetchErrorMessage,
  } = FetchUserInfo({ userId });
  const [errorMessage, setErrorMessage] = useState(fetchErrorMessage);

  const [listingData, setListingData] = useState({
    images: [],
    owner_id: "",
    category: "",
    name: "",
    rate: "",
    deliveryMode: "pickup",
    lateCharges: "",
    securityDeposit: "",
    repairReplacement: "",
    specifications: [],
    description: "",
    condition: "",
    tags: [],
    status: "pending",
    paymentMode: "",
    dateAndTime: [],
  });

  //  Local State for Form Handling
  const [newTag, setNewTag] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [settingDateOption, SetSettingDateOption] = useState("custom");
  const [isForSale, setIsForSale] = useState(false);

  //  Side Effects
  useEffect(() => {
    if (user.user_id && student.college) {
      setListingData((prevData) => ({
        ...prevData,
        owner_id: user.user_id,
        category: student.college,
      }));
    }
  }, [user, student]);

  useEffect(() => {
    if (socket) {
      console.log("Socket connected successfully");
    }
  }, [socket]);

  //  Toggle Functions
  const toggleGroup = () => setIsExpanded(!isExpanded);
  const toggleStatus = () => setIsForSale((prevStatus) => !prevStatus);

  //  Toast Notifications
  const handleSubmit = async () => {
    try {

      const endpoint = isForSale
        ? "http://localhost:3001/item-for-sale/add"
        : "http://localhost:3001/listings/add";

      const payload = isForSale
        ? {
            item: {
              seller_id: user.user_id,
              category: student.college,
              item_for_sale_name: listingData.name,
              price: listingData.rate,
              delivery_mode: listingData.deliveryMode,
              item_condition: listingData.condition,
              payment_mode: listingData.paymentMode,
              tags: [...listingData.tags],
              description: listingData.description,
              images: JSON.stringify(listingData.images),
              status: listingData.status,
              specifications: listingData.specifications,
            },
            rental_dates: listingData.dateAndTime,
          }
        : {
            listing: {
              owner_id: user.user_id,
              category: student.college,
              listing_name: listingData.name,
              rate: listingData.rate,
              delivery_mode: listingData.deliveryMode,
              late_charges: listingData.lateCharges,
              security_deposit: listingData.securityDeposit,
              repair_replacement: listingData.repairReplacement,
              specifications: listingData.specifications,
              description: listingData.description,
              listing_condition: listingData.condition,
              tags: [...listingData.tags],
              status: listingData.status,
              payment_mode: listingData.paymentMode,
              images: JSON.stringify(listingData.images),
            },
            rental_dates: listingData.dateAndTime,
          };

      const response = await axios.post(endpoint, payload);

      // Send notification after successful creation
      const notificationData = {
        type: isForSale ? "new-item-for-sale" : "new-listing",
        title: isForSale ? "New Item For Sale" : "New Listing Created",
        message: `New ${isForSale ? "item" : "listing"} "${
          listingData.name
        }" requires approval`,
        timestamp: new Date(),
        listingId: response.data.id,
        category: student.college,
        owner: {
          id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
        },
      };

      socket.emit("new-listing", notificationData);

      // Toast notification on success
      toast.success("Listing created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage("Failed to create listing.");

      // Toast notification on error
      toast.error("Failed to create listing. Please try again.", {
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

  //  Tag Handlers
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag) {
      setListingData((prevData) => ({
        ...prevData,
        tags: [...prevData.tags, trimmedTag],
      }));
      setNewTag("");
    } else {
      toast.warning("Tag cannot be empty!", {
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

  const handleRemoveTag = (tagToRemove) => {
    setListingData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  //  Handle Payment Method Change
  const handlePaymentChange = (e) => {
    setListingData({
      ...listingData,
      paymentMode: e.target.value,
    });
  };

  //  Form Layout and Fields
  return (
    <div className="container-content">
      {/* ToastContainer for Notifications */}
      <ToastContainer />

      <h2>Add item</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="py-4 px-2 m-0 rounded row bg-white">
        <div className="form-preview w-100">
          {/* Image Upload Component */}
          <ImageUpload
            listingData={listingData}
            setListingData={setListingData}
            isForSale={isForSale}
          />

          <div className="form-fields bg-white p-3 rounded">
            {/* CIT Button and Toggle Between For Rent and For Sale */}
            <div className="d-flex justify-content-between">
              <button className="btn btn-rounded thin">CIT</button>
              <div className="toggle-container">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={isForSale}
                    onChange={toggleStatus}
                  />
                  <span className="slider round"></span>
                </label>
                <span>{isForSale ? "For Sale" : "For Rent"}</span>
              </div>
            </div>

            {/* Item Name & Rate */}
            <input
              type="text"
              placeholder="Item Name"
              className="borderless"
              value={listingData.name}
              onChange={(e) =>
                setListingData({ ...listingData, name: e.target.value })
              }
            />
            <input
              type="text"
              className="borderless"
              value={listingData.rate}
              onChange={(e) =>
                setListingData({ ...listingData, rate: e.target.value })
              }
              placeholder="Add your price here per hour"
            />
            <hr />

            {/* Rental Dates Section */}
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
                  data={listingData}
                  setData={setListingData}
                />
              )}

              {settingDateOption === "weekly" && (
                <HandleWeeklyDateAndTime
                  data={listingData}
                  setData={setListingData}
                />
              )}

              {/* Delivery Mode */}
              <div className="groupby">
                <label>Delivery</label>
                <div className="delivery-options">
                  <label>
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={listingData.deliveryMode === "pickup"}
                      onChange={() =>
                        setListingData({
                          ...listingData,
                          deliveryMode: "pickup",
                        })
                      }
                    />
                    Pickup
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="delivery"
                      value="meetup"
                      checked={listingData.deliveryMode === "meetup"}
                      onChange={() =>
                        setListingData({
                          ...listingData,
                          deliveryMode: "meetup",
                        })
                      }
                    />
                    Meetup
                  </label>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="groupby">
                <label>Select a Payment Method</label>
                <form>
                  <label>
                    <input
                      type="radio"
                      value="payment upon meetup"
                      checked={
                        listingData.paymentMode === "payment upon meetup"
                      }
                      onChange={handlePaymentChange}
                    />
                    payment upon meetup
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      value="gcash"
                      checked={listingData.paymentMode === "gcash"}
                      onChange={handlePaymentChange}
                    />
                    gcash
                  </label>
                </form>
              </div>

              {/* Optional Fees Section */}
              {!isForSale && (
                <div className="groupby">
                  <div onClick={toggleGroup} style={{ cursor: "pointer" }}>
                    {isExpanded
                      ? "v Hide Optional Fees"
                      : "> Show Optional Fees"}
                  </div>
                  <div
                    className={`optional-fees ${isExpanded ? "expanded" : ""}`}
                  >
                    <div>
                      <label>Late Charges</label>
                      <input
                        type="text"
                        value={listingData.lateCharges}
                        onChange={(e) =>
                          setListingData({
                            ...listingData,
                            lateCharges: e.target.value,
                          })
                        }
                        placeholder="Add if applicable"
                      />
                    </div>
                    <div>
                      <label>Security Deposit</label>
                      <input
                        type="text"
                        value={listingData.securityDeposit}
                        onChange={(e) =>
                          setListingData({
                            ...listingData,
                            securityDeposit: e.target.value,
                          })
                        }
                        placeholder="Add if applicable"
                      />
                    </div>
                    <div>
                      <label>Repair and Replacement</label>
                      <input
                        type="text"
                        value={listingData.repairReplacement}
                        onChange={(e) =>
                          setListingData({
                            ...listingData,
                            repairReplacement: e.target.value,
                          })
                        }
                        placeholder="Add if applicable"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Condition & Tags */}
              <div>
                <label>Condition</label>
                <input
                  type="text"
                  placeholder="e.g., New, Used, Refurbished"
                  className="borderless"
                  value={listingData.condition}
                  onChange={(e) =>
                    setListingData({
                      ...listingData,
                      condition: e.target.value,
                    })
                  }
                />
              </div>

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
                  <div>
                    <button className="btn btn-primary" onClick={handleAddTag}>
                      +
                    </button>
                  </div>
                </div>
                <div className="tags-list">
                  {listingData.tags.map((tag, index) => (
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

              {/* Terms & Conditions */}
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={listingData.agreedToTerms}
                  onChange={(e) =>
                    setListingData({
                      ...listingData,
                      agreedToTerms: e.target.checked,
                    })
                  }
                  disabled
                />
                <label htmlFor="terms">
                  I agree on rental terms set by the owner.
                </label>
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

      {/* Specifications */}
      <HandleSpecifications data={listingData} setData={setListingData} />

      {/* Submit Button */}
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default AddListing;
