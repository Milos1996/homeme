import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InquiryForm } from "./inquiry-form";

const LABEL = "Apartment 0.01 · Linden Court";

describe("InquiryForm", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("pre-fills the apartment and says it is a demo", () => {
    render(<InquiryForm apartmentLabel={LABEL} />);
    expect(screen.getByLabelText("Apartment")).toHaveValue(LABEL);
    expect(screen.getByLabelText("Apartment")).toHaveAttribute("readonly");
    expect(screen.getByText("Demo form: nothing you enter is sent or stored.")).toBeInTheDocument();
  });

  it("shows inline errors on submit, focuses the first one, and clears them as fields are fixed", async () => {
    const user = userEvent.setup();
    render(<InquiryForm apartmentLabel={LABEL} />);

    await user.click(screen.getByRole("button", { name: "Send inquiry" }));
    const name = screen.getByLabelText("Name");
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Please enter your name.");
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Please enter a valid email address.",
    );
    expect(screen.getByLabelText(/Phone/)).not.toHaveAttribute("aria-invalid");

    await user.type(name, "Ana");
    expect(name).not.toHaveAttribute("aria-invalid");

    await user.type(screen.getByLabelText(/Phone/), "abc");
    expect(screen.getByLabelText(/Phone/)).toHaveAccessibleDescription(
      "Please enter a valid phone number, or leave it empty.",
    );
  });

  it("shows a success state on a valid submit without making any network request", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    render(<InquiryForm apartmentLabel={LABEL} />);

    await user.type(screen.getByLabelText("Name"), "Ana");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Message"), "I'd like to arrange a viewing.");
    await user.keyboard("{Enter}");
    // Enter in a textarea adds a newline; submit with the button instead.
    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    const success = await screen.findByTestId("inquiry-success");
    expect(success).toHaveTextContent("Thank you, Ana.");
    expect(success).toHaveTextContent("nothing was sent or stored");
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Write another inquiry" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("can be completed with the keyboard alone", async () => {
    const user = userEvent.setup();
    render(<InquiryForm apartmentLabel={LABEL} />);

    await user.tab(); // apartment (read-only)
    await user.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();
    await user.keyboard("Ana");
    await user.tab();
    await user.keyboard("ana@example.com");
    await user.tab(); // phone
    await user.tab();
    await user.keyboard("Please call me about a viewing.");
    await user.tab();
    expect(screen.getByRole("button", { name: "Send inquiry" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findByTestId("inquiry-success")).toBeInTheDocument();
  });
});
