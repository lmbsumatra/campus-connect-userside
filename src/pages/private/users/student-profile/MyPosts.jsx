import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import BorrowingPost from "../../../../components/borrowingposts/BorrowingPost";

function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const { studentUser } = useAuth();
    const { userId } = studentUser;
  
  
    useEffect(() => {
      const fetchItem = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/posts/info`);
          const userPosts = response.data.filter(
            (post) => post.renter_id === userId
          );
          setPosts(userPosts);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      if (userId) {
        fetchItem();
      }
    }, [userId]);
  
    return (
      <div className="container rounded bg-white">
        <BorrowingPost borrowingPosts={posts} title="Looking for..." />
      </div>
    );
  }
export default MyPosts;  