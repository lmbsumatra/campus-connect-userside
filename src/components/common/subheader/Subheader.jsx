// style, css
import "./style.css";

const Subheader = () => {
  return (
    <div className="sub-header">
      <div className="container max-xy main-features">
        <div className="feature">
          <h3 className="sub-title text-white">Easy Rentals</h3>
          <p className="sub-description text-light">
            Find and borrow the materials you need with just a few clicks.
          </p>
        </div>
        <div className="feature">
          <h3 className="sub-title text-white">Secure Transactions</h3>
          <p className="sub-description text-light">
            We prioritize your safety with secure payment methods and verified
            user profiles, ensuring peace of mind for every transaction.
          </p>
        </div>
        <div className="feature">
          <h3 className="sub-title text-white">Wide Variety</h3>
          <p className="sub-description text-light">
            Explore a wide range of items categorized by college departments.
          </p>
        </div>
        <div className="feature">
          <h3 className="sub-title text-white">Community Driven</h3>
          <p className="sub-description text-light">
            Join a community of TUP Manila students helping each other succeed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subheader;
