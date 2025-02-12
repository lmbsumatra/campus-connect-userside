const handleFollowButton = async (e, followerId, followeeId) => {
  e.stopPropagation();

  try {
    console.log("Follow!", followerId, followeeId);
    const response = await fetch(
      "http://localhost:3001/api/follow/follow-user",
      {
        method: "POST",
        headers: { // Corrected: headers should be inside the fetch options
          "Content-Type": "application/json", // Corrected: Content-Type is hyphenated
        },
        body: JSON.stringify({ // Corrected: Construct a proper JSON object
          followerId: followerId,
          followeeId: followeeId,
        }),
      }
    );

    if (!response.ok) {
      // Handle error responses from the server (e.g., 400, 500 status codes)
      console.error("Server error:", response.status, response.statusText);
      return; // Exit the function to prevent further execution
    }

    const data = await response.json(); // Parse the JSON response

    // Process the response data here (e.g., update UI, display messages)
    console.log("Follow API response:", data);

  } catch (error) {
    console.error("Error during follow request:", error);
  }

  // if (follower === followee) {
  //   return console.log("You can't follow or unfollow your self!");
  // }
  // console.log("Follow!", follower, followee);
};

export default handleFollowButton;
