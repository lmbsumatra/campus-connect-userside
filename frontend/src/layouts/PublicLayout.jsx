import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import TopBar from "../components/topbar/TopBar";
import Footer from "../components/users/footer/Footer";
import FAB from "../components/common/fab/FAB";
import TrialOnNavbar from "../trials/TrialOnNavbar";
import { fetchUser } from "../redux/user/userSlice";
import { selectStudentUser } from "../redux/auth/studentAuthSlice";
import PendingUserApproval from "../components/topbar/PendingUserApproval";

function PublicLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, loadingFetchUser } = useSelector((state) => state.user);
  const studentUser = useSelector(selectStudentUser);

  useEffect(() => {
    if (studentUser?.userId) {
      dispatch(fetchUser(studentUser.userId));
    }
  }, [dispatch, studentUser?.userId]);

  const isVerified = user?.user?.emailVerified ?? false;
  const isApproved = user?.student?.status ?? false;

  // if (loadingFetchUser) {
  //   return "loading";
  // }

  console.log({ user }, studentUser.userId);

  const isDarkTheme = !["/", "/home", "/discover"].includes(location.pathname);

  return (
    <>
      {studentUser?.userId && !loadingFetchUser && (
        <>
          <TopBar isVerified={isVerified} user={user?.user} />
          <PendingUserApproval
            isVerified={isApproved}
            user={{
              student: user?.student,
              ...user?.user,
            }}
          />
        </>
      )}
      {isDarkTheme && <TrialOnNavbar theme="dark" />}

      <FAB icon="+" />
      <Outlet />
      <Footer />
    </>
  );
}

export default PublicLayout;
