export interface User {
  name: string;
}

export interface LuckyUser {
  readonly beenLuckyAt: Date;
  readonly user: User;
}

export const getUsersFromLocationHash = (): User[] => {
  /* eslint-disable no-restricted-globals */

  if (location.hash === "") {
    return [];
  }

  return location.hash
    .substr(1)
    .split(",")
    .map((name) => ({ name }));

  /* eslint-enable no-restricted-globals */
};

export const setUsersToLocationHash = (users: User[]): void => {
  // eslint-disable-next-line no-restricted-globals
  location.hash = users.map((u) => u.name).join(",");
};
