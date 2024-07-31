import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating }) => {
  const handleRating = (rate) => {
    setRating(rate);
  };

  return (
    <div>
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => handleRating(ratingValue)}
              style={{ display: 'none' }}
            />
            <FaStar
              size={24}
              color={ratingValue <= rating ? '#ffc107' : '#e4e5e9'}
              style={{ cursor: 'pointer', marginRight: '5px' }}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
