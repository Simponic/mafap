import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";
import { SignThisTokenResponse, TokenResponse } from "../utils/types";
import "../styles/login.css";

const requestTokenSubmit = async (
  name: string
): Promise<SignThisTokenResponse> =>
  fetch(
    "/api/auth?" +
      new URLSearchParams({
        name,
      })
  ).then((r) => r.json());

const submitSignedToken = async (signature: string): Promise<TokenResponse> =>
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
  const [token, setToken] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const { signedIn, setSignedIn, setSessionOver, setFriendId, setFriendName } =
    useAuthContext();

  const getTokenFormSubmission = async (e: any) => {
    e.preventDefault();
    const { error, message, token } = await requestTokenSubmit(
      e.target.name.value
    );
    if (message && error) {
      setErrors([message]);
      return;
    }
    if (token) {
      setErrors([]);
      setToken(token);
    }
  };

  const signTokenFormSubmission = async (e: any) => {
    e.preventDefault();
    const { error, message, token, expiration, friend } =
      await submitSignedToken(e.target.signature.value);

    if (token && expiration && friend) {
      setSignedIn(true);
      setSessionOver(new Date(expiration));
      setFriendId(friend.id);
      setFriendName(friend.name);

      return;
    }

    if (error && message) {
      setErrors([message as string]);
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
            rows={6}
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
