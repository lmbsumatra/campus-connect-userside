import { useState } from "react";
import "./searchResultsStyle.css";
import userProfileIcon from "./item_2.png";
import { Link } from "react-router-dom";

const TrialOnSearchResults = ({ keyword }) => {
  const [usersInResult, setUsersInResult] = useState();
  const [itemsInResult, setItemsInResult] = useState();

  return (
    <div id="search-results-popup" className="search-results-container">
      {keyword ? (
        <>
          <div className="search-title">
            <p>You are searching for "{keyword}"</p>
          </div>

          <div className="result-section">
            <div className="section-header">
              <h3>All</h3>
              <Link
                to={`/results?q=${keyword}&type=items`}
                className="view-all"
              >
                View All
              </Link>
            </div>
            <div className="result-wrapper">
              <div className="item-result">
                <span>{keyword}</span>
                <Link to={`/rent?q=${keyword}`}>View All Rental Items</Link>
              </div>
              <div className="item-result">
                <span>{keyword}</span>
                <Link to={`/shop?q=${keyword}`}>View All for Sale Items</Link>
              </div>
              <div className="item-result">
                <span>{keyword}</span>
                <Link to={`/lookingfor?q=${keyword}`}>View All Posts</Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>Please enter a keyword</p>
        </div>
      )}
    </div>
  );
};

export default TrialOnSearchResults;
