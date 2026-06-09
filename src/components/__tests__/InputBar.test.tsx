import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputBar } from "../InputBar";

describe("InputBar", () => {
  const mockSend = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("disables send when input is empty", () => {
    render(<InputBar onSend={mockSend} loading={false} />);
    const sendButton = screen.getByRole("button", { name: /发送/ });
    expect(sendButton).toBeDisabled();
  });

  it("disables controls while loading", async () => {
    render(<InputBar onSend={mockSend} loading={true} />);
    const input = screen.getByPlaceholderText("讲述你的梦境碎片…");
    await userEvent.type(input, "hello");
    const sendButton = screen.getByRole("button", { name: /发送/ });
    expect(sendButton).toBeDisabled();
    expect(input).toBeDisabled();
  });

  it("preserves text on send failure", async () => {
    mockSend.mockRejectedValue(new Error("fail"));
    render(<InputBar onSend={mockSend} loading={false} />);
    const input = screen.getByPlaceholderText("讲述你的梦境碎片…");
    await userEvent.type(input, "my dream");
    const sendButton = screen.getByRole("button", { name: /发送/ });
    await userEvent.click(sendButton);
    expect(input).toHaveValue("my dream");
  });

  it("calls onSend with text when submitted", async () => {
    mockSend.mockResolvedValue(undefined);
    render(<InputBar onSend={mockSend} loading={false} />);
    const input = screen.getByPlaceholderText("讲述你的梦境碎片…");
    await userEvent.type(input, "my dream");
    const sendButton = screen.getByRole("button", { name: /发送/ });
    await userEvent.click(sendButton);
    expect(mockSend).toHaveBeenCalledWith("my dream", "text");
  });
});
