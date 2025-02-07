import { useState } from "react";
import "./searchResultsStyle.css";
import userProfileIcon from "./item_2.png";

const TrialOnSearchResults = ({ keyword }) => {
  const [usersInResult, setUsersInResult] = useState();
  const [itemsInResult, setItemsInResult] = useState();
  return (
    <div className="search-results-container">
      {keyword && <span>You are searching for "{keyword}"</span>}
      <a href="" className="user-result">
        <div className="img-holder">
          <img src={userProfileIcon} />
        </div>
        <span>Mikha Lim</span>
      </a>

      <a href="" className="item-result">
        <span>Beaker</span>
      </a>

      <a href="" className="item-result">
        <span>Badminton Racket</span>
      </a>

      <a href="" className="item-result">
        <span>Laptop</span>
      </a>
    </div>
  );
};

export default TrialOnSearchResults;
