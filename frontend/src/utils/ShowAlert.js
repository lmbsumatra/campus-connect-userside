
import { showNotification } from "../redux/alert-popup/alertPopupSlice";

const ShowAlert = (dispatch, type, title, text) => {
  dispatch(showNotification({ type, title, text }));
};

export default ShowAlert;
