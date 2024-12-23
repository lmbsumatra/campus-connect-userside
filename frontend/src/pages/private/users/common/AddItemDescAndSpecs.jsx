import React, { useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTag, removeTag } from "../../../../redux/tag/tagSlice";
import removeIcon from "../../../../assets/images/input-icons/remove.svg";
import "./addItemDescAndSpecsStyles.css";
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "../../../../hooks/input-reducers/itemFormInputReducer";

const initialState = {
  category: { value: "", triggered: false, hasError: true, error: "" },
  itemName: { value: "", triggered: false, hasError: true, error: "" },
  price: { value: "", triggered: false, hasError: true, error: "" },
  availableDates: {
    value: [],
    triggered: false,
    hasError: false,
    error: "",
  },
  deliveryMethod: { value: "", triggered: false, hasError: true, error: "" },
  paymentMethod: { value: "", triggered: false, hasError: true, error: "" },
  itemCondition: { value: "", triggered: false, hasError: true, error: "" },
  lateCharges: { value: "", triggered: false, hasError: true, error: "" },
  securityDeposit: { value: "", triggered: false, hasError: true, error: "" },
  repairReplacement: { value: "", triggered: false, hasError: true, error: "" },

  images: { value: [], triggered: false, hasError: false, error: "" }, // Array of images
  desc: { value: "", triggered: false, hasError: false, error: "" }, // Array of tags
  tags: { value: [], triggered: false, hasError: false, error: "" }, // Array of tags
  specs: { value: {}, triggered: false, hasError: false, error: "" }, // Object for specs

  isFormValid: false,
};

const formsReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FORM:
      return {
        ...state,
        [action.data.name]: {
          ...state[action.data.name],
          value: action.data.value,
          hasError: action.data.hasError,
          error: action.data.error,
          validations:
            action.data.validations || state[action.data.name].validations,
          triggered: action.data.triggered,
        },
        isFormValid: action.data.isFormValid,
      };
    default:
      return state;
  }
};

const AddItemDescAndSpecs = () => {
  const [itemDataState, dispatchtwo] = useReducer(formsReducer, initialState);
  const [newTag, setNewTag] = useState("");
  const [duplicateTag, setDuplicateTag] = useState(null); // Track duplicate tag
  const dispatch = useDispatch();
  const tags = useSelector((state) => state.tags);

  const handleAddTag = () => {
    if (newTag.trim()) {
      if (tags.includes(newTag)) {
        setDuplicateTag(newTag); // Mark as duplicate
        // Hide the red border after 3 seconds
        setTimeout(() => setDuplicateTag(null), 3000);
      } else {
        dispatch(addTag(newTag)); // Add tag to Redux state
        setDuplicateTag(null); // Reset duplicate state
      }
      setNewTag(""); // Clear input field
    }
  };

  const handleInputChange = (e) => {
    setNewTag(e.target.value);
    setDuplicateTag(null); // Reset duplicate state on input change
  };

  const handleRemoveTag = (tag) => {
    dispatch(removeTag(tag));
    if (duplicateTag === tag) setDuplicateTag(null); // Reset duplicate state if the tag is removed
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Add the tag when Enter is pressed
      handleAddTag();
    } else if (e.key === "Backspace" && newTag === "") {
      // Remove the last tag when Backspace is pressed and input is empty
      if (tags.length > 0) {
        handleRemoveTag(tags[tags.length - 1]);
      }
    }
  };

  return (
    <div className="input-form item-desc">
      <label className="sub-section-label">Specifications</label>
      <table className="specifications-table" role="table">
        <thead>
          <tr>
            <td>Key</td>
            <td>Value</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="text" placeholder="Add key here" />
            </td>
            <td>
              <input type="text" placeholder="Add value here" />
            </td>
            <td>
              <button className="btn btn-primary">Add</button>
            </td>
          </tr>
        </tbody>
      </table>

      <label className="sub-section-label">Description</label>
      <input
        id="desc"
        name="desc"
        className="input"
        placeholder="Add description"
        required
        type="text"
        value={itemDataState.desc.value}
        onChange={(e) =>
          onInputChange("desc", e.target.value, dispatchtwo, itemDataState)
        }
        onBlur={(e) => {
          onBlur("desc", e.target.value, dispatchtwo, itemDataState);
        }}
      />
      {itemDataState.desc.triggered && itemDataState.desc.hasError && (
        <div className="validation error">
          <img src={""} className="icon" alt="Error on last name" />
          <span className="text">{itemDataState.desc.error}</span>
        </div>
      )}

      <div className="tags-section">
        <label className="sub-section-label">Tags</label>
        <div className="tags-holder">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`tag ${duplicateTag === tag ? "duplicate" : ""}`}
            >
              <span className="text">{tag}</span>
              <button
                className="btn btn-icon secondary"
                onClick={() => handleRemoveTag(tag)}
              >
                <img src={removeIcon} alt="Remove tag icon" />
              </button>
            </span>
          ))}

          <input
            type="text"
            placeholder={`${duplicateTag ? "Duplicate tag" : "Add tag"}`}
            className="tag-input"
            value={newTag}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-primary" onClick={handleAddTag}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemDescAndSpecs;
