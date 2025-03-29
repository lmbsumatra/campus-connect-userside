import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import removeIcon from "../../../../assets/images/input-icons/remove.svg";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";
import "./addItemDescAndSpecsStyles.css";

const AddItemDescAndSpecs = ({
  specs = {},
  desc = "",
  tags: initialTags,
  onSpecsChange,
  onDescChange,
  onTagsChange,
  errors = {},
  triggered = {},
}) => {
  // Ensure tags is always an array
  const tags = Array.isArray(initialTags) ? initialTags : [];

  const [newTag, setNewTag] = useState("");
  const [duplicateTag, setDuplicateTag] = useState(null);
  const [blur, setBlur] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddTag = () => {
    if (newTag.trim()) {
      if (tags.includes(newTag)) {
        setDuplicateTag(newTag);
        setTimeout(() => setDuplicateTag(null), 3000);
      } else {
        const updatedTags = [...tags, newTag];
        onTagsChange?.(updatedTags);
        setDuplicateTag(null);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    onTagsChange?.(updatedTags);
    if (duplicateTag === tagToRemove) setDuplicateTag(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && newTag === "") {
      if (tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        handleRemoveTag(lastTag);
      }
    }
  };

  const handleAddSpec = () => {
    if (!newKey.trim() || !newValue.trim()) return;

    const updatedSpecs = {
      ...specs,
      [newKey.trim()]: newValue.trim(),
    };

    onSpecsChange?.(updatedSpecs);
    setNewKey("");
    setNewValue("");
  };

  const handleRemoveSpec = (keyToRemove) => {
    const updatedSpecs = { ...specs };
    delete updatedSpecs[keyToRemove];
    onSpecsChange?.(updatedSpecs);
  };

  return (
    <div className="input-form item-desc">
      <label className="sub-section-label">Specifications</label>
      <div className="specifications-wrapper">
        <table className="specifications-table" role="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(specs).map(([key, value], index) => (
              <tr key={index}>
                <td>{key}</td>
                <td>{value}</td>
                <td>
                  <button
                    className="btn btn-rectangle secondary"
                    onClick={() => handleRemoveSpec(key)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
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
                <button className="btn btn-primary" onClick={handleAddSpec}>
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {triggered.specs && errors.specs && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt="Error on specs" />
          <span className="text">{errors.specs}</span>
        </div>
      )}

      <label className="sub-section-label">Description</label>
      <TextareaAutosize
        className="input"
        placeholder="Add description"
        required
        value={desc}
        onChange={(e) => onDescChange?.(e.target.value)}
      />
      {triggered.desc && errors.desc && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt="Error on description" />
          <span className="text">{errors.desc}</span>
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
          placeholder={duplicateTag ? "Duplicate tag" : "Add tag"}
          className="tag-input"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setBlur(true)}
          onBlur={() => setBlur(false)}
        />
        <button className="btn btn-primary" onClick={handleAddTag}>
          Add
        </button>
      </div>
      {triggered.tags && errors.tags && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt="Error on tags" />
          <span className="text">{errors.tags}</span>
        </div>
      )}
    </div>
  );
};

export default AddItemDescAndSpecs;
