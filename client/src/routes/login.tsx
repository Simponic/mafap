import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";
import "../styles/login.css";

const requestTokenSubmit = async (name) =>
  fetch(
    "/api/auth?" +
      new URLSearchParams({
        name,
      })
  ).then((r) => r.json());

const submitSignedToken = async (signature) =>
  fetch("/api/auth", {
    method: "POST",
    body: JSON.stringify({
      signature,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());

export default function Login() {
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState([]);

  const { signedIn, setSignedIn, setSessionOver, setFriendId, setFriendName } =
    useAuthContext();

  const getTokenFormSubmission = async (e) => {
    e.preventDefault();
    const { error, message, token } = await requestTokenSubmit(
      e.target.name.value
    );
    if (error && message) {
      setErrors([message]);
      return;
    }
    setErrors([]);
    setToken(token);
  };

  const signTokenFormSubmission = async (e) => {
    e.preventDefault();
    const { error, message, token, expiration, friend } =
      await submitSignedToken(e.target.signature.value);

    if (token) {
      setSignedIn(true);
      setSessionOver(new Date(expiration));
      setFriendId(friend.id.toString());
      setFriendName(friend.name);

      return;
    }

    if (error & message) {
      setErrors([message]);
    }
  };

  if (signedIn) {
    return <Navigate to="/" />;
  }

  if (!token)
    return (
      <div className="body-centered">
        <form onSubmit={getTokenFormSubmission} autoComplete="off">
          <div className="card">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" />
            {errors.length ? (
              errors.map((error, i) => (
                <div key={i} className="text-error">
                  {error}
                </div>
              ))
            ) : (
              <></>
            )}

            <button type="submit">Request Token</button>
          </div>
        </form>
      </div>
    );
  return (
    <div className="body-centered">
      <div className="login card">
        <div>Please sign the following payload with your PGP key:</div>
        <code>{token}</code>
        <hr />
        <form onSubmit={signTokenFormSubmission}>
          <textarea
            id="signature"
            name="signature"
            rows="6"
            placeholder="-----BEGIN PGP SIGNED MESSAGE-----"
          />

          {errors.length ? (
            errors.map((error, i) => (
              <div key={i} className="text-error">
                {error}
              </div>
            ))
          ) : (
            <></>
          )}

          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}
