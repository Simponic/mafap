import { useEffect, useState } from "react";
import { useAuthContext } from "../context/authContext";

export default function TimerHeader({ onSelect }) {
  const [friends, setFriends] = useState([]);
  const { friendName } = useAuthContext();

  useEffect(() => {
    fetch("/api/auth/friends")
      .then((r) => r.json())
      .then((friends) => setFriends(friends));
  }, []);

  return (
    <>
      <div>{friendName}</div>
      {friends.map((friend) => (
        <div key={friend.id}>
          <p>{friend.name}</p>
        </div>
      ))}
    </>
  );
}
