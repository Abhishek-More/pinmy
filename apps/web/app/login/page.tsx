"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/clients/auth-browser";
import { Typography } from "@/components/typography/Typography";
import { Input } from "@/components/ui/input";
import { CircleAlert } from "lucide-react";
import { Pin } from "@/components/pins/Pin";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";
import { useModalStore } from "@/lib/stores/useModalStore";

// ─── Demo pins for the stream ─────────────────────────────────────

const DEMO_PINS: PinWithSnippet[] = [
  {
    id: 1,
    uniqueId: "demo_1",
    title: "An update on recent Claude Code quality reports",
    link: "https://anthropic.com/engineering/april-23-postmortem",
    category: "Engineering",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    uniqueId: "demo_2",
    title: "Quantifying infrastructure noise in agentic coding evals.",
    link: "https://anthropic.com/engineering/infrastructure-noise",
    category: "Research",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    uniqueId: "demo_3",
    title: "Understanding Gleam \u2014 a friendly type-safe BEAM lang",
    link: "https://gleam.run/getting-started",
    category: "Education",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    uniqueId: "demo_4",
    title: "How they built it: Linear\u2019s command palette",
    link: "https://linear.app/blog/command-palette",
    category: "Design",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    uniqueId: "demo_5",
    title: "Ship a Postgres migration without downtime",
    link: "https://github.com/dripos/migrations-cookbook",
    category: "Engineering",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    uniqueId: "demo_7",
    title: "Halftone textures pack \u2014 free for personal use",
    link: "https://halftone.supply/packs/04",
    category: "Art",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    uniqueId: "demo_8",
    title: '@dhh \u2014 "the worst code I ever shipped"',
    link: "https://x.com/dhh/status/18294",
    category: "Personal",
    status: "DONE",
    platform: "web",
    userId: "",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Phone Input ──────────────────────────────────────────────────

function PhoneInput({
  onSendCode,
  onPhoneChange,
}: {
  onSendCode: (phone: string) => void;
  onPhoneChange?: (digits: string) => void;
}) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);

  const formatDisplay = (digits: string) => {
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSubmit = () => {
    if (phone.length !== 10) {
      setError(true);
      return;
    }
    setError(false);
    onSendCode(phone);
  };

  return (
    <div className="flex flex-col gap-3">
      <Typography variant="label" className="text-muted-foreground">
        PHONE NUMBER
      </Typography>
      <div
        className={`flex items-center border-2 bg-white ${error ? "border-red-500" : "border-black"}`}
      >
        <div className="border-r-2 border-black px-3 py-2">
          <Typography variant="p" className="text-sm font-medium">
            +1
          </Typography>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(555) 000-0000"
          value={formatDisplay(phone)}
          onChange={(e) => {
            const digits = e.target.value
              .replace(/\D/g, "")
              .replace(/^1/, "")
              .slice(0, 10);
            setPhone(digits);
            onPhoneChange?.(digits);
            if (error) setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base font-medium outline-none placeholder:text-gray-400"
        />
        {phone.length > 0 && (
          <button
            onClick={() => {
              setPhone("");
              setError(false);
            }}
            className="cursor-pointer px-3 py-2"
          >
            <CircleAlert className="h-4 w-4 text-amber-500" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────

function OtpInput({ onVerify }: { onVerify: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useState<(HTMLInputElement | null)[]>(
    [],
  )[1] as unknown as React.MutableRefObject<(HTMLInputElement | null)[]>;

  // Use a ref properly
  const refs = { current: new Array<HTMLInputElement | null>(6).fill(null) };

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");

    // iOS autofill pastes the full code into onChange
    if (cleaned.length > 1) {
      const code = cleaned.slice(0, 6);
      const next = Array(6).fill("");
      for (let i = 0; i < code.length; i++) next[i] = code[i];
      setDigits(next);
      refs.current[Math.min(code.length, 5)]?.focus();
      if (code.length === 6) onVerify(code);
      return;
    }

    if (!/^\d?$/.test(cleaned)) return;
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    const code = digits.join("");
    if (e.key === "Enter" && code.length === 6) onVerify(code);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const code = digits.join("");

  return (
    <div className="flex flex-col gap-3">
      <Typography variant="label" className="text-muted-foreground">
        VERIFICATION CODE
      </Typography>
      <div className="flex gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <Input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={i === 0 ? 6 : 1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-10 w-10 px-0 text-center text-base font-bold"
          />
        ))}
      </div>
      <button
        onClick={() => code.length === 6 && onVerify(code)}
        disabled={code.length < 6}
        className={`mt-1 w-full border-2 border-black py-3 text-xs font-bold tracking-wider uppercase ${
          code.length === 6
            ? "cursor-pointer bg-[#ffd800] hover:bg-[#e6c200]"
            : "cursor-not-allowed bg-gray-300 text-gray-500"
        }`}
      >
        Verify Code &rarr;
      </button>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const closeAll = useModalStore((s) => s.closeAll);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [phoneReady, setPhoneReady] = useState(false);

  const formatPhone = (input: string) =>
    `+1${input.replace(/\D/g, "").replace(/^1/, "")}`;

  const handleSendCode = (phoneInput: string) => {
    setPhone(phoneInput);
    setStep("otp");
    authClient.phoneNumber.sendOtp({
      phoneNumber: formatPhone(phoneInput),
    });
  };

  const handleVerify = async (code: string) => {
    const res = await authClient.phoneNumber.verify({
      phoneNumber: formatPhone(phone),
      code,
    });
    if (res.error) {
      setStep("phone");
      return;
    }
    closeAll();
    router.push("/");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* ── Left: Form (desktop) / Bottom sheet (mobile) ── */}
      <div className="order-2 flex shrink-0 flex-col border-t-[3px] border-black bg-[#f4f1e8] lg:order-1 lg:w-[420px] lg:w-[480px] lg:border-t-0 lg:border-r-[3px]">
        <div className="flex flex-1 flex-col px-6 py-8 lg:px-12 lg:pt-12">
          {/* Logo */}
          <div className="mb-1 flex items-baseline">
            <Typography variant="display" className="text-4xl lg:text-5xl">
              Pin
            </Typography>
            <Typography
              variant="display"
              as="span"
              className="border-2 border-black bg-[#ffd800] px-1 text-4xl lg:text-5xl"
            >
              My
            </Typography>
          </div>

          <div className="mb-auto" />

          {/* Sign-in tag */}
          <div className="mb-4 hidden w-fit items-center gap-1.5 border-2 border-black bg-black px-2 py-0.5 lg:inline-flex">
            <span className="text-[10px] text-white">&#9733;</span>
            <Typography variant="small" className="font-bold text-white">
              SIGN IN
            </Typography>
          </div>

          <Typography variant="muted" className="mt-2 mb-8">
            Enter your number &mdash; we&apos;ll send
            <br />a one-time code. No password needed.
          </Typography>

          {step === "phone" && (
            <>
              <PhoneInput
                onSendCode={handleSendCode}
                onPhoneChange={(d) => setPhoneReady(d.length === 10)}
              />
              <div className="brutal-shadow-accent-wrapper mt-4">
                <button
                  onClick={() => {
                    const input =
                      document.querySelector<HTMLInputElement>(
                        'input[type="tel"]',
                      );
                    const digits =
                      input?.value.replace(/\D/g, "").replace(/^1/, "") ?? "";
                    if (digits.length === 10) handleSendCode(digits);
                  }}
                  disabled={sending}
                  className={`w-full border-2 border-black py-3.5 text-xs font-bold tracking-wider uppercase disabled:cursor-not-allowed disabled:opacity-50 ${
                    phoneReady
                      ? "cursor-pointer bg-[#ffd800] hover:bg-[#e6c200]"
                      : "cursor-not-allowed bg-gray-300 text-gray-500"
                  }`}
                >
                  {sending ? "Sending..." : "Send Code \u2192"}
                </button>
              </div>
            </>
          )}

          {step === "otp" && <OtpInput onVerify={handleVerify} />}

          {/* Color dots + stat */}
          <div className="mt-8 hidden items-center gap-2 lg:flex">
            {[
              "#D4A0FF",
              "#FFC04D",
              "#6EE8B0",
              "#FFA0A0",
              "#93B8FF",
              "#171717",
            ].map((c) => (
              <div
                key={c}
                className="h-2.5 w-2.5"
                style={{ backgroundColor: c }}
              />
            ))}
            <Typography variant="detail" className="ml-1">
              248 pins saved today
            </Typography>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-12">
          <Typography variant="detail">PINMY &middot; 2026</Typography>
          <div className="flex items-center gap-3">
            <Link href="/privacy">
              <Typography variant="detail" className="italic underline">
                PRIVACY
              </Typography>
            </Link>
            <Typography variant="detail"> // </Typography>
            <Link href="/terms">
              <Typography variant="detail" className="italic underline">
                TERMS
              </Typography>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Pin stream ── */}
      <div className="relative order-1 min-h-0 flex-1 lg:order-2">
        <div className="h-full overflow-hidden bg-[#e8e4db] px-4 py-6 lg:overflow-y-auto lg:px-10 lg:px-16 lg:py-12">
          <Typography
            variant="muted"
            className="mb-6 text-xs tracking-widest uppercase"
          >
            // YOUR PINS
          </Typography>
          <div className="flex flex-col gap-4 pt-2">
            {DEMO_PINS.map((pin) => (
              <Pin key={pin.uniqueId} pin={pin} />
            ))}
          </div>
        </div>
        {/* Bottom fade on mobile */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#e8e4db] to-transparent lg:hidden" />
      </div>
    </div>
  );
}
