import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import ItemList from "../../../../components/itemlisting/ItemList";
import { baseApi } from "../../../../App";

function MyForSale() {
  const [forsales, setForSales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { studentUser } = useAuth();
  const { userId } = studentUser;

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(
          `${baseApi}/item-for-sale/info`
        );
        const userForsale = response.data.filter(
          (forsale) => forsale.seller_id === userId
        );
        setForSales(userForsale);
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
      <ItemList
        items={forsales}
        title="Sell"
        isProfileVisit={false}
        className="col-md-10"
      />
    </div>
  );
}

export default MyForSale;
