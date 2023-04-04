import { useEffect, useState } from "react";

import TimerCard from "../components/timerCard";
import TimerHeader from "../components/timerHeader";
import { useInitialData } from "../hooks/useInitialData";

export type TimersFilter = {
  friendId: undefined | number; // when undefined, get all
};

export type Friend = {
  id: number;
  name: number;
};

export type TimerResponse = {
  id: number;
  name: string;
  start: Date;
  created_by: Friend;
  referenced_friends: Friend[];
};

const makeEndpoint = (filter: TimersFilter) => {
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
    initialDataEndpoint: makeEndpoint({}),
    namespace: "/events/timers",
    query: {},
  });

  useEffect(() => {
    socket?.on("refreshed", (newTimer: TimerResponse) => {
      setTimers((timers) =>
        timers.map((timer) => {
          if (timer.id === newTimer.id) return newTimer;
          return timer;
        })
      );
    });

    socket?.on("created", (newTimer: TimerResponse) => {
      setTimers((timers) => [...timers, newTimer]);
    });
  }, [socket]);

  return (
    <div className="container">
      <TimerHeader
        onSelect={(selected: TimersFilter) => {
          setEndpoint(makeEndpoint(selected));
          setQuery(selected);
        }}
      />
      {timers ? (
        timers
          .map((timer) => ({
            ...timer,
            start: new Date(timer.start),
          }))
          .sort(({ start: startA }, { start: startB }) => startB - startA)
          .map((timer) => <TimerCard timer={timer} key={timer.id} />)
      ) : (
        <></>
      )}
    </div>
  );
}
