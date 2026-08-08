"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, m } from "motion/react";
import { useRef, useState, useTransition } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { submitRsvp, type SubmitResult } from "@/app/actions";
import { emptyRsvp, rsvpSchema, type RsvpFormValues } from "@/lib/schema";
import { ProgressMascot } from "@/components/rsvp/progress-mascot";
import { Success } from "@/components/rsvp/success";
import { BackButton, PrimaryButton } from "@/components/rsvp/ui";
import {
  AdultsStep,
  AttendingStep,
  ChildrenStep,
  ConsentStep,
  FamilyStep,
  StayingStep,
  TeamStep,
  WishStep,
} from "@/components/rsvp/steps";

/**
 * One question per screen.
 *
 * Guests who decline take a three-question path instead of eight — asking a
 * family who can't come how many party bags they need would be daft.
 */

type StepId =
  | "attending"
  | "family"
  | "adults"
  | "children"
  | "staying"
  | "team"
  | "wish"
  | "consent";

const ATTEND_STEPS: StepId[] = [
  "attending",
  "family",
  "adults",
  "children",
  "staying",
  "team",
  "wish",
  "consent",
];

const DECLINE_STEPS: StepId[] = ["attending", "family", "wish"];

/** Which fields must be valid before a step will let you move on. */
const STEP_FIELDS: Record<StepId, FieldPath<RsvpFormValues>[]> = {
  attending: [],
  family: ["familyName", "contact"],
  adults: ["adultsCount"],
  children: ["children"],
  staying: ["emergencyPhone"],
  team: [],
  wish: ["wish"],
  consent: [],
};

export function RsvpFlow() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [result, setResult] = useState<Extract<SubmitResult, { ok: true }> | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: emptyRsvp,
    mode: "onTouched",
  });

  const attending = form.watch("attending");
  const steps = attending ? ATTEND_STEPS : DECLINE_STEPS;
  const clampedIndex = Math.min(index, steps.length - 1);
  const step = steps[clampedIndex];
  const isLast = clampedIndex === steps.length - 1;

  /** Keep the current question in view when a step changes height. */
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    if (isLast) {
      void handleSubmit();
      return;
    }

    setDirection(1);
    setIndex(clampedIndex + 1);
    scrollToTop();
  };

  const goBack = () => {
    setDirection(-1);
    setIndex(Math.max(0, clampedIndex - 1));
    scrollToTop();
  };

  const handleSubmit = () =>
    form.handleSubmit((values) => {
      setServerError(null);
      startTransition(async () => {
        const response = await submitRsvp(values);
        if (response.ok) {
          setResult(response);
          scrollToTop();
        } else {
          setServerError(response.error);
        }
      });
    })();

  if (result) {
    return (
      <div ref={topRef} className="scroll-mt-6">
        <Success result={result} />
      </div>
    );
  }

  const slide = {
    enter: { x: direction * 48, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: direction * -48, opacity: 0 },
  };

  return (
    <div ref={topRef} className="scroll-mt-6 rounded-3xl border border-white/12 bg-white/[0.04] p-5 sm:p-8">
      <ProgressMascot
        step={clampedIndex}
        total={steps.length}
        team={form.watch("team")}
      />

      {/* Honeypot: invisible to guests, irresistible to bots. */}
      <input
        {...form.register("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={step}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === "attending" ? (
            <AttendingStep
              form={form}
              onPick={() => {
                setDirection(1);
                setIndex(1);
              }}
            />
          ) : null}
          {step === "family" ? <FamilyStep form={form} /> : null}
          {step === "adults" ? <AdultsStep form={form} /> : null}
          {step === "children" ? <ChildrenStep form={form} /> : null}
          {step === "staying" ? <StayingStep form={form} /> : null}
          {step === "team" ? <TeamStep form={form} /> : null}
          {step === "wish" ? <WishStep form={form} /> : null}
          {step === "consent" ? <ConsentStep form={form} /> : null}
        </m.div>
      </AnimatePresence>

      {serverError ? (
        <p className="mt-5 text-center font-body text-sm text-tab-pink" role="alert">
          {serverError}
        </p>
      ) : null}

      <div className="mt-8 space-y-3">
        {step === "attending" ? null : (
          <PrimaryButton onClick={goNext} disabled={pending}>
            {pending ? "Sending…" : isLast ? "Send our RSVP 🎉" : "Next"}
          </PrimaryButton>
        )}
        {clampedIndex > 0 ? (
          <div className="text-center">
            <BackButton onClick={goBack} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
