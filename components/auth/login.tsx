"use client";

import { authClient } from "@/lib/auth-client";
import { useRef, useState } from "react";
import { Typography } from "../typography/Typography";
import { Input } from "../ui/input";
import { ArrowRight } from "lucide-react";

function PhoneStep({ onSubmit }: { onSubmit: (phone: string) => void }) {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);

  const formatDisplay = (digits: string) => {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const isValidPhone = (input: string) => {
    const digits = input.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handleSubmit = () => {
    if (!isValidPhone(phone)) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    onSubmit(phone);
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter Phone Number"
        type="tel"
        inputMode="numeric"
        value={formatDisplay(phone)}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
          setPhone(value);
          if (phoneError) setPhoneError(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className={phoneError ? "border-red-700" : ""}
      />
      <div
        onClick={handleSubmit}
        className="flex cursor-pointer flex-col items-center justify-center bg-black px-2 hover:bg-slate-700"
      >
        <ArrowRight className="w-4 text-white" />
      </div>
    </div>
  );
}

function OtpStep({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && code.length === 6) {
      onSubmit(code);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  const code = digits.join("");

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <Input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="px-0 text-center"
        />
      ))}
      <div
        onClick={() => code.length === 6 && onSubmit(code)}
        className={`flex cursor-pointer flex-col items-center justify-center bg-black px-2 hover:bg-slate-700 ${code.length < 6 ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <ArrowRight className="w-4 text-white" />
      </div>
    </div>
  );
}

export function Login() {
  const { data: session } = authClient.useSession();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  const formatPhone = (input: string) => {
    const digits = input.replace(/\D/g, "").replace(/^1/, "");
    return `+1${digits}`;
  };

  const handlePhoneSubmit = async (phoneInput: string) => {
    setPhone(phoneInput);

    const res = await authClient.phoneNumber.sendOtp({
      phoneNumber: formatPhone(phoneInput),
    });

    if (!res.error) {
      setStep("otp");
    }
  };

  const handleOtpSubmit = async (code: string) => {
    const res = await authClient.phoneNumber.verify({
      phoneNumber: formatPhone(phone),
      code,
    });

    if (res.error) {
      setStep("phone");
    }
  };

  const logout = async () => {
    await authClient.signOut();
    setStep("phone");
  };

  return (
    <div className="brutal-shadow flex w-[300px] flex-col gap-2 border-2 border-black px-4 pt-4 pb-5">
      <LoginHeader step={step} />

      {step === "phone" && <PhoneStep onSubmit={handlePhoneSubmit} />}
      {step === "otp" && <OtpStep onSubmit={handleOtpSubmit} />}

      {session && <button onClick={logout}>Logout</button>}
    </div>
  );
}

const LoginHeader = ({ step }: { step: "phone" | "otp" }) => {
  switch (step) {
    case "phone":
      return <Typography variant="large">Login</Typography>;
    case "otp":
      return <Typography variant="large">Enter Code</Typography>;
  }
};
