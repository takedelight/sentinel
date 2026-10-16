import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("Home", () => {
  it("рендерит заглушку страницы без ошибок", () => {
    const { container } = render(<Home />);
    expect(container.innerHTML).toBe("");
  });
});
