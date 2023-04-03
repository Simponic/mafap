import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <>
      <h1>Hello</h1>
      <Outlet />
    </>
  );
}
