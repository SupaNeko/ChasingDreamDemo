import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppTopBar } from "../AppTopBar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/dreamer-storage", () => ({
  clearCurrentDreamer: vi.fn(),
}));

describe("AppTopBar", () => {
  it("disables save button when canSave is false", () => {
    render(<AppTopBar dreamerName="阿梦" canSave={false} onSave={vi.fn()} />);
    const saveButton = screen.getByRole("button", { name: /保存梦境/ });
    expect(saveButton).toBeDisabled();
  });

  it("enables save button when canSave is true", () => {
    render(<AppTopBar dreamerName="阿梦" canSave={true} onSave={vi.fn()} />);
    const saveButton = screen.getByRole("button", { name: /保存梦境/ });
    expect(saveButton).toBeEnabled();
  });

  it("calls onSave when save button clicked", async () => {
    const onSave = vi.fn();
    render(<AppTopBar dreamerName="阿梦" canSave={true} onSave={onSave} />);
    const saveButton = screen.getByRole("button", { name: /保存梦境/ });
    await userEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
