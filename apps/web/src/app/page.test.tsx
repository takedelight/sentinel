import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("рендерит кнопки из @sentinel/ui", () => {
    render(<Home />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
