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

const refreshTimer = (id?: number) => {
  if (!id) return;

  return fetch(`/api/timers/${id}/refresh`, {
    method: "POST",
  });
};

export type TimerCardProps = {
  timer: TimerResponse;
  onSelect: (select?: TimersFilter) => void;
};

export default function TimerCard({ timer, onSelect }: TimerCardProps) {
  const [since, setSince] = useState<string>("");

  useEffect(() => {
    if (timer && timer.start) {
      const start = new Date(timer.start);
      let updateTimersInterval: ReturnType<typeof setInterval>;
      const msTillNextSecond = 1000 - (start.getTime() % 1000);

      setSince(ago(start));

      setTimeout(() => {
        updateTimersInterval = setInterval(() => setSince(ago(start)), 1_000);
      }, msTillNextSecond);

      return () => clearInterval(updateTimersInterval);
    }
  }, [timer?.start]);

  return (
    <div className="card grid-card">
      <div>
        <header>
          <h4 className="is-center">
            <code>{since || "..."}</code>
          </h4>
        </header>
        <p>
          {timer?.name && timer?.referenced_friends ? (
            replaceReferencedFriendsInName(
              timer.name,
              timer.referenced_friends,
              onSelect
            ).map((element: JSX.Element | string, i: number) => (
              <span
                style={{ overflowWrap: "anywhere", hyphens: "auto" }}
                key={i}
              >
                {element}
              </span>
            ))
          ) : (
            <> </>
          )}
        </p>
      </div>
      <div className="timer-metadata text-grey italic">
        {timer.created_by ? (
          <div>
            <a onClick={() => onSelect({ friendId: timer?.created_by?.id })}>
              {timer.created_by.name}
            </a>{" "}
            is tracking this
          </div>
        ) : (
          <div>has no creator?</div>
        )}
        <div>
          {timer.timer_refreshes && timer.timer_refreshes.length ? (
            <span>
              <a
                onClick={() =>
                  onSelect({
                    friendId: timer.timer_refreshes
                      ? timer.timer_refreshes[0].refreshed_by.id
                      : undefined,
                  })
                }
              >
                {timer.timer_refreshes[0].refreshed_by.name}
              </a>{" "}
              refreshed it last
            </span>
          ) : (
            "has not yet been refreshed..."
          )}
        </div>

        <button
          onClick={() => refreshTimer(timer?.id)}
          className="button outline"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
