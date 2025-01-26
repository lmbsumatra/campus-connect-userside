import { Modal } from "react-bootstrap";
import "./heroActionCardsStyles.css";
import addItemIcon from "../assets/images/header/add-item.svg";
import createPostIcon from "../assets/images/header/create-post.svg";
import useHandleActionWithAuthCheck from "../utils/useHandleActionWithAuthCheck";

const HeroActionCards = ({ show, hide }) => {
  const handleActionWithAuthCheck = useHandleActionWithAuthCheck();

  return (
    <>
      <Modal centered show={show} onHide={hide} dialogClassName="modal-width">
        <div className="hero-actions-container">
          <div
            className="card"
            onClick={() => handleActionWithAuthCheck("/profile/my-listings/add", hide)}
          >
            <label>
              <img src={addItemIcon} alt="" />
              <h2>Add Item</h2>
            </label>
            <p>
              Click here to add an item. <br />
              You can choose whether it is for sale or rent only as long as it
              adheres to our policy. Read <a href="">here.</a>
            </p>
          </div>

          <div
            className="card"
            onClick={() => handleActionWithAuthCheck("/profile/my-posts/new", hide)}
          >
            <label>
              <img src={createPostIcon} alt="" />
              <h2>Create Post</h2>
            </label>
            <p>
              Click here to create new post. <br />
              You are allowed to post items you are looking for either renting or buying as long as it is aligned with our policy. Read <a href="">here.</a>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HeroActionCards;
