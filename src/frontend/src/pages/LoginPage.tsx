import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { Activity, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const router = useRouter();

  useEffect(() => {
    if (loginStatus === "success" && identity) {
      router.navigate({ to: "/" });
    }
  }, [loginStatus, identity, router]);

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.07 243) 0%, oklch(0.16 0.06 243) 60%, oklch(0.55 0.14 244 / 0.3) 100%)",
      }}
    >
      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            Team Tracker
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Track your team's
            <br />
            daily activities
            <br />
            <span className="text-accent-foreground opacity-70">
              with ease.
            </span>
          </h1>
          <p className="text-nav-inactive text-base max-w-sm">
            Log monitoring, backup, and restore activities across all your
            environments. Replace messy Excel sheets with a clean, searchable
            tracker.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {["Monitoring", "Backup", "Restore"].map((type) => (
              <div
                key={type}
                className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/60 mb-3 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <p className="text-white font-medium text-sm">{type}</p>
                <p className="text-nav-inactive text-xs mt-1">
                  15 environments
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-nav-inactive text-xs">
          Team members: Rakesh • Nikil • Tony • Vivek • Ershad
        </div>
      </motion.div>

      {/* Right login panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center justify-center flex-1 p-8"
      >
        <div className="w-full max-w-sm">
          <div className="bg-card rounded-2xl shadow-card-hover p-8 space-y-6">
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground text-base">
                Team Tracker
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome back
              </h2>
              <p className="text-secondary-text text-sm mt-1">
                Sign in to access your team's activity tracker
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => login()}
                disabled={isLoggingIn || isInitializing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 rounded-lg"
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Sign in with Internet Identity</>
                )}
              </Button>

              {loginStatus === "loginError" && (
                <p
                  className="text-destructive text-sm text-center"
                  data-ocid="login.error_state"
                >
                  Login failed. Please try again.
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-xs text-secondary-text">
                  Secured by Internet Identity — a decentralized authentication
                  system with no passwords.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-white/40 mt-6">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/60"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
