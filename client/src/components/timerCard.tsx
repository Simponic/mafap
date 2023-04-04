import { ago } from "../utils/ago";
import { useEffect, useState } from "react";

const replaceReferencedFriendsInName = (name, referencedFriends, onSelect) => {
  const friendIdToFriend = referencedFriends.reduce((friendMap, friend) => {
    friendMap[friend.id] = friend;
    return friendMap;
  }, {});
  return name.split(/(@\<\d+\>)/g).map((s) => {
    const matches = /@\<(\d+)\>/g.exec(s);
    if (matches) {
      const [_match, id] = matches;
      const name = friendIdToFriend[id].name;

      return <a onClick={() => onSelect({ friendId: id })}>{name}</a>;
    }
    return s;
  });
};

export default function TimerCard({ timer, onSelect }) {
  const [since, setSince] = useState(ago(timer.start));

  useEffect(() => {
    let updateTimersInterval;
    const msTillNextSecond = 1000 - (timer.start.getTime() % 1000);

    setTimeout(() => {
      updateTimersInterval = setInterval(
        () => setSince(ago(timer.start)),
        1_000
      );
    }, msTillNextSecond);

    return () => clearInterval(updateTimersInterval);
  }, []);

  return (
    <h1>
      <code>{since}</code>{" "}
      {replaceReferencedFriendsInName(
        timer.name,
        timer.referenced_friends,
        onSelect
      ).map((s, i) => (
        <span key={i}>{s}</span>
      ))}
    </h1>
  );
}
