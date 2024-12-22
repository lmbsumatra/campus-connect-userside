import Skeleton from "react-loading-skeleton"; // Import Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton styles
import "./loadingItemDetailSkeletonStyles.css";
const LoadingItemDetailSkeleton = () => {
  return (
    <div className="container-content listing-detail">
      <div className="listing-container">
        <div className="imgs-container">
          <Skeleton height={200} />
          <Skeleton count={3} width={60} style={{ marginTop: "10px" }} />
        </div>
        <div className="rental-details">
          <Skeleton width={100} height={30} />
          <Skeleton count={2} height={20} style={{ marginTop: "10px" }} />
          <Skeleton height={50} style={{ marginTop: "20px" }} />
          <Skeleton height={20} style={{ marginTop: "10px" }} />
          <Skeleton count={3} height={20} style={{ marginTop: "10px" }} />
        </div>
      </div>
      <div className="listing-container owner-info">
        <Skeleton width={60} height={60} circle />
        <Skeleton width={120} height={20} style={{ marginTop: "10px" }} />
        <Skeleton width={80} height={30} style={{ marginTop: "10px" }} />
      </div>
      <div className="listing-container post-desc">
        <Skeleton width={200} height={20} />
        <Skeleton count={4} height={20} style={{ marginTop: "10px" }} />
      </div>
    </div>
  );
};

export default LoadingItemDetailSkeleton;
