import { useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./addTermsStyles.css";
import expandIcon from "../../../../assets/images/pdp/plus.svg";
import infoIcon from "../../../../assets/images/input-icons/info.svg";
import {
  blurField,
  updateField,
} from "../../../../redux/item-form/itemFormSlice";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";

const AddTerms = ({ values }) => {
  const dispatch = useDispatch();
  const itemDataState = useSelector((state) => state.itemForm);
  const [expandTerm, setExpandTerm] = useState(false);
  const handleExpandTerms = () => {
    setExpandTerm(!expandTerm);
  };

  return (
    <div className={`group-container terms-group`}>
      <label className="sub-section-label">
        Terms and Condition
        <button
          className={`expand-btn ${expandTerm ? "expand" : ""}`}
          onClick={handleExpandTerms}
        >
          <img src={expandIcon} alt="Expand terms and condition" />
        </button>
      </label>
      {(itemDataState.lateCharges.triggered &&
        itemDataState.lateCharges.hasError) ||
      (itemDataState.lateCharges.triggered &&
        itemDataState.lateCharges.hasError) ||
      (itemDataState.lateCharges.triggered &&
        itemDataState.lateCharges.hasError) ? (
        <div className="validation error">
          <img src={warningIcon} className="warning-icon" alt="Error indicator" />
          <span className="text">Terms and Condition have error/s</span>
        </div>
      ) : null}

      {expandTerm && (
        <div className="terms-popup">
          <div className="term late-charges">
            <label className="label">Late Charges</label>
            <div className="input-wrapper">
              <input
                id="lateCharges"
                name="lateCharges"
                className="input"
                placeholder="Add late charges"
                required
                type="text"
                value={itemDataState.lateCharges.value}
                onChange={(e) =>
                  dispatch(
                    updateField({ name: "lateCharges", value: e.target.value })
                  )
                }
                onBlur={(e) => {
                  dispatch(
                    blurField({ name: "lateCharges", value: e.target.value })
                  );
                }}
              />
              <button className="btn btn-icon secondary">
                <img src={infoIcon} alt="Information" />
              </button>
            </div>
            {itemDataState.lateCharges.triggered &&
              itemDataState.lateCharges.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="warning-icon"
                    alt="Error on late charges"
                  />
                  <span className="text">
                    {itemDataState.lateCharges.error}
                  </span>
                </div>
              )}
          </div>
          <div className="term deposit">
            <label className="label">Security Deposit</label>
            <div className="input-wrapper">
              <input
                id="securityDeposit"
                name="securityDeposit"
                className="input"
                placeholder="Add security deposit"
                required
                type="text"
                value={itemDataState.securityDeposit.value}
                onChange={(e) =>
                  dispatch(
                    updateField({
                      name: "securityDeposit",
                      value: e.target.value,
                    })
                  )
                }
                onBlur={(e) => {
                  dispatch(
                    blurField({
                      name: "securityDeposit",
                      value: e.target.value,
                    })
                  );
                }}
              />
              <button className="btn btn-icon secondary">
                <img src={infoIcon} alt="Information" />
              </button>
            </div>
            {itemDataState.securityDeposit.triggered &&
              itemDataState.securityDeposit.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="warning-icon"
                    alt="Error on security deposit"
                  />
                  <span className="text">
                    {itemDataState.securityDeposit.error}
                  </span>
                </div>
              )}
          </div>
          <div className="term repair-replacement">
            <label className="label">Repair and Replacement</label>
            <div className="input-wrapper">
              <input
                id="repairReplacement"
                name="repairReplacement"
                className="input"
                placeholder="Add repair and replacement"
                required
                type="text"
                value={itemDataState.repairReplacement.value}
                onChange={(e) =>
                  dispatch(
                    updateField({
                      name: "repairReplacement",
                      value: e.target.value,
                    })
                  )
                }
                onBlur={(e) => {
                  dispatch(
                    blurField({
                      name: "repairReplacement",
                      value: e.target.value,
                    })
                  );
                }}
              />
              <button className="btn btn-icon secondary">
                <img src={infoIcon} alt="Information" />
              </button>
            </div>
            {itemDataState.repairReplacement.triggered &&
              itemDataState.repairReplacement.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="warning-icon"
                    alt="Error on  repair and replacement"
                  />
                  <span className="text">
                    {itemDataState.repairReplacement.error}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTerms;
