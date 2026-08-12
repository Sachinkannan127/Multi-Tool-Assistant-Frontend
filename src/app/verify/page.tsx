"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, ArrowRight, Loader2, Key } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Generate a random 6-digit OTP on load for demonstration
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(randomOtp);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Format validation: Exactly 6 numeric digits
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    // Value validation: Match the randomly generated OTP
    if (otp !== expectedOtp) {
      setError("Incorrect code. Please try again.");
      return;
    }

    setIsVerifying(true);

    // Simulate a brief verification delay for UX
    setTimeout(() => {
      // Upon successful format validation, proceed to chat
      router.push("/chat");
    }, 800);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (value.length <= 6) {
      setOtp(value);
      if (error) setError(""); // Clear error on new typing
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Simple Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">multi</span>
        </Link>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
          <div className="w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl absolute -translate-y-20" />
          <div className="w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl absolute translate-x-32" />
        </div>

        <div className="relative z-10 w-full max-w-md p-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Security Verification</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Enter the 6-digit access code to enter your AI workspace.
            </p>
          </div>

          {/* Demo OTP Display */}
          {expectedOtp && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between animate-fade-slide-up">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Demo Code</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Use this code to proceed</p>
                </div>
              </div>
              <span className="text-xl font-mono font-bold tracking-[0.2em] text-white bg-black/20 px-3 py-1 rounded-lg">
                {expectedOtp}
              </span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Access Code
              </label>
              <div className="relative">
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-[var(--border-subtle)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 font-medium flex items-center gap-1.5 animate-fade-slide-up">
                  <span className="w-1 h-1 rounded-full bg-red-400" /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || isVerifying}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                otp.length === 6 && !isVerifying
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:-translate-y-0.5 shadow-blue-500/25"
                  : "bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-xs text-[var(--text-muted)] relative z-10 text-center max-w-sm">
          By proceeding, you agree to our Terms of Service and confirm you have read our Privacy Policy.
        </p>
      </main>
    </div>
  );
}
