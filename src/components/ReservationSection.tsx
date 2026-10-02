import { useState, type FormEvent } from "react";
import { Phone } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { Reveal } from "./Reveal";

type Errors = Partial<Record<"name" | "phone" | "date" | "time", string>>;

// Fields previously used `outline-none`, which (Tailwind v4) also sets
// `--tw-outline-style: none` on the element — that silently cancelled any
// focus-visible outline. It's gone: keyboard focus now shows a clearly
// visible 2px brass outline (offset 4px) via the focus-visible utilities,
// while pointer focus keeps the brass bottom-border cue.
const fieldClass =
  "w-full border-b border-input bg-transparent px-0 py-3 text-[0.95rem] text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
const labelClass =
  "block font-mono text-[0.62rem] tracking-[0.24em] text-muted-foreground uppercase";

// ----------------------------------------------------------------------------
// RESERVATIONS — the intake form, as an iron document panel. Validation and
// behavior are unchanged from the original; only the visual system moved to
// charcoal/steel/brass (cell-plate labels, riveted panel, gate copy).
// ----------------------------------------------------------------------------
export function ReservationSection() {
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^[+\d][\d\s-]{7,}$/.test(phone)) next.phone = "Enter a valid phone number.";
    if (!data.get("date")) next.date = "Choose a date.";
    if (!data.get("time")) next.time = "Choose a time.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  return (
    <section
      id="reserve"
      className="relative scroll-mt-24 overflow-hidden border-t border-border bg-iron"
    >
      <div aria-hidden="true" className="bar-field absolute inset-0 opacity-30" />

      <div className="relative mx-auto grid max-w-[1400px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20 lg:py-32">
        <Reveal>
          <span className="cell-plate w-fit">Reservations</span>
          <h2 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl">
            Reserve <span className="italic text-primary">your cell</span>.
          </h2>
          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className={labelClass}>Address</dt>
              <dd className="mt-2 max-w-xs text-muted-foreground">{restaurant.address}</dd>
            </div>
            <div>
              <dt className={labelClass}>Phone</dt>
              <dd className="mt-2">
                <a href={restaurant.phoneHref} className="text-foreground hover:text-primary">
                  {restaurant.phone}
                </a>
              </dd>
            </div>
            {restaurant.email && (
              <div>
                <dt className={labelClass}>Email</dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${restaurant.email}`}
                    className="text-foreground hover:text-primary"
                  >
                    {restaurant.email}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Reveal>

        <Reveal delay={100}>
          {done ? (
            <div className="iron-panel flex min-h-[380px] flex-col items-center justify-center px-6 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-full border border-primary/50 text-primary">
                <Phone className="size-6" />
              </span>
              {/* The form does not submit anywhere yet — never imply that a
                  reservation was created. Honest handoff to the one channel
                  shown: the phone number in restaurant.ts. */}
              <h3 className="mt-7 font-display text-3xl">Your details are ready</h3>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Please call the restaurant to confirm your reservation.
              </p>
              <a
                href={restaurant.phoneHref}
                className="mt-6 inline-flex items-center gap-2 border border-primary px-6 py-3.5 text-[0.7rem] tracking-[0.2em] text-primary uppercase transition-colors duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                <Phone className="size-3.5" />
                {restaurant.phone}
              </a>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-7 border border-border px-6 py-3 text-[0.7rem] tracking-[0.2em] uppercase transition-colors hover:border-primary/60 hover:text-primary"
              >
                Start over
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              className="iron-panel rivets grid gap-8 p-6 sm:grid-cols-2 sm:p-9"
            >
              <div>
                <label className={labelClass} htmlFor="name">
                  Name
                </label>
                <input id="name" name="name" className={fieldClass} placeholder="Your full name" />
                {errors.name && <p className="mt-2 text-xs text-ember">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  inputMode="tel"
                  className={fieldClass}
                  placeholder="00000 000000"
                />
                {errors.phone && <p className="mt-2 text-xs text-ember">{errors.phone}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="date">
                  Date
                </label>
                <input id="date" name="date" type="date" className={fieldClass} />
                {errors.date && <p className="mt-2 text-xs text-ember">{errors.date}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="time">
                  Time
                </label>
                <input id="time" name="time" type="time" className={fieldClass} />
                {errors.time && <p className="mt-2 text-xs text-ember">{errors.time}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="guests">
                  Number of guests
                </label>
                <select
                  id="guests"
                  name="guests"
                  defaultValue="2"
                  className={`${fieldClass} [&>option]:bg-card`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="request">
                  Special request
                </label>
                <textarea
                  id="request"
                  name="request"
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  placeholder="Anniversary, dietary notes, seating preference…"
                />
              </div>
              <button
                type="submit"
                className="mt-2 border border-primary bg-primary px-8 py-4 text-[0.72rem] tracking-[0.24em] text-primary-foreground uppercase transition-colors duration-300 hover:bg-transparent hover:text-primary sm:col-span-2"
              >
                Request Reservation
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
