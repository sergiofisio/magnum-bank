import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { fetchUserProfile } from "../store/slices/authSlice";
import type { AppDispatch, RootState } from "../store";

const AuthLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token && !user) {
        await dispatch(fetchUserProfile()).unwrap();
      }
      setIsVerifying(false);
    };

    verifyToken();
  }, [dispatch, token]);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-text-secondary text-lg">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default AuthLayout;
