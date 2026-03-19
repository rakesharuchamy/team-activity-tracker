import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart2,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActivityTypes,
  useCreateActivityType,
  useCreateEnvironment,
  useEnvironments,
} from "../hooks/useQueries";

const TEAM_MEMBERS = ["Rakesh", "Nikil", "Tony", "Vivek", "Ershad"];
const DEFAULT_ACTIVITY_TYPES = [
  "Monitoring Environment",
  "Backup Activity",
  "Restore Activity",
];
const DEFAULT_ENVIRONMENTS = [
  "NYK",
  "Seaspan",
  "ONesea",
  "CMA-CGM",
  "Evergreen",
  "MSC",
  "HMM",
  "Yang Ming",
  "PIL",
  "Wan Hai",
  "ZIM",
  "COSCO",
  "Hapag-Lloyd",
  "ONE",
  "Maersk",
];

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/team-logs", label: "Team Logs", icon: Users },
  { path: "/reports", label: "Reports", icon: BarChart2 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  const { identity, loginStatus, clear, isInitializing } =
    useInternetIdentity();
  const router = useRouter();
  const location = useLocation();
  const { actor } = useActor();
  const { data: activityTypes } = useActivityTypes();
  const { data: environments } = useEnvironments();
  const createActivityType = useCreateActivityType();
  const createEnvironment = useCreateEnvironment();
  const createActivityTypeMutate = createActivityType.mutate;
  const createEnvironmentMutate = createEnvironment.mutate;

  useEffect(() => {
    if (!isInitializing && loginStatus !== "success") {
      router.navigate({ to: "/login" });
    }
  }, [loginStatus, isInitializing, router]);

  useEffect(() => {
    if (!actor || !activityTypes || !environments) return;
    if (activityTypes.length === 0) {
      for (const name of DEFAULT_ACTIVITY_TYPES) {
        createActivityTypeMutate(name);
      }
    }
    if (environments.length === 0) {
      for (const name of DEFAULT_ENVIRONMENTS) {
        createEnvironmentMutate(name);
      }
    }
  }, [
    actor,
    activityTypes,
    environments,
    createActivityTypeMutate,
    createEnvironmentMutate,
  ]);

  const principal = identity?.getPrincipal().toString() ?? "";
  const shortId = principal.slice(0, 8);
  const memberIndex = principal
    ? Math.abs(principal.charCodeAt(0)) % TEAM_MEMBERS.length
    : 0;
  const memberName = TEAM_MEMBERS[memberIndex];

  if (isInitializing || loginStatus !== "success") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-accent animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className="flex flex-col w-60 flex-shrink-0 h-full"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.22 0.07 243) 0%, oklch(0.16 0.06 243) 100%)",
        }}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-base tracking-tight">
            Team Tracker
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" data-ocid="nav.panel">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-ocid={`nav.${item.label.toLowerCase().replace(" ", "_")}.link`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-nav-inactive hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-sidebar-border">
          <p className="text-xs text-nav-inactive opacity-60">
            Team Activity Tracker
          </p>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-end gap-4 px-6 h-14 bg-card border-b border-border flex-shrink-0">
          <button
            type="button"
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
            data-ocid="nav.notification.button"
          >
            <Bell className="w-5 h-5 text-secondary-text" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 hover:bg-muted px-2 py-1.5 rounded-lg transition-colors"
              data-ocid="nav.user.dropdown_menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-accent text-white text-xs font-semibold">
                  {memberName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {memberName}
              </span>
              <ChevronDown className="w-3 h-3 text-secondary-text" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs text-muted-foreground">
                {shortId}...
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => clear()}
                className="text-destructive focus:text-destructive"
                data-ocid="nav.logout.button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
