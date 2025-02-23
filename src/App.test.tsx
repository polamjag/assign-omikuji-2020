import React from "react";
import {
  fireEvent,
  getByPlaceholderText,
  render,
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
});

describe("IconOmikujiSlot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
});
