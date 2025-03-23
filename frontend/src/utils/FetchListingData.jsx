import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseApi } from "./consonants";

const FetchListingData = ({ id }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `${baseApi}/listings/${id}`
        );
        setSelectedItem(response.data);

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selectedItem) return <p>Item not found</p>;

  return { selectedItem, loading, error, tags };
};

export default FetchListingData;
