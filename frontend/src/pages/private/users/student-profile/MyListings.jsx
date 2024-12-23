import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import ItemList from "../../../../components/item-card/ItemCard";
import { baseApi } from "../../../../App";


function MyListings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const { studentUser } = useAuth();
    const { userId } = studentUser;
  
    useEffect(() => {
      const fetchItem = async () => {
        try {
          const response = await axios.get(`${baseApi}/listings/info`);
          const userListings = response.data.filter(
            (listing) => listing.owner_id === userId
          );
          setListings(userListings);
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
        <ItemList items={listings} title="Rent" isProfileVisit={false}/>
      </div>
    );
  }

  export default MyListings;