import { useState } from 'react';
import { baseApi } from '../App';

const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Function to handle the response from Google login
  const handleSuccess = async (response) => {
    const token = response.credential; // Extract the token from Google's response

    try {
      setLoading(true);
      setError(null);

      // Set up a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      // Send the token to your server for verification and further processing
      const res = await fetch(`${baseApi}/user/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
        signal: controller.signal, // Attach the abort controller's signal
      });

      clearTimeout(timeoutId); // Clear the timeout if the request finishes in time

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to log in with Google');
      }

      const data = await res.json();
      if (data) {
        setUserData(data);  // Store user data from server response
      } else {
        throw new Error('Received an empty response from the server');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Login request timed out. Please try again.');
      } else if (err.message.includes('Failed to log in with Google')) {
        setError('There was an issue logging in with Google. Please try again.');
      } else if (err.message.includes('NetworkError')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || 'An unexpected error occurred during Google login.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle errors from Google login
  const handleError = (error) => {
    setError('An error occurred during Google login. Please try again.');
  };

  // Return the necessary state and functions
  return {
    loading,
    error,
    userData,
    handleSuccess,
    handleError,
  };
};

export default useGoogleLogin;
