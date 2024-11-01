const FetchUserInfo = async (token) => {
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
      return { user: data.user, student: data.student, errorMessage: "" };
    } else {
      const errorData = await res.json();
      return {
        userInfo: {},
        errorMessage:
          errorData.message || "Getting user info failed. Please try again.",
      };
    }
  } catch (error) {
    return {
      userInfo: {},
      errorMessage:
        "An unexpected error occurred while getting user info. Please try again later.",
    };
  }
};

export default FetchUserInfo;
