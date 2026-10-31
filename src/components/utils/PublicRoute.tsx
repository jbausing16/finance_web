import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import {
  useLazyGetUserQuery,
  useLazyGetUsersWithRoleQuery,
} from "@/store/api/authApi";
import { useEffect, useState } from "react";
import { Loading } from "../reusables/Loading";
import { loginSuccess, logout, viewUser } from "@/store/auth/authSlice";
import { modules } from "@/lib/utils";

const PublicRoute = () => {
  const role = useSelector((state: RootState) => state.auth.role);
  console.log("Role: ", role);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const dispatch = useDispatch();
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [getUser] = useLazyGetUserQuery();
  const [getUsersWithRole] = useLazyGetUsersWithRoleQuery();
  const [url, setUrl] = useState("");

  const [urole, setUrole] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getUser({}).unwrap();
        if (user) {
          const url1 = modules.find(
            (item) => String(user?.land) === String(item.id),
          )?.url;
          setUrl(url1 || "");
        }
        if (!user?.id) throw new Error("No user ID");

        if (!role) {
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
          setUrole(roleResponse.user_type);
          setCheckedAuth(true);
        }
      } catch {
        dispatch(logout());
        setCheckedAuth(true);
      }
    };

    checkAuth();
  }, [dispatch, getUser, getUsersWithRole, role]);

  if (!checkedAuth) {
    return <Loading />;
  }

  if (role === 1 && role) {
    return <Navigate to="/admin/client" />;
  }

  if (role !== 1 && role !== 0 && role) {
    window.location.reload();
    return <Navigate to={url} />;
  }

  return <Outlet />;
};

export default PublicRoute;
