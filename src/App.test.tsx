import React, { act } from "react";
import {
  fireEvent,
  getByPlaceholderText,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App, AddForm, IconOmikujiSlot } from "./App";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  vitest,
} from "vitest";

let container: HTMLElement;

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

test("renders heading", () => {
  const { getByText } = render(<App initialUsers={[]} />);
  const headingElement = getByText(/Assign Omikuji 2020/i);
  expect(headingElement).toBeInTheDocument();
});

test("renders user list", () => {
  const { getByText } = render(
    <App initialUsers={[{ name: "Alice" }, { name: "Bob" }]} />
  );
  const aliceElement = getByText(/Alice/i);
  const bobElement = getByText(/Bob/i);
  expect(aliceElement).toBeInTheDocument();
  expect(bobElement).toBeInTheDocument();
});

test("removes user when clicking remove button", () => {
  const { getByText, queryByText, getAllByRole } = render(
    <App initialUsers={[{ name: "Alice" }, { name: "Bob" }]} />
  );
  
  const removeButtons = getAllByRole("button", { name: "Remove this user" });
  expect(removeButtons).toHaveLength(2);
  
  fireEvent.click(removeButtons[0]);
  
  expect(queryByText(/id:Alice/i)).not.toBeInTheDocument();
  expect(getByText(/id:Bob/i)).toBeInTheDocument();
});

test("adds user through AddForm", () => {
  render(<App initialUsers={[{ name: "Alice" }]} />);
  
  const input = screen.getByPlaceholderText("Hatena ID");
  fireEvent.change(input, { target: { value: "NewUser" } });
  
  const addButton = screen.getByText("Add user");
  fireEvent.click(addButton);
  
  expect(screen.getByText(/id:NewUser/i)).toBeInTheDocument();
  expect(screen.getByText(/id:Alice/i)).toBeInTheDocument();
});

test("does not add empty username", () => {
  render(<App initialUsers={[{ name: "Alice" }]} />);
  
  const input = screen.getByPlaceholderText("Hatena ID");
  const addButton = screen.getByText("Add user");
  
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.click(addButton);
  
  const userList = screen.getByRole("list", { className: "userlist" });
  expect(userList.children).toHaveLength(1);
});

test("trims username before adding", () => {
  render(<App initialUsers={[]} />);
  
  const input = screen.getByPlaceholderText("Hatena ID");
  fireEvent.change(input, { target: { value: "  TrimmedUser  " } });
  
  const addButton = screen.getByText("Add user");
  fireEvent.click(addButton);
  
  expect(screen.getByText(/id:TrimmedUser/i)).toBeInTheDocument();
});

test("shows dialog when omikuji is clicked", () => {
  vitest.useFakeTimers();
  
  const { container: testContainer } = render(<App initialUsers={[{ name: "Alice" }]} />);
  container = testContainer;
  
  vitest.advanceTimersToNextFrame();
  
  const omikujiButton = screen.getByTestId("omikuji-button");
  fireEvent.click(omikujiButton);
  
  const dialog = testContainer.querySelector("dialog");
  expect(dialog).toBeInTheDocument();
  expect(dialog).toHaveClass("latest-lucky-user-dialog");
  
  vitest.useRealTimers();
});

test("shows assignment history after omikuji click", () => {
  vitest.useFakeTimers();
  
  render(<App initialUsers={[{ name: "Alice" }]} />);
  
  vitest.advanceTimersToNextFrame();
  
  const omikujiButton = screen.getByTestId("omikuji-button");
  fireEvent.click(omikujiButton);
  
  expect(screen.getByText(/Assignation History/i)).toBeInTheDocument();
  
  vitest.useRealTimers();
});

test("closes dialog when OK button is clicked", () => {
  vitest.useFakeTimers();
  
  const { container: testContainer } = render(<App initialUsers={[{ name: "Alice" }]} />);
  container = testContainer;
  
  vitest.advanceTimersToNextFrame();
  
  const omikujiButton = screen.getByTestId("omikuji-button");
  fireEvent.click(omikujiButton);
  
  const okButton = screen.getByText("OK");
  fireEvent.click(okButton);
  
  const dialog = testContainer.querySelector("dialog");
  expect(dialog).not.toHaveAttribute("open");
  
  vitest.useRealTimers();
});

test("updates URL hash when users change", () => {
  render(<App initialUsers={[{ name: "Alice" }]} />);
  
  const input = screen.getByPlaceholderText("Hatena ID");
  fireEvent.change(input, { target: { value: "Bob" } });
  
  const addButton = screen.getByText("Add user");
  fireEvent.click(addButton);
  
  expect(global.location.hash).toBe("#Alice,Bob");
});

test("syncs users from URL hash on hash change", () => {
  global.location.hash = "#User1,User2";
  
  render(<App initialUsers={[]} />);
  
  act(() => {
    window.dispatchEvent(new Event("hashchange"));
  });
  
  waitFor(() => {
    expect(screen.getByText(/id:User1/i)).toBeInTheDocument();
    expect(screen.getByText(/id:User2/i)).toBeInTheDocument();
  });
});

test("renders Footer component", () => {
  render(<App initialUsers={[]} />);
  
  expect(screen.getByText(/Heavily inspired by/i)).toBeInTheDocument();
  expect(screen.getByText(/polamjag\/assign-omikuji-2020/i)).toBeInTheDocument();
});

describe("AddForm", () => {
  test("renders add form", () => {
    const onAddUserByName = vitest.fn();
    const requestRemoveLastUser = vitest.fn();

    const { container, getByText } = render(
      <AddForm
        onAddUserByName={onAddUserByName}
        requestRemoveLastUser={requestRemoveLastUser}
      />
    );
    const addFormElement = getByText(/Add user/);
    expect(addFormElement).toBeInTheDocument();
    addFormElement.click();

    const inputElement = getByPlaceholderText(container, "Hatena ID");
    fireEvent.change(inputElement, { target: { value: "Charlie" } });
    fireEvent.keyDown(inputElement, { key: "Enter", code: "Enter" });

    expect((inputElement as HTMLInputElement).value).toBe("");

    expect(onAddUserByName).toHaveBeenCalledWith("Charlie");

    fireEvent.keyDown(inputElement, { key: "Backspace", code: "Backspace" });
    expect(requestRemoveLastUser).toHaveBeenCalled();
  });

  test("does not call onAddUserByName when input is empty", () => {
    const onAddUserByName = vitest.fn();
    const requestRemoveLastUser = vitest.fn();

    const { container, getByText } = render(
      <AddForm
        onAddUserByName={onAddUserByName}
        requestRemoveLastUser={requestRemoveLastUser}
      />
    );

    const inputElement = getByPlaceholderText(container, "Hatena ID");
    fireEvent.keyDown(inputElement, { key: "Enter", code: "Enter" });

    expect(onAddUserByName).not.toHaveBeenCalled();
  });

  test("trims username on Enter key", () => {
    const onAddUserByName = vitest.fn();
    const requestRemoveLastUser = vitest.fn();

    const { container, getByText } = render(
      <AddForm
        onAddUserByName={onAddUserByName}
        requestRemoveLastUser={requestRemoveLastUser}
      />
    );

    const inputElement = getByPlaceholderText(container, "Hatena ID");
    fireEvent.change(inputElement, { target: { value: "  SpacedUser  " } });
    fireEvent.keyDown(inputElement, { key: "Enter", code: "Enter" });

    expect(onAddUserByName).toHaveBeenCalledWith("SpacedUser");
  });
});

describe("IconOmikujiSlot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders icon omikuji slot", () => {
    const users = [{ name: "Alice" }, { name: "Bob" }];
    const onSelectUser = vitest.fn();

    const { getByTestId } = render(
      <IconOmikujiSlot
        users={users}
        onSelectUser={onSelectUser}
        isPaused={false}
      />
    );

    vitest.advanceTimersToNextFrame()

    const buttonElement = getByTestId("omikuji-button");
    expect(buttonElement).toBeInTheDocument();

    fireEvent.click(buttonElement);
    expect(onSelectUser).toHaveBeenCalledWith(users[0]);
  });

  test("renders null when users list is empty", () => {
    const onSelectUser = vitest.fn();

    const { container, queryByTestId } = render(
      <IconOmikujiSlot
        users={[]}
        onSelectUser={onSelectUser}
        isPaused={false}
      />
    );

    expect(queryByTestId("omikuji-button")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  test("does not call onSelectUser when currentIndex is undefined", () => {
    const onSelectUser = vitest.fn();

    const { getByTestId } = render(
      <IconOmikujiSlot
        users={[{ name: "Alice" }]}
        onSelectUser={onSelectUser}
        isPaused={false}
      />
    );

    vitest.advanceTimersToNextFrame();

    const buttonElement = getByTestId("omikuji-button");
    fireEvent.click(buttonElement);
    
    expect(onSelectUser).toHaveBeenCalled();
  });
});
