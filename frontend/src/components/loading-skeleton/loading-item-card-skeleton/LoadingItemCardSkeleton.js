import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LoadingItemCardSkeleton = () => {
  return (
    
    <div className="card variant-1 skeleton">
      <div className="img-holder">
        <Skeleton height={156} width="100%" borderRadius={4} />
      </div>
      <div className="description">
        <div className="tags-holder">
          <Skeleton width={81} height={24} borderRadius={100} />
          <Skeleton width={81} height={24} borderRadius={100} />
        </div>
        <div className="item-name">
          <Skeleton width="100%" height={18} borderRadius={4} />
        </div>
        <div className="item-price">
          <Skeleton width="60%" height={24} borderRadius={4} />
        </div>
        <div className="action-btns">
          <Skeleton width="75%" height={35} borderRadius={4} />
          <Skeleton 
            width={35} 
            height={35} 
            borderRadius="50%" 
            style={{ minWidth: "35px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingItemCardSkeleton;