import { useReducer, useState } from "react";
import "./addTermsStyles.css";
import expandIcon from "../../../../assets/images/pdp/plus.svg";
import infoIcon from "../../../../assets/images/input-icons/info.svg";
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "../../../../hooks/input-reducers/itemFormInputReducer";
import warningIcon from "../../../../assets/images/input-icons/warning.svg";

const initialState = {
  category: { value: "", triggered: false, hasError: true, error: "" },
  itemName: { value: "", triggered: false, hasError: true, error: "" },
  price: { value: "", triggered: false, hasError: true, error: "" },
  availableDates: {
    value: [],
    triggered: false,
    hasError: false,
    error: "",
  },
  deliveryMethod: { value: "", triggered: false, hasError: true, error: "" },
  paymentMethod: { value: "", triggered: false, hasError: true, error: "" },
  itemCondition: { value: "", triggered: false, hasError: true, error: "" },
  lateCharges: { value: "", triggered: false, hasError: true, error: "" },
  securityDeposit: { value: "", triggered: false, hasError: true, error: "" },
  repairReplacement: { value: "", triggered: false, hasError: true, error: "" },

  images: { value: [], triggered: false, hasError: false, error: "" }, // Array of images
  desc: { value: "", triggered: false, hasError: false, error: "" }, // Array of tags
  tags: { value: [], triggered: false, hasError: false, error: "" }, // Array of tags
  specs: { value: {}, triggered: false, hasError: false, error: "" }, // Object for specs

  isFormValid: false,
};

const formsReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FORM:
      return {
        ...state,
        [action.data.name]: {
          ...state[action.data.name],
          value: action.data.value,
          hasError: action.data.hasError,
          error: action.data.error,
          triggered: action.data.triggered,
        },
        isFormValid: action.data.isFormValid,
      };
    default:
      return state;
  }
};

const AddTerms = ({ values }) => {
  const [itemDataState, dispatchtwo] = useReducer(formsReducer, initialState);
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
                  onInputChange(
                    "lateCharges",
                    e.target.value,
                    dispatchtwo,
                    itemDataState
                  )
                }
                onBlur={(e) => {
                  onBlur(
                    "lateCharges",
                    e.target.value,
                    dispatchtwo,
                    itemDataState
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
                    className="icon"
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
                  onInputChange(
                    "securityDeposit",
                    e.target.value,
                    dispatchtwo,
                    itemDataState
                  )
                }
                onBlur={(e) => {
                  onBlur(
                    "securityDeposit",
                    e.target.value,
                    dispatchtwo,
                    itemDataState
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
                    className="icon"
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
                value={itemDataState.price.value}
                onChange={(e) =>
                  onInputChange(
                    "repairReplacement",
                    e.target.value,
                    dispatchtwo,
                    itemDataState
                  )
                }
                onBlur={(e) => {
                  onBlur(
                    "repairReplacement",
                    e.target.value,
                    dispatchtwo,
                    itemDataState
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
                    className="icon"
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
