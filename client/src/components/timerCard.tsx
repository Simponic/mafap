import { useEffect, useState } from "react";
import { ago } from "../utils/ago";
import { TimerResponse, Friend, TimersFilter } from "../utils/types";

const replaceReferencedFriendsInName = (
  name: string,
  referencedFriends: Friend[],
  onSelect: (select?: TimersFilter) => void
) => {
  const friendIdToFriend = referencedFriends.reduce(
    (friendMap: Record<string, Friend>, friend) => {
      friendMap[friend.id.toString()] = friend;
      return friendMap;
    },
    {}
  );

  return name.split(/(@\<\d+\>)/g).map((s: string) => {
    const matches = /@\<(\d+)\>/g.exec(s);
    if (matches) {
      const [_match, id] = matches;
      const name = friendIdToFriend[id].name;

      return <a onClick={() => onSelect({ friendId: Number(id) })}>{name}</a>;
    }
    return s;
  });
};

export type TimerCardProps = {
  timer: TimerResponse;
  onSelect: (select?: TimersFilter) => void;
};

export default function TimerCard({ timer, onSelect }: TimerCardProps) {
  const [since, setSince] = useState<string>(ago(timer.start));

  useEffect(() => {
    let updateTimersInterval: ReturnType<typeof setInterval>;
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
      ).map((element: JSX.Element | string, i: number) => (
        <span key={i}>{element}</span>
      ))}
    </h1>
  );
}
