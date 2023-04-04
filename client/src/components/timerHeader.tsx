import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { useAuthContext } from "../context/authContext";
import mentionStyles from "../styles/mention";
import modalStyles from "../styles/modal";

Modal.setAppElement("#root");

export default function TimerHeader({ friends, selected, onSelect }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [errors, setErrors] = useState([]);
  const { friendName, setSignedIn } = useAuthContext();

  const logout = () => {
    fetch("/api/auth/logout").then(() => setSignedIn(false));
  };

  const createTimer = (e) => {
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
      .then((r) => {
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
        <div id="createTimerModal">
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h4 style={{ margin: "none" }}>New Timer</h4>

              <a onClick={() => setModalOpen(false)} className="button outline">
                &times;
              </a>
            </div>
            <div>
              <form onSubmit={createTimer}>
                <MentionsInput
                  style={mentionStyles}
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                >
                  <Mention
                    data={friends.map(({ id, name }) => ({
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
            {friends.map((friend) => (
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
            onClick={() => setModalOpen(true)}
            style={{ marginTop: "1rem" }}
            className="button outline"
          >
            +
          </a>
          <details className="dropdown">
            <summary style={{ marginTop: "1rem" }} className="button outline">
              {friendName}
            </summary>
            <a className="button outline text-error" onClick={logout}>
              Logout
            </a>
          </details>
        </div>
      </nav>
    </>
  );
}
