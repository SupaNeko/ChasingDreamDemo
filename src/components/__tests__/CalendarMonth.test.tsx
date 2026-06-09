import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarMonth } from "../CalendarMonth";

describe("CalendarMonth", () => {
  const dreams = [
    { id: "1", title: "梦境A", dreamDate: "2026-06-05", primaryEmotion: "平静", createdAt: "2026-06-05T08:00:00Z" },
    { id: "2", title: "梦境B", dreamDate: "2026-06-05", primaryEmotion: "愉悦", createdAt: "2026-06-05T10:00:00Z" },
    { id: "3", title: "梦境C", dreamDate: "2026-06-12", primaryEmotion: "紧张", createdAt: "2026-06-12T08:00:00Z" },
  ];

  it("renders month grid and empty state", () => {
    render(<CalendarMonth dreams={[]} onSelectDate={vi.fn()} selectedDate={null} />);
    expect(screen.getByText(/还没有梦境记录/)).toBeInTheDocument();
  });

  it("shows dream count markers on dates with dreams", () => {
    render(<CalendarMonth dreams={dreams} onSelectDate={vi.fn()} selectedDate={null} />);
    const cell5 = screen.getByLabelText("2026-06-05 有2个梦境");
    expect(cell5).toBeInTheDocument();
  });

  it("calls onSelectDate when clicking a date with dreams", async () => {
    const handler = vi.fn();
    render(<CalendarMonth dreams={dreams} onSelectDate={handler} selectedDate={null} />);
    const cell5 = screen.getByLabelText("2026-06-05 有2个梦境");
    await userEvent.click(cell5);
    expect(handler).toHaveBeenCalledWith("2026-06-05");
  });

  it("does not call onSelectDate for empty dates", async () => {
    const handler = vi.fn();
    render(<CalendarMonth dreams={dreams} onSelectDate={handler} selectedDate={null} />);
    const emptyCell = screen.getByLabelText("2026-06-01");
    await userEvent.click(emptyCell);
    expect(handler).not.toHaveBeenCalled();
  });
});
