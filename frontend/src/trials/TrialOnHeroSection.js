import "./new.css";
import TrialOnNavbar from "./TrialOnNavbar";

const TrialOnHeroSection = () => {
  return (
    <div>
      {/* Navbar Section */}
      <TrialOnNavbar />

      {/* Header Image Section */}
      <div className="header-image w-100">
        <div className="sample-box text-white">NEW ARRIVAL</div>
      </div>
    </div>
  );
};

export default TrialOnHeroSection;
