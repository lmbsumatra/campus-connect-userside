import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/AuthContext";
import ItemList from "../../../../../components/itemlisting/ItemList";

function MyListings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const { studentUser } = useAuth();
    const { userId } = studentUser;
  
    useEffect(() => {
      const fetchItem = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/listings/info`);
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
        <ItemList listings={listings} title="Rent" />
      </div>
    );
  }

  export default MyListings;