import { useEffect, useState } from "react";
import axios from "axios";

const useFetchAllPostsData = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      
      try {
        const response = await axios.get(`http://localhost:3001/posts/info`);
        setPosts(response.data);
        // console.log(response.data)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, error, loading };
};

export default useFetchAllPostsData;
