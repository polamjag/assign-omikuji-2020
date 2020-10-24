import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

interface User {
  name: string;
}

interface LuckyUser {
  readonly beenLuckyAt: Date;
  readonly user: User;
}

function App() {
  const [users, setUsers] = useState<Array<User>>([]);
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
    setUsers(
      // eslint-disable-next-line no-restricted-globals
      location.hash
        .substr(1)
        .split(",")
        .map((name) => ({ name }))
    );
  }, []);
  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    location.hash = users.map(u => u.name).join(",");
  }, [users]);

  const [username, setUsername] = useState<string>("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.currentTarget.value);
  };
  const onClick = (): void => {
    if (username === "") {
      return;
    }
    setUsers([...users, { name: username }]);
    setUsername("");
  };

  const hitLuckyUser = (): void => {
    if (currentIndex === undefined) {
      return;
    }

    const lu: LuckyUser = {
      beenLuckyAt: new Date(),
      user: users[currentIndex],
    };

    alert(lu.user.name);

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
          <li key={user.name} className="userlist-user">
            <HatenaUserChip user={user} />
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
          <HatenaUserIcon username={username} />
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
        <div className="small-description">
          <kbd aria-label="backspace" title="[Backspace]">
            ⌫
          </kbd>{" "}
          to remove last user /{" "}
          <kbd aria-label="enter" title="[Enter]">
            ↩
          </kbd>{" "}
          to add user
        </div>
      </div>
      {currentIndex !== undefined && (
        <>
          <div className="pixelated omikuji">
            <button onClick={hitLuckyUser} className="omikuji-button">
              <HatenaUserIcon username={users[currentIndex].name} size={256} />
            </button>
          </div>
          <div className="click-to-assign">CLICK TO ASSIGN</div>
        </>
      )}
      <div className="lucky-users">
        {luckyUsers.map((lu, i) => (
          <div key={i} className="lucky-user-line">
            {lu.beenLuckyAt.toISOString()}: <HatenaUserChip user={lu.user} />
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
          <HatenaUserChip user={{ name: "hitode909" }} />
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

const HatenaUserChip: React.FC<{ readonly user: User }> = ({ user }) => (
  <span>
    <HatenaUserIcon username={user.name} /> id:{user.name}
  </span>
);

const HatenaUserIcon: React.FC<{
  readonly username: string;
  readonly size?: number;
}> = ({ username, size = 16 }) =>
  username === "" ? (
    <img width={size} height={size} alt="" />
  ) : (
    <img
      src={`https://cdn.profile-image.st-hatena.com/users/${username}/profile_256x256.png`}
      alt=""
      width={size}
      height={size}
    />
  );

export default App;
