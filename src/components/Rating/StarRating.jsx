const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star-icon ${star > rating ? 'empty' : ''}`}>
            <i className="fa-solid fa-star"></i>
          </span>
        ))}
      </div>
    );
  };

  export default StarRating;