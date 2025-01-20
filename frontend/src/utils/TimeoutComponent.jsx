import React, { useEffect, useState } from "react";

const TimeoutComponent = ({ timeoutDuration, children, fallback }) => {
  const [timeoutReached, setTimeoutReached] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimeoutReached(false);
    }, timeoutDuration);

    return () => clearTimeout(timeoutId); // Cleanup on unmount
  }, [timeoutDuration]);

  return timeoutReached ? fallback : children;
};

export default TimeoutComponent;
