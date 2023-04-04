import { useEffect, useState } from "react";
import TimerCard from "../components/timerCard";
import TimerHeader from "../components/timerHeader";
import { useInitialData } from "../hooks/useInitialData";

export type TimersFilter = {
  friendId: undefined | number; // when undefined, get all
};

export type TimersProps = {
  filter: TimersFilter;
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

const putSince = (timers) =>
  timers.map((timer) => ({
    ...timer,
    since: "10 seconds ago",
  }));

const makeInitialDataEndpoint = (filter: TimersFilter) => {
  let url = "/api/timers";
  if (filter && typeof filter.friendId !== "undefined")
    url += `?id=${filter.friendId}`;
  return url;
};

const makeQuery = (filter: TimersFilter) => {
  if (filter && typeof filter.friendId !== "undefined")
    return { friend: filter.friendId };
  return {};
};

export default function Timers({ filter }: TimersProps) {
  const {
    data: timers,
    refreshData: refreshTimers,
    setData: setTimers,
    query,
    setQuery,
    socket,
  } = useInitialData<TimerResponse[]>({
    initialDataEndpoint: makeInitialDataEndpoint(filter),
    namespace: "/events/timers",
    query: makeQuery(filter),
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

  useEffect(() => {
    const updateTimersInterval = setInterval(() => {
      setTimers((timers) => putSince(timers));
    }, 1_000);

    return () => clearInterval(updateTimersInterval);
  }, []);

  return (
    <>
      <TimerHeader />
      {timers?.map((timer) => (
        <TimerCard timer={timer} key={timer.id} />
      ))}
    </>
  );
}
