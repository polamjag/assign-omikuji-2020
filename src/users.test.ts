import { describe, it, expect } from "vitest";
import { getUsersFromLocationHash, setUsersToLocationHash } from "./users";

describe("getUsersFromLocationHash", () => {
  it("returns empty array when location.hash is empty", () => {
    global.location.hash = "";
    const result = getUsersFromLocationHash();
    expect(result).toEqual([]);
  });

  it("returns a list of users when location.hash is not empty", () => {
    global.location.hash = "#Alice,Bob,Charlie";
    const result = getUsersFromLocationHash();
    expect(result).toEqual([
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" },
    ]);
  });
});

describe("setUsersToLocationHash", () => {
  it("sets location.hash to a list of user names", () => {
    const users = [
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" },
    ];
    setUsersToLocationHash(users);
    expect(global.location.hash).toBe("#Alice,Bob,Charlie");
  });

  it("sets location.hash to an empty string when users is an empty array", () => {
    setUsersToLocationHash([]);
    expect(global.location.hash).toBe("");
  });
});
