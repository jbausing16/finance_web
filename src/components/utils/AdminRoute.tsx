import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useLazyGetUsersWithRoleQuery } from "@/store/api/authApi";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout, viewUser } from "@/store/auth/authSlice";
import type { RootState } from "@/store";
import { Loading } from "../reusables/Loading";

const AdminRoute = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const currentRole = useSelector((state: RootState) => state.auth.role);

  const [getUsersWithRole] = useLazyGetUsersWithRoleQuery();
  const [checkedAuth, setCheckedAuth] = useState(false);

  const checkAuth = async () => {
    try {
      if (currentRole === 0 || currentRole === null) {
        const roleResponse = await getUsersWithRole().unwrap();
        dispatch(
          loginSuccess({
            role: roleResponse.user_type,
          }),
        );
        dispatch(
          viewUser({
            name: roleResponse.name,
            email: roleResponse.email,
            image: roleResponse.image,
          }),
        );
      }
      setCheckedAuth(true);
    } catch {
      dispatch(logout());
      setCheckedAuth(true);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    } else {
      setCheckedAuth(true);
    }
  }, [isAuthenticated]);

  if (!checkedAuth) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (currentRole !== 1) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminRoute;
