import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectStudentUser } from "../redux/auth/studentAuthSlice";
import ShowAlert from "./ShowAlert";

const useHandleActionWithAuthCheck = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const studentUser = useSelector(selectStudentUser);

  const handleAction = (action, hide = () => {}) => {
    if (studentUser === null) {
      hide(); // Hide modal first
      ShowAlert(dispatch, "warning", "Action Required", "Please login first", {
        text: "Login",
        action: () => {
          navigate("/", { state: { showLogin: true, authTab: "loginTab" } });
        },
      });
    } else {
      navigate(action);
    }
  };

  return handleAction;
};

export default useHandleActionWithAuthCheck;
