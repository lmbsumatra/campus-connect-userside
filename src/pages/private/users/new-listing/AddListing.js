import React, { useEffect, useState } from "react";
// style
import "./addListingStyles.css";
import { ImageUpload } from "./ImageUpload";
import { HandleSpecifications } from "./HandleSpecifications";
import { UserToolbar } from "./UserToolbar";
import { HandleCustomDateAndTime } from "./HandleCustomDateAndTime";
import { HandleWeeklyDateAndTime } from "./HandleWeeklyDateAndTime";
import FetchUserInfo from "../../../../utils/FetchUserInfo";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";

const AddListing = () => {
  const [userInfo, setUserInfo] = useState({ user: {}, student: {} });
  const [errorMessage, setErrorMessage] = useState(null);
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
  const { user } = useAuth();
  const token = user.token;

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        const { user, student, errorMessage } = await FetchUserInfo(token);
        setUserInfo({ user, student });
        setErrorMessage(errorMessage);
      }
    };
    fetchData();
  }, [userInfo]);

  useEffect(() => {
    if (userInfo.user.user_id && userInfo.student.college) {
      setListingData((prevData) => ({
        ...prevData,
        owner_id: userInfo.user.user_id,
        category: userInfo.student.college,
      }));
    }
  }, [userInfo]);

  const [newTag, setNewTag] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [settingDateOption, SetSettingDateOption] = useState("custom");
  

  const toggleGroup = () => setIsExpanded(!isExpanded);

  const handleSubmit = async () => {
    try {
      let response;

      // Determine the endpoint based on isForSale state
      const endpoint = isForSale
        ? "http://localhost:3001/item-for-sale/add"
        : "http://localhost:3001/listings/add";

      // Create the payload based on isForSale state
      const payload = isForSale
        ? {
            item: {
              seller_id: userInfo.user.user_id,
              category: userInfo.student.college,
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
              owner_id: userInfo.user.user_id,
              category: userInfo.student.college,
              listing_name: listingData.name, // For rentals
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

      response = await axios.post(endpoint, payload);

      console.log(response.data);
      alert("Listing created successfully!");
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage("Failed to create listing.");
    }
  };

  const handlePaymentChange = (event) => {
    setListingData((prevData) => ({
      ...prevData,
      paymentMode: event.target.value,
    }));
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag !== "") {
      setListingData((prevData) => ({
        ...prevData,
        tags: [...prevData.tags, trimmedTag],
      }));
      setNewTag("");
    } else {
      alert("Tag cannot be empty!");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setListingData((prevData) => ({
      ...prevData,
      tags: prevData.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const [isForSale, setIsForSale] = useState(false);

  const toggleStatus = () => {
    setIsForSale((prevStatus) => !prevStatus);
  };

  return (
    <div className="container-content">
      <h2>Add item</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="form-preview">
        <ImageUpload
          listingData={listingData}
          setListingData={setListingData}
          isForSale={isForSale}
        />

        <div className="form-fields bg-white p-3 rounded">
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
                listingData={listingData}
                setListingData={setListingData}
              />
            )}

            {settingDateOption === "weekly" && (
              <HandleWeeklyDateAndTime
                listingData={listingData}
                setListingData={setListingData}
              />
            )}

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
                      setListingData({ ...listingData, deliveryMode: "pickup" })
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
                      setListingData({ ...listingData, deliveryMode: "meetup" })
                    }
                  />
                  Meetup
                </label>
              </div>
            </div>

            <div className="groupby">
              <label>Select a Payment Method</label>
              <form>
                <label>
                  <input
                    type="radio"
                    value="payment upon meetup"
                    checked={listingData.paymentMode === "payment upon meetup"}
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
            {!isForSale && (
              <div className="groupby">
                <div onClick={toggleGroup} style={{ cursor: "pointer" }}>
                  {isExpanded ? "v Hide Optional Fees" : "> Show Optional Fees"}
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

            <div>
              <label>Condition</label>
              <input
                type="text"
                placeholder="e.g., New, Used, Refurbished"
                className="borderless"
                value={listingData.condition}
                onChange={(e) =>
                  setListingData({ ...listingData, condition: e.target.value })
                }
              />
            </div>

            <div>
              <label>Tags</label>
              <div className="tag-input">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="borderless"
                />
                <button onClick={handleAddTag}>Add Tag</button>
              </div>
              <div className="tags-list">
                {listingData.tags.map((tag, index) => (
                  <div key={index} className="tag-display">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>

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

      <UserToolbar userInfo={userInfo} />
      <HandleSpecifications
        listingData={listingData}
        setListingData={setListingData}
      />
      <button className="btn btn-primary" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default AddListing;
