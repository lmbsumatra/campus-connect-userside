// components
import NavBar from "../navbar/navbar/NavBar";
import FAB from "../fab/FAB";
import Footer from "../footer/Footer";

// modules
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// styles
import "./style.css";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/Posts.json")
      .then((response) => response.json())
      .then((data) => {
        const foundPost = data.borrowingPosts.find(
          (p) => p.id === parseInt(id)
        );
        setPost(foundPost);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <NavBar />
      <FAB />
      <div className="custom-container d-flex justify-content-center">
        <div className="post-details">
          <div className="d-flex align-items-center mb-3">
            <img
              src={post.userProfilePicture}
              alt={post.username}
              className="icon-user me-2"
            />
            <h5 className="fs-6">
              {post.username} (
              <span>
                {post.userRating}
                <i
                  className="fa-solid fa-star"
                  style={{ color: "#ffd43b" }}
                ></i>
              </span>
              ) is looking for...
            </h5>
          </div>
          <div className="">
            <div className="">
              <img
                src={post.itemImage}
                alt={post.itemName}
                className="img-fluid item-image"
              />
            </div>
            <div>
              <h2>{post.itemName}</h2>
              <p>{post.itemDescription}</p>
              <h4>Item Specifications</h4>
              <ul>
                {post.itemSpecifications.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
              <div className="post-terms">
                <div className="d-flex term">
                  <span className="me-2">Rental Duration</span>
                  <div className="">
                    {post.rentalDuration.map((duration, index) => (
                      <button
                        key={index}
                        className="btn btn-tertiary no-fill me-2"
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="d-flex term">
                  <span className="me-2">Rental Date</span>
                  <button className="btn btn-tertiary no-fill">
                    {post.rentalDate}
                  </button>
                </div>
                <div className="d-flex term">
                  <span className="me-2">Delivery</span>
                  <button className="btn btn-tertiary no-fill">
                    {post.deliveryMethod}
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-primary no-fill me-2">
                  Message
                </button>
                <button className="btn btn-primary">Offer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Post;
