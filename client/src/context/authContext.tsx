import React, { useContext, useState, createContext, useEffect } from "react";

interface authContext {
  signedIn?: boolean;
  setSignedIn: (signedIn: boolean) => void;
  sessionOver: Date;
  setSessionOver: (expiry: Date) => void;
  friendId: number | null;
  setFriendId: (newFriendId: number | null) => void;
  friendName: string | null;
  setFriendName: (newFriendName: string | null) => void;
}

const AuthContext = createContext<authContext>({
  signedIn: false,
  setSignedIn: () => null,
  sessionOver: new Date(),
  setSessionOver: () => null,
  friendId: null,
  setFriendId: () => null,
  friendName: "",
  setFriendName: () => null,
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [signedIn, setSignedIn] = useState<boolean | undefined>();
  const [sessionOver, setSessionOver] = useState<Date>(new Date());
  const [friendId, setFriendId] = useState<number | null>(null);
  const [friendName, setFriendName] = useState<string | null>(null);

  useEffect(() => {
    if (friendName) {
      localStorage.setItem("friendName", friendName);
    }
  }, [friendName]);

  useEffect(() => {
    if (friendId) {
      localStorage.setItem("friendId", friendId.toString());
    }
  }, [friendId]);

  useEffect(() => {
    let expiry: string | null | Date = localStorage.getItem("expiry");
    if (expiry) {
      expiry = new Date(expiry);
      if (Date.now() < expiry.getTime()) {
        setSignedIn(true);
        setSessionOver(expiry);
        ((friendName) => {
          if (friendName) {
            setFriendName(friendName);
          }
        })(localStorage.getItem("friendName"));

        ((id) => {
          if (id) {
            setFriendId(parseInt(id, 10));
          }
        })(localStorage.getItem("friendId"));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("expiry", sessionOver.toISOString());
    setTimeout(() => {
      setSessionOver((sessionOver) => {
        if (Date.now() >= sessionOver.getTime()) {
          setSignedIn((signedIn) => {
            if (signedIn) {
              alert(
                "Session expired. Any further privileged requests will fail until signed in again."
              );
              ["friendId", "friendName"].map((x) => localStorage.removeItem(x));
              return false;
            }
            return !!signedIn;
          });
        } else {
          setSignedIn(true);
        }

        return sessionOver;
      });
    }, Math.max(0, sessionOver.getTime() - Date.now()));
  }, [sessionOver]);

  return (
    <AuthContext.Provider
      value={{
        signedIn,
        setSignedIn,
        sessionOver,
        setSessionOver,
        friendId,
        setFriendId,
        friendName,
        setFriendName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
