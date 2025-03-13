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
          <span>You are searching for "{keyword}"</span>
          <span>Users</span>{" "}
          <a href={`/results?q=${keyword}&type=users`}>View All</a>
          <div className="result-wrapper">
            <a href="" className="user-result">
              <div className="img-holder">
                <img src={userProfileIcon} />
              </div>
              <span>{keyword}</span>
            </a>
          </div>
          <span>Items</span>
          <Link to={`/results?q=${keyword}&type=items`}>View All</Link>
          <div className="result-wrapper">
            <div className="item-result">
              <span>{keyword}</span>
              <a href={`/rent?q=${keyword}`}>View All Rental Items</a>
            </div>
            <div className="item-result">
              <span>{keyword}</span>
              <a href={`/shop?q=${keyword}`}>View All for Sale Item</a>
            </div>
            <div className="item-result">
              <span>{keyword}</span>
              <Link to={`/lookingfor?q=${keyword}`}>View All Posts</Link>
            </div>
          </div>
        </>
      ) : (
        <span>Please enter a keyword</span>
      )}
    </div>
  );
};

export default TrialOnSearchResults;
