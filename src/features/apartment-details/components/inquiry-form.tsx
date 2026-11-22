"use client";

import { CircleCheck } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryValues,
} from "../inquiry-schema";

interface InquiryFormProps {
  /** e.g. "Apartment 0.01 · Linden Court" */
  apartmentLabel: string;
}

const EMPTY: InquiryValues = { name: "", email: "", phone: "", message: "" };

/**
 * Demo inquiry form. Validates in the browser and shows a success state;
 * nothing is sent or stored anywhere.
 */
export function InquiryForm({ apartmentLabel }: InquiryFormProps) {
  const id = useId();
  const [values, setValues] = useState<InquiryValues>(EMPTY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const fields = useRef<Partial<Record<InquiryField, HTMLInputElement | HTMLTextAreaElement>>>({});
  const successRef = useRef<HTMLDivElement>(null);

  const update = (field: InquiryField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first submit attempt, re-validate as the visitor fixes things.
    if (submitted) setErrors(validateInquiry(next));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const found = validateInquiry(values);
    setErrors(found);
    const first = (Object.keys(EMPTY) as InquiryField[]).find((f) => found[f]);
    if (first) {
      fields.current[first]?.focus();
      return;
    }
    // Demo only: no request is made.
    setSent(true);
    toast.success("Inquiry ready to send", { description: "This is a demo, so nothing was sent." });
    requestAnimationFrame(() => successRef.current?.focus());
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setSubmitted(false);
    setSent(false);
  };

  if (sent) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        data-testid="inquiry-success"
        className="rounded-3xl bg-sage-100 p-8 outline-none"
      >
        <CircleCheck aria-hidden className="size-8 text-forest-700" />
        <p className="mt-4 font-display text-2xl">Thank you, {values.name.trim()}.</p>
        <p className="mt-2 text-muted-foreground">
          In a real listing, the sales team would reply to {values.email.trim()} about{" "}
          {apartmentLabel}. This is a demo, so nothing was sent or stored.
        </p>
        <Button variant="outline" className="mt-6 rounded-full" onClick={reset}>
          Write another inquiry
        </Button>
      </div>
    );
  }

  const field = (name: InquiryField) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    onChange: (e: { target: { value: string } }) => update(name, e.target.value),
  });

  const error = (name: InquiryField) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Inquiry" className="flex flex-col gap-5">
      <p className="rounded-2xl bg-stone-100 px-4 py-3 text-sm text-muted-foreground">
        Demo form: nothing you enter is sent or stored.
      </p>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-apartment`}>Apartment</Label>
        <Input
          id={`${id}-apartment`}
          value={apartmentLabel}
          readOnly
          className="h-10 bg-stone-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`}>Name</Label>
        <Input
          {...field("name")}
          ref={(el) => {
            if (el) fields.current.name = el;
          }}
          autoComplete="name"
          className="h-10"
        />
        {error("name")}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-email`}>Email</Label>
        <Input
          {...field("email")}
          ref={(el) => {
            if (el) fields.current.email = el;
          }}
          type="email"
          autoComplete="email"
          className="h-10"
        />
        {error("email")}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-phone`}>
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          {...field("phone")}
          ref={(el) => {
            if (el) fields.current.phone = el;
          }}
          type="tel"
          autoComplete="tel"
          className="h-10"
        />
        {error("phone")}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-message`}>Message</Label>
        <Textarea
          {...field("message")}
          ref={(el) => {
            if (el) fields.current.message = el;
          }}
          rows={5}
          placeholder="I'd like to arrange a viewing…"
        />
        {error("message")}
      </div>

      <Button type="submit" size="lg" className="rounded-full">
        Send inquiry
      </Button>
    </form>
  );
}
