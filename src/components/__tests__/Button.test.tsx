import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders primary button with label", () => {
    render(<Button variant="primary">进入梦境</Button>);
    expect(screen.getByRole("button", { name: "进入梦境" })).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button variant="primary" disabled>进入梦境</Button>);
    expect(screen.getByRole("button", { name: "进入梦境" })).toBeDisabled();
  });

  it("has aria-busy when loading", () => {
    render(<Button variant="primary" loading>进入梦境</Button>);
    expect(screen.getByRole("button", { name: "进入梦境" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button variant="primary" onClick={handleClick}>进入梦境</Button>);
    await userEvent.click(screen.getByRole("button", { name: "进入梦境" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
