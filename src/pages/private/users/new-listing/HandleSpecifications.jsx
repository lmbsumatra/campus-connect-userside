import React, { useState } from 'react';

export const HandleSpecifications = ({
  listingData = { specifications: {}, description: "" },
  setListingData,
}) => {
  const [newSpecKey, setNewSpecKey] = useState(""); 
  const [newSpecValue, setNewSpecValue] = useState("");

  const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      alert("Please enter both a key and a value for the specification.");
      return;
    }

    setListingData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [newSpecKey]: newSpecValue },
    }));

    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecification = (key) => {
    const newSpecifications = { ...listingData.specifications };
    delete newSpecifications[key];
    setListingData((prev) => ({
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
          {Object.entries(listingData.specifications).map(([key, value]) => (
            <div key={key} className="specification">
              <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setListingData((prev) => {
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
                  setListingData((prev) => ({
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
          value={listingData.description}
          onChange={(e) =>
            setListingData({ ...listingData, description: e.target.value })
          }
        />
      </div>
    </>
  );
};
