"use client";

import { AnimatePresence, m } from "motion/react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { CELEBRANT_LIST, CHILD_AGE } from "@/config/event";
import { emptyChild, type RsvpFormValues } from "@/lib/schema";
import { avatarById } from "@/lib/types";
import {
  BigChoice,
  Field,
  StickerPicker,
  Stepper,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/rsvp/ui";

export type Form = UseFormReturn<RsvpFormValues>;

export function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-center font-display text-2xl font-bold text-cream sm:text-3xl">
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-2 text-center font-body text-sm text-cream/60">{subtitle}</p>
      ) : null}
      <div className="mt-7 space-y-4">{children}</div>
    </div>
  );
}

export function AttendingStep({ form, onPick }: { form: Form; onPick: () => void }) {
  const attending = form.watch("attending");
  const choose = (value: boolean) => {
    form.setValue("attending", value);
    onPick();
  };

  return (
    <StepShell title="Can you make it?" subtitle="One party, two birthdays.">
      <BigChoice
        emoji="🎉"
        label="Yes, we'll be there!"
        sublabel="Count us in"
        selected={attending}
        onSelect={() => choose(true)}
      />
      <BigChoice
        emoji="💛"
        label="Sorry, we can't"
        sublabel="We'll be thinking of you"
        selected={!attending}
        onSelect={() => choose(false)}
      />
    </StepShell>
  );
}

export function FamilyStep({ form }: { form: Form }) {
  const { errors } = form.formState;

  return (
    <StepShell title="Who shall we expect?" subtitle="So we know who's at the door.">
      <Field label="Your name or family name" error={errors.familyName?.message}>
        <input
          {...form.register("familyName")}
          className={inputClass}
          placeholder="The Okafor Family"
          autoComplete="name"
          enterKeyHint="next"
        />
      </Field>

      <Field
        label="Phone or email"
        hint="We'll only use this to send your pass and party updates."
        error={errors.contact?.message}
      >
        <input
          {...form.register("contact")}
          className={inputClass}
          placeholder="+234 803 000 0000"
          inputMode="text"
          autoComplete="tel"
          enterKeyHint="next"
        />
      </Field>
    </StepShell>
  );
}

export function AdultsStep({ form }: { form: Form }) {
  const value = form.watch("adultsCount");

  return (
    <StepShell
      title="How many grown-ups?"
      subtitle="Including yourself."
    >
      <div className="py-4">
        <Stepper
          value={value}
          onChange={(next) => form.setValue("adultsCount", next)}
          label="adult"
          max={12}
        />
      </div>
      {form.formState.errors.adultsCount ? (
        <p className="text-center font-body text-sm text-tab-pink" role="alert">
          {form.formState.errors.adultsCount.message}
        </p>
      ) : null}
    </StepShell>
  );
}

export function ChildrenStep({ form }: { form: Form }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });
  const errors = form.formState.errors.children;

  return (
    <StepShell
      title="And the children?"
      subtitle="Names help us make their party bag and name tag."
    >
      <AnimatePresence initial={false}>
        {fields.map((field, index) => (
          <m.div
            key={field.id}
            layout={false}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="rounded-3xl border border-white/12 bg-white/5 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-base font-semibold text-gold">
                Child {index + 1}{" "}
                <span aria-hidden="true">
                  {avatarById(form.watch(`children.${index}.avatar`)).emoji}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="min-h-11 px-2 font-body text-sm text-cream/50 underline underline-offset-4"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Field label="Name" error={errors?.[index]?.name?.message}>
                    <input
                      {...form.register(`children.${index}.name`)}
                      className={inputClass}
                      placeholder="Ada"
                      autoComplete="off"
                    />
                  </Field>
                </div>
                <div className="w-24">
                  <Field label="Age">
                    <select
                      {...form.register(`children.${index}.age`, { valueAsNumber: true })}
                      className={`${selectClass} w-full`}
                    >
                      {Array.from(
                        { length: CHILD_AGE.max - CHILD_AGE.min + 1 },
                        (_, i) => CHILD_AGE.min + i,
                      ).map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <Field
                label="Allergies or food notes"
                hint="Leave blank if none. This goes straight to the kitchen."
                error={errors?.[index]?.allergies?.message}
              >
                <input
                  {...form.register(`children.${index}.allergies`)}
                  className={inputClass}
                  placeholder="Peanuts"
                  autoComplete="off"
                />
              </Field>

              <Field label="Pick a sticker">
                <StickerPicker
                  value={form.watch(`children.${index}.avatar`)}
                  onChange={(id) =>
                    form.setValue(`children.${index}.avatar`, id, { shouldDirty: true })
                  }
                />
              </Field>
            </div>
          </m.div>
        ))}
      </AnimatePresence>

      <m.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => append({ ...emptyChild })}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gold/40 font-display text-base font-semibold text-gold"
      >
        <span aria-hidden="true">＋</span>
        {fields.length === 0 ? "Add a child" : "Add another child"}
      </m.button>

      {fields.length === 0 ? (
        <p className="text-center font-body text-sm text-cream/50">
          No children coming? Just carry on.
        </p>
      ) : null}
    </StepShell>
  );
}

export function StayingStep({ form }: { form: Form }) {
  const staying = form.watch("staying");

  return (
    <StepShell
      title="Staying or dropping off?"
      subtitle="Either is completely fine — we just need to know."
    >
      <BigChoice
        emoji="🫖"
        label="We're staying"
        sublabel="Grown-ups at the party too"
        selected={staying}
        onSelect={() => form.setValue("staying", true)}
      />
      <BigChoice
        emoji="👋"
        label="Dropping off"
        sublabel="We'll be back at pick-up"
        selected={!staying}
        onSelect={() => form.setValue("staying", false)}
      />

      <Field
        label={staying ? "Mobile number (optional)" : "Number to reach you on"}
        hint="In case we need you during the party."
        error={form.formState.errors.emergencyPhone?.message}
      >
        <input
          {...form.register("emergencyPhone")}
          className={inputClass}
          placeholder="+234 803 000 0000"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>
    </StepShell>
  );
}

export function TeamStep({ form }: { form: Form }) {
  const team = form.watch("team");

  return (
    <StepShell
      title="Pick your team"
      subtitle="Just for the party games. No wrong answers!"
    >
      {CELEBRANT_LIST.map((celebrant) => (
        <BigChoice
          key={celebrant.id}
          emoji={celebrant.id === "tabitha" ? "🦄" : "🚀"}
          label={celebrant.team}
          sublabel={`Turning ${celebrant.turning}`}
          selected={team === celebrant.id}
          onSelect={() => form.setValue("team", celebrant.id)}
        />
      ))}
    </StepShell>
  );
}

export function WishStep({ form }: { form: Form }) {
  const wish = form.watch("wish");

  return (
    <StepShell
      title="Leave a birthday wish"
      subtitle="We'll show these on the big screen at the party."
    >
      <Field label="Your message" error={form.formState.errors.wish?.message}>
        <textarea
          {...form.register("wish")}
          className={textareaClass}
          placeholder="Happy birthday Tabitha and Abraham! We can't wait to celebrate with you."
          maxLength={300}
        />
      </Field>
      <p className="text-right font-body text-xs text-cream/40">
        {wish.length}/300
      </p>
    </StepShell>
  );
}

export function ConsentStep({ form }: { form: Form }) {
  const consent = form.watch("photoConsent");

  return (
    <StepShell
      title="One last thing"
      subtitle="There'll be a photographer and plenty of phones about."
    >
      <BigChoice
        emoji="📸"
        label="Photos are fine"
        sublabel="Happy for pictures of my children to be shared"
        selected={consent}
        onSelect={() => form.setValue("photoConsent", true)}
      />
      <BigChoice
        emoji="🙅"
        label="Please don't share photos"
        sublabel="We'll keep your children out of anything posted"
        selected={!consent}
        onSelect={() => form.setValue("photoConsent", false)}
      />

      <Field label="Anything else we should know?" hint="Optional.">
        <input
          {...form.register("notes")}
          className={inputClass}
          placeholder="Collecting at 6pm sharp"
          autoComplete="off"
        />
      </Field>
    </StepShell>
  );
}
