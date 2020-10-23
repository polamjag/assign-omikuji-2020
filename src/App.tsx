import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

interface LuckyUser {
  readonly beenLuckyAt: Date;
  readonly name: string;
}

function App() {
  const [users, setUsers] = useState<Array<string>>([]);
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    undefined
  );
  const [luckyUsers, setLuckyUsers] = useState<Array<LuckyUser>>([]);

  const requestRef = React.useRef<number>();

  const animate = useCallback(() => {
    if (users.length > 0) {
      const idx = Math.floor(Math.random() * users.length);
      setCurrentIndex(idx);
    } else {
      setCurrentIndex(undefined);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [users]);

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [users, currentIndex, animate]);

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    if (location.hash === "") {
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    setUsers(location.hash.substr(1).split(","));
  }, []);
  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    location.hash = users.join(",");
  }, [users]);

  const [username, setUsername] = useState<string>("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.currentTarget.value);
  };
  const onClick = (): void => {
    if (username === "") {
      return;
    }
    setUsers([...users, username]);
    setUsername("");
  };

  const hitLuckyUser = (): void => {
    if (currentIndex === undefined) {
      return;
    }

    const lu: LuckyUser = {
      beenLuckyAt: new Date(),
      name: users[currentIndex],
    };

    alert(lu.name);

    setLuckyUsers([lu, ...luckyUsers]);
  };

  const removeUserAt = (idx: number): void => {
    users.splice(idx, 1);
    setUsers([...users]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onClick();
    } else if (event.key === "Backspace" && username === "") {
      removeUserAt(users.length - 1);
    }
  };

  return (
    <div className="App">
      <h1>Assign Omikuji 2020</h1>
      <ul className="userlist">
        {users.map((user, i) => (
          <li key={user} className="userlist-user">
            <HatenaUserChip username={user} />
            <button
              onClick={() => removeUserAt(i)}
              aria-label="Remove this user"
              title="Remove this user"
              className="userlist-user-x-btn"
            >
              ✗
            </button>
          </li>
        ))}
      </ul>
      <div className="add-form">
        <span>
          <Icon username={username} />
          <input
            onKeyDown={handleKeyDown}
            onChange={onChange}
            value={username}
            placeholder="Hatena ID"
          />
          <button onClick={onClick} type="button">
            Add user
          </button>
        </span>
        <div style={{ marginTop: ".4em", fontSize: ".6em", color: "grey" }}>
          [Backspace] to remove last user / [Enter] to Add user
        </div>
      </div>
      {currentIndex !== undefined && (
        <>
          <div className="pixelated omikuji">
            <button
              onClick={hitLuckyUser}
              className="omikuji-button"
            >
              <Icon username={users[currentIndex]} size={256} />
            </button>
          </div>
          <div className="click-to-assign">CLICK TO ASSIGN</div>
        </>
      )}
      <div className="lucky-users">
        {luckyUsers.map((lu, i) => (
          <div key={i} className="lucky-user-line">
            {lu.beenLuckyAt.toISOString()}:{" "}
            <HatenaUserChip username={lu.name} />
          </div>
        ))}
      </div>
      <footer>
        Heavily inspired by{" "}
        <a href="https://hitode909.appspot.com/assign_omikuji/">
          "アサインおみくじ"
        </a>{" "}
        by{" "}
        <a href="https://blog.hatena.ne.jp/hitode909/">
          <HatenaUserChip username="hitode909" />
        </a>
        <br />
        Open source at{" "}
        <a href="https://github.com/polamjag/assign-omikuji-2020">
          polamjag/assign-omikuji-2020
        </a>
      </footer>
    </div>
  );
}

const HatenaUserChip: React.FC<{ readonly username: string }> = ({
  username,
}) => (
  <span>
    <Icon username={username} /> id:{username}
  </span>
);

const Icon: React.FC<{ readonly username: string; readonly size?: number }> = ({
  username,
  size = 16,
}) => (
  <img
    src={`https://cdn.profile-image.st-hatena.com/users/${username}/profile_256x256.png`}
    alt=""
    width={size}
    height={size}
  />
);

export default App;
