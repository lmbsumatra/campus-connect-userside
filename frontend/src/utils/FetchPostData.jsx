import { useState, useEffect } from "react";
import axios from "axios";

const FetchPostData = ({ id }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    // Function to fetch post data
    const fetchItem = async () => {
      setLoading(true); // Ensure loading starts when fetch begins
      setError(null); // Reset error state before fetch

      try {
        const response = await axios.get(`http://localhost:3001/posts/${id}`);
        setSelectedPost(response.data);

        // Process tags from the response
        const fetchedTags = response.data.tags;
        let parsedTags = [];
        
        if (Array.isArray(fetchedTags)) {
          parsedTags = fetchedTags;
        } else if (typeof fetchedTags === "string") {
          try {
            parsedTags = JSON.parse(fetchedTags);
          } catch (parseError) {
            parsedTags = fetchedTags.split(",").map((tag) => tag.trim());
          }
        }

        setTags(parsedTags);
      } catch (err) {
        // Handle different error types if necessary
        setError(err.response ? err.response.data.message : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem(); // Only fetch if id is provided
    }
  }, [id]);

  return { selectedPost, loading, error, tags };
};

export default FetchPostData;
