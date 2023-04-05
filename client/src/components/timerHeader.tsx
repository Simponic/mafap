import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { useAuthContext } from "../context/authContext";
import { Friend, TimersFilter, TimerResponse } from "../utils/types";
import mentionStyles from "../styles/mention";
import modalStyles from "../styles/modal";

export type TimerHeaderProps = {
  friends: Friend[];
  selected?: TimersFilter;
  onSelect: (selected?: TimersFilter) => void;
};

export default function TimerHeader({
  friends,
  selected,
  onSelect,
}: TimerHeaderProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [newTimerName, setNewTimerName] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const { friendName, setSignedIn } = useAuthContext();

  const logout = () => {
    fetch("/api/auth/logout").then(() => setSignedIn(false));
  };

  const createTimer = (e: any) => {
    e.preventDefault();

    fetch("/api/timers", {
      method: "POST",
      body: JSON.stringify({
        name: newTimerName.replaceAll(
          /\[@[\w\d\s]+\]\((\@<\d+>)\)/g,
          (_match, atId) => atId
        ),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((r: TimerResponse) => {
        if (r.message) {
          setErrors([r.message]);
          return;
        }
        setNewTimerName("");
        setErrors([]);
        setModalOpen(false);
      });
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={modalStyles}
      >
        <div>
          <div className="my-modal-header">
            <div>
              <h4>New Timer</h4>
              <p>
                Use <code>@</code> and the autocomplete menu to reference a user
              </p>
            </div>

            <a onClick={() => setModalOpen(false)} className="button outline">
              &times;
            </a>
          </div>
          <div>
            <form onSubmit={createTimer}>
              <MentionsInput
                placeholder="since @..."
                style={mentionStyles}
                value={newTimerName}
                onChange={(e: any) => setNewTimerName(e.target.value)}
              >
                <Mention
                  trigger="@"
                  data={friends.map(({ id, name }: Friend) => ({
                    id: `@<${id}>`,
                    display: `@${name}`,
                  }))}
                />
              </MentionsInput>
              {errors.length ? (
                errors.map((error, i) => (
                  <div key={i} className="text-error">
                    {error}
                  </div>
                ))
              ) : (
                <></>
              )}
              <button type="submit">Add</button>
            </form>
          </div>
        </div>
      </Modal>

      <nav className="nav">
        <div className="nav-left">
          <div className="tabs">
            <a
              onClick={() => {
                onSelect(undefined);
              }}
              className={selected ? "" : "active"}
            >
              all
            </a>
            {friends.map((friend: Friend) => (
              <a
                key={friend.id}
                onClick={() => {
                  onSelect({ friendId: friend.id });
                }}
                className={selected?.friendId == friend.id ? "active" : ""}
              >
                {friend.name}
              </a>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <a
            style={{ marginTop: "1rem" }}
            onClick={() => setModalOpen(true)}
            className="button outline"
          >
            +
          </a>
          <details className="dropdown">
            <summary style={{ marginTop: "1rem" }} className="button outline">
              {friendName}
            </summary>
            <a className="button outline text-error bg-light" onClick={logout}>
              Logout
            </a>
          </details>
        </div>
      </nav>
    </>
  );
}
