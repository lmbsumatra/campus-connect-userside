import React, { useState } from "react";

const QuantityControl = ({ min = 1, max = 10, setQuantity, quantity }) => {
  const handleDecrease = () => {
    if (quantity > min) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < max) setQuantity(quantity + 1);
  };

  const isMinReached = quantity <= min;
  const isMaxReached = quantity >= max;

  return (
    <div className="">
      <span>Quantity</span>
      <div className="input-group m-0 p-1 g-0" style={{ gap: "0" }}>
        <button
          className="btn btn-secondary p-0 m-0"
          type="button"
          onClick={handleDecrease}
          disabled={isMinReached}
        >
          -
        </button>
        <input
          type="text"
          className="form-control text-center"
          value={quantity}
          readOnly
        />
        <button
          className="btn btn-secondary p-0 m-0"
          type="button"
          onClick={handleIncrease}
          disabled={isMaxReached}
        >
          +
        </button>
      </div>

      {isMinReached && (
        <small className="text-danger d-block mt-1">
          Minimum quantity reached
        </small>
      )}
      {isMaxReached && (
        <small className="text-danger d-block mt-1">
          Maximum quantity reached
        </small>
      )}
    </div>
  );
};

export default QuantityControl;
