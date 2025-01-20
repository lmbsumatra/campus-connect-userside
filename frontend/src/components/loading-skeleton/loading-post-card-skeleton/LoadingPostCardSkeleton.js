import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LoadingPostCardSkeleton = () => {
  return (
    <div className="card variant-2 skeleton">
      <div className="details">
        <div className="description">
          {/* Tags */}
          <div className="tags-holder">
            <Skeleton width={81} height={24} borderRadius={100} />
            <Skeleton width={81} height={24} borderRadius={100} />
          </div>

          {/* Item name */}
          <div className="item-name">
            <Skeleton width={181} height={21} borderRadius={4} />
          </div>

          {/* Rental description box */}
          <div className="rental-desc-holder" style={{ border: "none" }}>
            <Skeleton width={60} height={16} style={{ marginBottom: "4px" }} />{" "}
            {/* Label */}
            <Skeleton
              width="100%"
              height={21}
              style={{ marginBottom: "8px" }}
            />{" "}
            {/* Rental date */}
            <Skeleton width="80%" height={21} /> {/* Rental duration */}
          </div>

          {/* Action buttons */}
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
    </div>
  );
};

export default LoadingPostCardSkeleton;
