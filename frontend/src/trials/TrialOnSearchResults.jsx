import { useState } from "react";
import "./searchResultsStyle.css";
import userProfileIcon from "./item_2.png";

const TrialOnSearchResults = ({ keyword }) => {
  const [usersInResult, setUsersInResult] = useState();
  const [itemsInResult, setItemsInResult] = useState();

  return (
    <div className="search-results-container">
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
          <a href={`/results?q=${keyword}&type=items`}>View All</a>
          <div className="result-wrapper">
            <a className="item-result">
              <span>{keyword}</span>
              <a href={`/rent?q=${keyword}`}>
                View All Rental Items
              </a>
            </a>
            <a className="item-result">
              <span>{keyword}</span>
              <a href={`/shop?q=${keyword}`}>
                View All for Sale Item
              </a>
            </a>
            <a className="item-result">
              <span>{keyword}</span>
              <a href={`/lend?q=${keyword}`}>View All Posts</a>
            </a>
          </div>
        </>
      ) : (
        <span>Please enter a keyword</span>
      )}
    </div>
  );
};

export default TrialOnSearchResults;
