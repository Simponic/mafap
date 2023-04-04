import { useEffect, useState } from "react";
import { useAuthContext } from "../context/authContext";

export default function TimerHeader({ onSelect }) {
  const [friends, setFriends] = useState([]);
  const { friendName, setSignedIn } = useAuthContext();
  const [selected, setSelected] = useState();

  const logout = () => {
    fetch("/api/auth/logout").then(() => setSignedIn(false));
  };

  useEffect(() => {
    fetch("/api/auth/friends")
      .then((r) => r.json())
      .then((friends) => setFriends(friends));
  }, []);

  return (
    <nav className="nav">
      <div className="nav-left">
        <div className="tabs">
          <a
            onClick={() => {
              setSelected(undefined);
              onSelect(undefined);
            }}
            className={selected ? "" : "active"}
          >
            all
          </a>
          {friends.map((friend) => (
            <a
              key={friend.id}
              onClick={() => {
                setSelected(friend.id);
                onSelect({ friendId: friend.id });
              }}
              className={selected === friend.id ? "active" : ""}
            >
              {friend.name}
            </a>
          ))}
        </div>
      </div>
      <div className="nav-right">
        <details className="dropdown">
          <summary style={{ marginTop: "1rem" }} className="button outline">
            {friendName}
          </summary>
          <a className="button outline text-error" onClick={logout}>
            Logout
          </a>
        </details>
      </div>
    </nav>
  );
}
