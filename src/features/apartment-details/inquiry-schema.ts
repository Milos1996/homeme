import { z } from "zod";

/** Validation for the demo inquiry form. Messages are written for people, not developers. */
export const InquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().pipe(z.email("Please enter a valid email address.")),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^\+?[\d\s()-]{6,20}$/.test(v),
      "Please enter a valid phone number, or leave it empty.",
    ),
  message: z
    .string()
    .trim()
    .min(10, "Please write a short message (at least 10 characters).")
    .max(1000, "Please keep your message under 1,000 characters."),
});

export type InquiryValues = z.input<typeof InquirySchema>;
export type InquiryField = keyof InquiryValues;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

/** Validates the form and returns the first error per field (empty when valid). */
export function validateInquiry(values: InquiryValues): InquiryErrors {
  const result = InquirySchema.safeParse(values);
  if (result.success) return {};
  const errors: InquiryErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as InquiryField;
    errors[field] ??= issue.message;
  }
  return errors;
}
