import React, { useState } from "react";

const colleges = ["CAFA", "CIE", "CIT", "CLA", "COE", "COS"];
const categories = [
  "Electronics", "Home", "Fashion", "Sports", "Books", "Toys", "Automotive",
  "Health", "Hobbies", "Technology", "Business", "Musical", "Pet", "Event", "Travel"
];

const BrowseByCollection = ({ onFilter }) => {
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCollegeClick = (college) => {
    setSelectedCollege(college);
    onFilter({ college, category: selectedCategory });
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    onFilter({ college: selectedCollege, category });
  };

  return (
    <div className="browse-collection">
      <h2>Browse by College</h2>
      <div className="button-group">
        {colleges.map((college) => (
          <button
            key={college}
            className={selectedCollege === college ? "active" : ""}
            onClick={() => handleCollegeClick(college)}
          >
            {college}
          </button>
        ))}
      </div>

      <h2>Browse by Category</h2>
      <div className="button-group">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrowseByCollection;
