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
import TextareaAutosize from "react-textarea-autosize";
import warningIcon from "../../../../assets/images/input-icons/warning.svg"

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
  const [blur, setBlur] = useState(false);
  const [newKey, setNewKey] = useState(""); // State for the new key
  const [newValue, setNewValue] = useState(""); // State for the new value
  console.log(itemDataState);

  const handleAddTag = () => {
    if (newTag.trim()) {
      if (tags.includes(newTag)) {
        setDuplicateTag(newTag); // Mark as duplicate
        setTimeout(() => setDuplicateTag(null), 3000); // Clear duplicate error
      } else {
        dispatch(addTag(newTag)); // Update Redux with the new tag
        setDuplicateTag(null);
        onInputChange("tags", [...tags, newTag], dispatchtwo, itemDataState); // Update reducer state
      }
      setNewTag(""); // Clear input field
    }
  };

  const handleFocus = () => {
    setBlur(true); // Handle blur state when focused
  };

  const handleBlur = () => {
    setBlur(false); // Reset blur state
    onBlur("tags", tags, dispatchtwo, itemDataState); // Trigger validation
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewTag(value);
    onBlur("tags", [...tags], dispatchtwo, itemDataState); // Validate on every input
    onInputChange("tags", [...tags], dispatchtwo, itemDataState); // Sync with reducer state
    setDuplicateTag(null); // Clear duplicate state
  };

  const handleRemoveTag = (tag) => {
    const updatedTags = tags.filter((t) => t !== tag);
    dispatch(removeTag(tag)); // Update Redux
    onInputChange("tags", updatedTags, dispatchtwo, itemDataState); // Update reducer state
    if (duplicateTag === tag) setDuplicateTag(null); // Reset duplicate state
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTag(); // Add tag on Enter
    } else if (e.key === "Backspace" && newTag === "") {
      if (tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        handleRemoveTag(lastTag); // Remove last tag on Backspace
      }
    }
  };

  const handleAddSpec = async (key, value) => {
    if (!key || !value) return;

    const currentSpecs = itemDataState.specs?.value || {};

    const updatedSpecs = { ...currentSpecs, [key]: value };

    await onInputChange("specs", updatedSpecs, dispatchtwo, itemDataState);

    const { error, hasError } = itemDataState.specs || {};

    if (error || hasError) {
      const correctedSpecs = { ...currentSpecs };
      delete correctedSpecs[key];

      await onInputChange("specs", correctedSpecs, dispatchtwo, itemDataState);

      console.warn(`Spec with key "${key}" removed due to an error.`);
    } else {
      console.log("Updated specs:", updatedSpecs);
    }
  };

  const handleRemoveSpec = (key) => {
    const currentSpecs = { ...itemDataState.specs?.value };

    delete currentSpecs[key];
  };

  return (
    <div className="input-form item-desc">
      <label className="sub-section-label">Specifications</label>
      <table className="specifications-table" role="table">
        <thead>
          <td>Key</td>
          <td>Value</td>
        </thead>
        <tbody>
          {Object.entries(itemDataState.specs.value).map(
            ([key, value], index) => (
              <tr key={index}>
                <td>{key}</td>
                <td>{value}</td>
                <td>
                  <button
                    className="btn btn-icon secondary"
                    onClick={() => handleRemoveSpec(key)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )
          )}
          <tr>
            <td>
              <input
                className="input"
                type="text"
                placeholder="Add key here"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
            </td>
            <td>
              <input
                className="input"
                type="text"
                placeholder="Add value here"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </td>
            <td>
              <button
                className="btn btn-primary"
                onClick={() => handleAddSpec(newKey, newValue)}
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {itemDataState.specs.triggered && itemDataState.specs.hasError && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt="Error on specs" />
          <span className="text">{itemDataState.specs.error}</span>
        </div>
      )}

      <label className="sub-section-label">Description</label>
      <TextareaAutosize
        id="desc"
        name="desc"
        className="input"
        placeholder="Add description"
        required
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
          <img src={warningIcon} className="icon" alt="Error on last name" />
          <span className="text">{itemDataState.desc.error}</span>
        </div>
      )}

      <label className="sub-section-label">Tags</label>
      <div className={`tags-holder ${blur ? "focused" : ""}`}>
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
          onFocus={handleFocus}
          onBlur={(e) => handleBlur(e, "tags")}
        />
        <button className="btn btn-primary" onClick={handleAddTag}>
          Add
        </button>
      </div>
      {itemDataState.tags.triggered && itemDataState.tags.hasError && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt="Error on last name" />
          <span className="text">{itemDataState.tags.error}</span>
        </div>
      )}
    </div>
  );
};

export default AddItemDescAndSpecs;
