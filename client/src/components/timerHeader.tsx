import Modal from "react-modal";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/authContext";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "40vw",
    maxWidth: "800px",
  },
};

Modal.setAppElement("#root");

export default function TimerHeader({ friends, selected, onSelect }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { friendName, setSignedIn } = useAuthContext();

  const logout = () => {
    fetch("/api/auth/logout").then(() => setSignedIn(false));
  };

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        style={customStyles}
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
              <span>New Timer</span>
              <a onClick={() => setModalOpen(false)} className="button outline">
                &times;
              </a>
            </div>
            <div>
              <form>
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
