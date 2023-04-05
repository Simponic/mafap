import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";

export type ProtectedRouteProps = {
  children: ReactElement<any, any>;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { signedIn } = useAuthContext();

  if (signedIn === false) return <Navigate to="/login" />;
  if (signedIn) return children;
  return <></>; // While it's undefined - we're checking localstorage
}
