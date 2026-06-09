import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LaunchForm } from "../LaunchForm";
import * as storage from "@/lib/dreamer-storage";
import * as api from "@/lib/client-api";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/dreamer-storage", () => ({
  saveCurrentDreamer: vi.fn(),
  loadCurrentDreamer: vi.fn(),
  clearCurrentDreamer: vi.fn(),
}));

vi.mock("@/lib/client-api", () => ({
  getOrCreateDreamer: vi.fn(),
  runDreamAgent: vi.fn(),
  saveDream: vi.fn(),
  listDreams: vi.fn(),
  getDreamDetail: vi.fn(),
}));

describe("LaunchForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(storage.loadCurrentDreamer).mockReturnValue(null);
    pushMock.mockClear();
  });

  it("shows product name and mood line", () => {
    render(<LaunchForm />);
    expect(screen.getByText("巡梦")).toBeInTheDocument();
    expect(
      screen.getByText("把梦境碎片温柔拼回来")
    ).toBeInTheDocument();
  });

  it("disables enter button when name is empty", () => {
    render(<LaunchForm />);
    const button = screen.getByRole("button", { name: /进入梦境/ });
    expect(button).toBeDisabled();
  });

  it("shows validation error when name exceeds 24 characters", async () => {
    render(<LaunchForm />);
    const input = screen.getByPlaceholderText("你的名字");
    await userEvent.type(input, "a".repeat(25));
    expect(screen.getByText(/不超过24个字符/)).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /进入梦境/ });
    expect(button).toBeDisabled();
  });

  it("shows previous dreamer affordance when stored", () => {
    vi.mocked(storage.loadCurrentDreamer).mockReturnValue({
      id: "d1",
      name: "阿梦",
    });
    render(<LaunchForm />);
    expect(screen.getByText(/继续以 阿梦 进入/)).toBeInTheDocument();
  });

  it("calls API and navigates on valid submit", async () => {
    vi.mocked(api.getOrCreateDreamer).mockResolvedValue({
      ok: true,
      data: { id: "d1", name: "阿梦" },
    });

    render(<LaunchForm />);
    const input = screen.getByPlaceholderText("你的名字");
    await userEvent.type(input, "阿梦");
    const button = screen.getByRole("button", { name: /进入梦境/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(api.getOrCreateDreamer).toHaveBeenCalledWith("阿梦");
    });
    await waitFor(() => {
      expect(storage.saveCurrentDreamer).toHaveBeenCalledWith({
        id: "d1",
        name: "阿梦",
      });
    });
  });

  it("shows error when dreamer creation fails", async () => {
    vi.mocked(api.getOrCreateDreamer).mockResolvedValue({
      ok: false,
      error: { error: { code: "NETWORK_ERROR", message: "网络错误" } },
    });

    render(<LaunchForm />);
    const input = screen.getByPlaceholderText("你的名字");
    await userEvent.type(input, "阿梦");
    const button = screen.getByRole("button", { name: /进入梦境/ });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("网络错误")).toBeInTheDocument();
    });
  });
});
