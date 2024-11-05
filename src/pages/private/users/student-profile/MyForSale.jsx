import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import axios from "axios";
import ItemSale from "../../../../components/itemsale/ItemSale";

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
          `http://localhost:3001/item-for-sale/info`
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
      <ItemSale items={forsales} title="Sell" className="col-md-10" />
    </div>
  );
}

export default MyForSale;
