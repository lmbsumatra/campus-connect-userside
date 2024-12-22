import { useState } from "react";
import "./listingDetailStyles.css";
import expandIcon from "../../../../assets/images/pdp/plus.svg";

const Terms = ({ values }) => {
  const [expandTerm, setExpandTerm] = useState(false);
  const handleExpandTerms = () => {
    setExpandTerm(!expandTerm);
  };

  return (
    <div className={`group-container terms-group`}>
      <label className="sub-section-label">
        Terms and Condition{" "}
        <button
          className={`expand-btn ${expandTerm ? "expand" : ""}`}
          onClick={handleExpandTerms}
        >
          <img src={expandIcon} alt="Expand terms and condition" />
        </button>
      </label>

      {expandTerm && (
        <div className="terms-popup">
          <div className="term late-charges">
            <label className="label">Late Charges</label>
            <div>
              {values.lateCharges ? (
                <span className="value">{values.lateCharges}</span>
              ) : (
                <span className="error-msg">No late charges specified.</span>
              )}
            </div>
          </div>
          <div className="term deposit">
            <label className="label">Security Deposit</label>
            <div>
              {values.securityDeposit ? (
                <span className="value">{values.securityDeposit}</span>
              ) : (
                <span className="error-msg">
                  No security deposit specified.
                </span>
              )}
            </div>
          </div>
          <div className="term repair-replacement">
            <label className="label">Repair and Replacement</label>
            <div>
              {values.repairReplacement ? (
                <span className="value">{values.repairReplacement}</span>
              ) : (
                <span className="error-msg">
                  No repair and replacement specified.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Terms;
