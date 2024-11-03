import React, { useEffect, useState } from "react";
import BorrowingPost from "../../components/borrowingposts/BorrowingPost";
import FAB from "../../components/fab/FAB";
import axios from "axios";

const Lend = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/`);
        console.log("Response data:", response.data);

        setPosts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, []);

  const handleFabClick = (action) => {
    if (action === "add-item") {
      console.log("Add Item button clicked");
    } else if (action === "create-post") {
      console.log("Create Post button clicked");
    }
  };

  return (
    <div className="container-content">
      <BorrowingPost borrowingPosts={posts} title="Lend" />
      <FAB icon="+" onClick={handleFabClick} />
    </div>
  );
};

export default Lend;
