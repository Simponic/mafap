import { io } from "socket.io-client";
import { useState, useEffect } from "react";

export interface UseInitialDataProps {
  namespace: string;
  initialDataEndpoint: string;
  query?: any;
}

export const useInitialData = <T>(props: UseInitialDataProps) => {
  const [data, setData] = useState<T>();
  const [query, setQuery] = useState(props?.query);
  const [socket, setSocket] = useState();

  const refreshData = () =>
    fetch(props.initialDataEndpoint)
      .then((r) => r.json())
      .then((r: T) => {
        setData(r);
      });

  useEffect(() => {
    refreshData();

    const socket = io(props.namespace, {
      query,
      transports: ["websocket"],
    });

    setSocket(socket);

    return () => {
      socket.close();
      setSocket(undefined);
    };
  }, [query]);

  return { data, refreshData, query, setQuery, socket, setData };
};
