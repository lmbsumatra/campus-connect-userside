const FetchUserInfo = async (setUserInfo, setErrorMessage) => {
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:3001/user/info`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        setUserInfo({ user: data.user, student: data.student });
        
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.message || "Getting user info failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred while getting user info. Please try again later.");
    }
  };

  export default FetchUserInfo;