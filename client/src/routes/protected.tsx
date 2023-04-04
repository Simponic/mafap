import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";

export type ProtectedRouteProps = {
  children: ReactElement<any, any>;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { signedIn } = useAuthContext();

  if (!signedIn) return <Navigate to="/login" />;

  return children;
}
