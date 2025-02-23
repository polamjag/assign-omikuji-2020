import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { LuckyUser, setUsersToLocationHash, User } from "./users";

export function App({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<Array<User>>(initialUsers);
  const [luckyUsers, setLuckyUsers] = useState<Array<LuckyUser>>([]);

  const [isShowingLatestLuckyUser, setIsShowingLatestLuckyUser] =
    useState<boolean>(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setUsersToLocationHash(users);
  }, [users]);

  const hitLuckyUser = (user: User): void => {
    const lu: LuckyUser = {
      beenLuckyAt: new Date(),
      user,
    };
    setLuckyUsers([lu, ...luckyUsers]);

    setIsShowingLatestLuckyUser(true);
    dialogRef.current?.showModal();
  };

  const removeUserAt = (idx: number): void => {
    users.splice(idx, 1);
    setUsers([...users]);
  };

  const onAddUserByName = (name: string): void => {
    setUsers([...users, { name }]);
  };
  const requestRemoveLastUser = (): void => {
    removeUserAt(users.length - 1);
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
      <AddForm
        onAddUserByName={onAddUserByName}
        requestRemoveLastUser={requestRemoveLastUser}
      />
      <IconOmikujiSlot
        users={users}
        onSelectUser={hitLuckyUser}
        isPaused={isShowingLatestLuckyUser}
      />
      <div className="lucky-users">
        {luckyUsers.length === 0 ? null : (
          <>
            <h3 className="lucky-users-heading">Assignation History</h3>
            {luckyUsers.map((lu, i) => (
              <div key={i} className="lucky-user-line">
                <HatenaUserChip user={lu.user} /> —{" "}
                <small>{lu.beenLuckyAt.toLocaleString()}</small>
              </div>
            ))}
          </>
        )}
      </div>
      <Footer />
      <dialog ref={dialogRef} className="latest-lucky-user-dialog">
        {luckyUsers.length > 0 ? (
          <>
            <h4 className="latest-lucky-user-dialog-heading">New assignee</h4>
            <div className="latest-lucky-user-dialog-icon">
              <HatenaUserIcon username={luckyUsers[0].user.name} size={256} />
            </div>
            <div>id:{luckyUsers[0].user.name}</div>
            <div className="latest-lucky-user-dialog-date">
              {luckyUsers[0].beenLuckyAt.toLocaleString()}
            </div>
          </>
        ) : null}
        <button
          onClick={() => {
            dialogRef.current?.close();
            setIsShowingLatestLuckyUser(false);
          }}
          className="latest-lucky-user-dialog-ok-btn"
        >
          OK
        </button>
      </dialog>
    </div>
  );
}

export const AddForm: React.FC<{
  onAddUserByName: (name: string) => void;
  requestRemoveLastUser: () => void;
}> = ({ onAddUserByName, requestRemoveLastUser }) => {
  const [username, setUsername] = useState<string>("");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.currentTarget.value);
  };
  const onClick = (): void => {
    if (username === "") {
      return;
    }
    onAddUserByName(username.trim());
    setUsername("");
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onClick();
    } else if (event.key === "Backspace" && username === "") {
      requestRemoveLastUser();
    }
  };

  return (
    <div className="add-form">
      <span>
        <HatenaUserIcon username={username.trim()} />
        <input
          onKeyDown={handleKeyDown}
          onChange={onChange}
          value={username}
          placeholder="Hatena ID"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          autoComplete="off"
        />
        <button onClick={onClick} type="button">
          Add user
        </button>
      </span>
      <div className="small-description">
        Hint: <kbd>Enter</kbd> to add user / <kbd>Backspace</kbd> to remove last
        user
      </div>
    </div>
  );
};

export const IconOmikujiSlot: React.FC<{
  readonly users: User[];
  onSelectUser: (user: User) => void;
  isPaused: boolean;
}> = ({ users, onSelectUser, isPaused }) => {
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    undefined
  );

  const requestRef = React.useRef<number | undefined>(undefined);

  const animate = useCallback(() => {
    if (isPaused) {
      return;
    }

    if (users.length > 0) {
      const idx = Math.floor(Math.random() * users.length);
      setCurrentIndex(idx);
    } else {
      setCurrentIndex(undefined);
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [users, isPaused]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [users, currentIndex, animate]);

  return currentIndex !== undefined && users[currentIndex] ? (
    <>
      <div className="pixelated omikuji">
        <button
          onClick={() => onSelectUser(users[currentIndex])}
          className="omikuji-button"
          data-testid="omikuji-button"
        >
          <HatenaUserIcon username={users[currentIndex].name} size={256} />
        </button>
      </div>
      <div className="click-to-assign">CLICK TO ASSIGN</div>
    </>
  ) : null;
};

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
    <img
      width={size}
      height={size}
      alt=""
      src="data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
      className="hatena-user-icon hatena-user-icon-empty"
    />
  ) : (
    <img
      src={`https://cdn.profile-image.st-hatena.com/users/${username}/profile_256x256.png`}
      alt=""
      width={size}
      height={size}
      className="hatena-user-icon hatena-user-icon-nonempty"
    />
  );

const Footer = () => (
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
);
