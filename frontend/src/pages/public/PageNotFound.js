import { useEffect, useState } from "react";
import Footer from "../../components/users/footer/Footer";
import TrialOnNavbar from "../../trials/TrialOnNavbar";

const PageNotFound = () => {
  const [countdown, setCountdown] = useState(5); // Start at 5 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect when countdown reaches 0
    const redirectTimer = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    // Cleanup function
    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <>
      <TrialOnNavbar />
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Page Not Found</h2>
          <p className="not-found-message">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <p className="not-found-redirect-message">
            You will be redirected to the homepage in{" "}
            <strong>{countdown}</strong> seconds.
          </p>
          <a href="/" className="not-found-button">
            Go Home Now
          </a>
        </div>
      </div>
      <style jsx>{`
        .not-found-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          text-align: center;
          padding: 2rem;
        }

        .not-found-content {
          max-width: 600px;
        }

        .not-found-title {
          font-size: 8rem;
          font-weight: bold;
          color: #e74c3c;
          margin: 0;
        }

        .not-found-subtitle {
          font-size: 2rem;
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .not-found-message {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          color: #666;
        }

        .not-found-redirect-message {
          font-size: 1rem;
          color: #888;
          margin-bottom: 2rem;
        }

        .not-found-button {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .not-found-button:hover {
          background-color: #2980b9;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .not-found-container {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
      <Footer />
    </>
  );
};

export default PageNotFound;
