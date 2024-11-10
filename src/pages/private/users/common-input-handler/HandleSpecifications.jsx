import React, { useState } from 'react';

export const HandleSpecifications = ({
  data = { specifications: {}, description: "" },
  setData,
}) => {

  const [newSpecKey, setNewSpecKey] = useState(""); 
  const [newSpecValue, setNewSpecValue] = useState("");

  const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      alert("Please enter both a key and a value for the specification.");
      return;
    }

    setData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [newSpecKey]: newSpecValue },
    }));

    setNewSpecKey("");
    setNewSpecValue("");
  };

  const handleRemoveSpecification = (key) => {
    const newSpecifications = { ...data.specifications };
    delete newSpecifications[key];
    setData((prev) => ({
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
          {Object.entries(data.specifications).map(([key, value]) => (
            <div key={key} className="specification">
              <input
                type="text"
                placeholder="Key"
                value={key}
                className='spec-title'
                onChange={(e) => {
                  const newKey = e.target.value;
                  setData((prev) => {
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
                className='item-specs-description'
                onChange={(e) =>
                  setData((prev) => ({
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
        <div className='d-flex align-content-vertically'>
          <input
            type="text"
            className='spec-title'
            placeholder="New Specification Key"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
          />
          <textarea
            placeholder="New Specification Value"
            className='item-specs-description'
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
          value={data.description}
          onChange={(e) =>
            setData({ ...data, description: e.target.value })
          }
        />
      </div>
    </>
  );
};
