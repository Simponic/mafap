import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";

export default function ProtectedRoute({ children }) {
  const { signedIn } = useAuthContext();

  //  if (!signedIn) return <Navigate to="/login" />;

  return children;
}
