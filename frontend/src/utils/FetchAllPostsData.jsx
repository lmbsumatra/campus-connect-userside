import { useEffect, useState } from "react";
import axios from "axios";
import { baseApi } from "./consonants";

const useFetchAllPostsData = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      
      try {
        const response = await axios.get(`${baseApi}/posts/info`);
        setPosts(response.data);
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
