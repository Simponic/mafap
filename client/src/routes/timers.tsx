import { useEffect, useState } from "react";

import TimerCard from "../components/timerCard";
import TimerHeader from "../components/timerHeader";
import { useInitialData } from "../hooks/useInitialData";

import { Friend, TimersFilter, TimerResponse } from "../utils/types";

const makeEndpoint = (filter?: TimersFilter) => {
  let url = "/api/timers";
  if (filter && typeof filter.friendId !== "undefined")
    url += `/friend?id=${filter.friendId}`;
  return url;
};

export default function Timers() {
  const {
    data: timers,
    refreshData: refreshTimers,
    setData: setTimers,
    query,
    setQuery,
    socket,
    setEndpoint,
  } = useInitialData<TimerResponse[]>({
    initialDataEndpoint: makeEndpoint(),
    namespace: "/events/timers",
  });
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selected, setSelected] = useState<TimersFilter | undefined>();

  useEffect(() => {
    fetch("/api/auth/friends")
      .then((r) => r.json())
      .then((friends: Friend[]) => setFriends(friends));
  }, []);

  const onSelect = (selected?: TimersFilter) => {
    setSelected(selected);
    setEndpoint(makeEndpoint(selected));
    setQuery(selected);
  };

  useEffect(() => {
    socket?.on("refreshed", (newTimer: TimerResponse) => {
      setTimers((timers) =>
        timers?.map((timer) => {
          if (timer.id === newTimer.id) return newTimer;
          return timer;
        })
      );
    });

    socket?.on("created", (newTimer: TimerResponse) => {
      setTimers((timers) => {
        if (timers) {
          return [...timers, newTimer];
        }
        return [newTimer];
      });
    });
  }, [socket]);

  return (
    <div className="container">
      <TimerHeader friends={friends} selected={selected} onSelect={onSelect} />
      {timers ? (
        timers
          .map((timer) => ({
            ...timer,
            start: new Date(timer.start),
          }))
          .sort(
            (
              { start: startA }: { start: Date },
              { start: startB }: { start: Date }
            ) => startB.getTime() - startA.getTime()
          )
          .map((timer) => (
            <TimerCard onSelect={onSelect} timer={timer} key={timer.id} />
          ))
      ) : (
        <></>
      )}
    </div>
  );
}
