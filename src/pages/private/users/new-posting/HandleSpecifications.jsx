import React, { useState } from 'react';

export const HandleSpecifications = ({
  postData = { specifications: {}, description: "" },
  setPostData,
}) => {
  const [newSpecKey, setNewSpecKey] = useState(""); 
  const [newSpecValue, setNewSpecValue] = useState("");

  const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      alert("Please enter both a key and a value for the specification.");
      return;
    }

    setPostData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [newSpecKey]: newSpecValue },
    }));

    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecification = (key) => {
    const newSpecifications = { ...postData.specifications };
    delete newSpecifications[key];
    setPostData((prev) => ({
      ...prev,
      specifications: newSpecifications,
    }));
  };

  return (
    <>
      <div className="item-specifications bg-white">
        <label>Specifications</label>
        <hr />
        <div>
          {Object.entries(postData.specifications).map(([key, value]) => (
            <div key={key} className="specification">
              <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setPostData((prev) => {
                    const updatedSpecs = { ...prev.specifications };
                    const newValue = updatedSpecs[key];
                    delete updatedSpecs[key];
                    updatedSpecs[newKey] = newValue;
                    return { ...prev, specifications: updatedSpecs };
                  });
                }}
              />
              <textarea
                placeholder="Value"
                value={value}
                onChange={(e) =>
                  setPostData((prev) => ({
                    ...prev,
                    specifications: { ...prev.specifications, [key]: e.target.value },
                  }))
                }
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveSpecification(key)}
              >
                -
              </button>
            </div>
          ))}
        </div>
        <div>
          <input
            type="text"
            placeholder="New Specification Key"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
          />
          <textarea
            placeholder="New Specification Value"
            value={newSpecValue}
            onChange={(e) => setNewSpecValue(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddSpecification}>
            Add Specification
          </button>
        </div>
        <hr />
        <label>Item Description</label>
        <hr />
        <textarea
          placeholder="Item Description"
          className="item-description"
          value={postData.description}
          onChange={(e) =>
            setPostData({ ...postData, description: e.target.value })
          }
        />
      </div>
    </>
  );
};