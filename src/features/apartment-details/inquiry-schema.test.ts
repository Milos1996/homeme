import { describe, expect, it } from "vitest";

import { validateInquiry } from "./inquiry-schema";

const valid = {
  name: "Ana Petrović",
  email: "ana@example.com",
  phone: "",
  message: "I'd like to arrange a viewing next week.",
};

describe("validateInquiry", () => {
  it("accepts a complete inquiry with or without a phone number", () => {
    expect(validateInquiry(valid)).toEqual({});
    expect(validateInquiry({ ...valid, phone: "+381 64 123 4567" })).toEqual({});
  });

  it("explains each problem in plain language", () => {
    expect(validateInquiry({ name: " ", email: "nope", phone: "abc", message: "hi" })).toEqual({
      name: "Please enter your name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid phone number, or leave it empty.",
      message: "Please write a short message (at least 10 characters).",
    });
  });

  it("limits message length", () => {
    expect(validateInquiry({ ...valid, message: "x".repeat(1001) }).message).toMatch(/1,000/);
  });
});
