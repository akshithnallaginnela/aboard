import { Bell, ChevronDown, LogOut, MessagesSquare, Shield, User, UserRoundCog, Users, UsersRound } from "lucide-react";
import { Link, NavLink, Outlet, redirect, useLocation, useNavigate } from "react-router";

import type { Route } from "./+types/app-layout";
import { OfflineBanner, RouteErrorState } from "~/components/feedback";
import { AppContainer, Wordmark } from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { privateMeta } from "~/lib/meta";
import { requireMember, useLogout } from "~/lib/session";
import type { CurrentMember } from "~/lib/types";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => privateMeta("Members");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const member = await requireMember(request);
  const { pathname } = new URL(request.url);
  if (!member.onboardingComplete && pathname !== "/onboarding") throw redirect("/onboarding");
  return { member };
}

/** Re-check the session on every navigation so badges stay current and expiry is caught early. */
export function shouldRevalidate() {
  return true;
}

function Count({ value, label }: { value: number; label: string }) {
  if (value <= 0) return null;
  return (
    <>
      <span
        aria-hidden="true"
        className="ml-1 inline-flex min-w-5 items-center justify-center rounded-input bg-accent px-1 text-xs font-semibold text-ink"
      >
        {value > 99 ? "99+" : value}
      </span>
      <span className="sr-only">
        , {value} {label}
      </span>
    </>
  );
}

function navItems(member: CurrentMember) {
  return [
    { to: "/people", label: "People", icon: Users, count: 0, countLabel: "" },
    {
      to: "/connections",
      label: "Connections",
      icon: UsersRound,
      count: member.counts.pendingRequests,
      countLabel: "pending requests",
    },
    {
      to: "/messages",
      label: "Messages",
      icon: MessagesSquare,
      count: member.counts.unreadMessages,
      countLabel: "unread",
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: Bell,
      count: member.counts.unreadNotifications,
      countLabel: "unread",
    },
  ];
}

function AccountMenu({ member }: { member: CurrentMember }) {
  const navigate = useNavigate();
  const { logout, pending, error } = useLogout();
  return (
    <div className="flex items-center gap-2">
      {error ? (
        <p role="alert" className="max-w-56 text-sm font-semibold text-danger">
          Couldn't log out: {error}
        </p>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="quiet" size="sm" className="max-w-64">
            <User aria-hidden="true" />
            <span className="truncate">{member.displayName}</span>
            <ChevronDown aria-hidden="true" />
            <span className="sr-only">, account menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Signed in as {member.displayName}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => navigate("/settings/profile")}>
            <User aria-hidden="true" /> Your profile
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate("/settings/privacy")}>
            <UserRoundCog aria-hidden="true" /> Account and privacy
          </DropdownMenuItem>
          {member.role === "admin" ? (
            <DropdownMenuItem onSelect={() => navigate("/admin/reports")}>
              <Shield aria-hidden="true" /> Moderation queue
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={pending} onSelect={() => void logout()}>
            <LogOut aria-hidden="true" /> {pending ? "Logging out…" : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const { member } = loaderData;
  const location = useLocation();
  const items = navItems(member);
  const onboarding = location.pathname === "/onboarding";
  // A single open conversation on mobile uses the full height for the transcript and composer.
  const inConversation = /^\/messages\/[^/]+/.test(location.pathname);

  return (
    <div className={cn("flex min-h-dvh flex-col", inConversation ? "h-dvh" : "pb-20 md:pb-0")}>
      <header className={cn("border-b border-divider bg-surface", inConversation && "hidden md:block")}>
        <AppContainer className="flex min-h-16 items-center justify-between gap-3 py-2">
          <Link to={onboarding ? "/onboarding" : "/people"} className="rounded-button py-2" aria-label="ConnectAbroad">
            <Wordmark className="text-[1.25rem]" />
          </Link>
          {onboarding ? null : (
            <nav aria-label="Member" className="hidden items-center gap-1 md:flex">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex min-h-11 items-center rounded-button px-3 font-semibold hover:bg-canvas",
                      isActive && "bg-soft-context text-ink",
                    )
                  }
                >
                  {item.label}
                  <Count value={item.count} label={item.countLabel} />
                </NavLink>
              ))}
            </nav>
          )}
          <AccountMenu member={member} />
        </AppContainer>
      </header>
      <OfflineBanner />
      <main id="main" tabIndex={-1} className={cn("flex-1 outline-none", inConversation && "min-h-0")}>
        <Outlet />
      </main>
      {onboarding || inConversation ? null : (
        <nav
          aria-label="Member"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          <ul className="grid grid-cols-4">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "relative flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-semibold",
                      isActive ? "text-primary" : "text-muted-ink",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon aria-hidden="true" className="size-5" />
                      <span className={cn(isActive && "underline decoration-2 underline-offset-4")}>{item.label}</span>
                      {item.count > 0 ? (
                        <>
                          <span
                            aria-hidden="true"
                            className="absolute right-[calc(50%-1.6rem)] top-2 min-w-5 rounded-input bg-accent px-1 text-center text-[0.7rem] text-ink"
                          >
                            {item.count > 99 ? "99+" : item.count}
                          </span>
                          <span className="sr-only">
                            , {item.count} {item.countLabel}
                          </span>
                        </>
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-divider bg-surface">
        <AppContainer className="flex min-h-16 items-center py-2">
          <Link to="/" className="rounded-button py-2" aria-label="ConnectAbroad home">
            <Wordmark className="text-[1.25rem]" />
          </Link>
        </AppContainer>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <AppContainer>
          <RouteErrorState />
        </AppContainer>
      </main>
    </div>
  );
}
