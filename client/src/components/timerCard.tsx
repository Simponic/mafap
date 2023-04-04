import { ago } from "../utils/ago";
import { useEffect, useState } from "react";

const replaceReferencedFriendsInName = (name, referencedFriends) => {
  const friendIdToFriend = referencedFriends.reduce((friendMap, friend) => {
    friendMap[friend.id] = friend;
    return friendMap;
  }, {});
  return name.replaceAll(
    /@\<(\d+)\>/g,
    (_match, id) => friendIdToFriend[id].name
  );
};
//  name.replaceAll(

export default function TimerCard({ timer }) {
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
      {replaceReferencedFriendsInName(timer.name, timer.referenced_friends)}
    </h1>
  );
}
