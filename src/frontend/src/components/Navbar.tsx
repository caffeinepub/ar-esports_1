import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import { History, LogIn, LogOut, MoreVertical, Shield, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Navbar() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      style={{
        background: "oklch(10% 0.02 270 / 0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="nav.link"
            className="flex items-center gap-3 group"
          >
            <img
              src="/assets/generated/ar-esports-logo-transparent.dim_200x200.png"
              alt="AR Esports"
              className="w-9 h-9 object-contain"
            />
            <span
              className="font-display font-extrabold text-xl tracking-tight"
              style={{ color: "oklch(65% 0.22 45)" }}
            >
              AR <span className="text-foreground">Esports</span>
            </span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              data-ocid="nav.home.link"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {identity ? (
              <div className="flex items-center gap-2">
                <Avatar
                  className="w-8 h-8 border"
                  style={{ borderColor: "oklch(65% 0.22 45 / 0.5)" }}
                >
                  <AvatarFallback
                    className="text-xs"
                    style={{
                      background: "oklch(22% 0.03 260)",
                      color: "oklch(65% 0.22 45)",
                    }}
                  >
                    {shortPrincipal?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-xs text-muted-foreground font-mono">
                  {shortPrincipal}
                </span>
              </div>
            ) : (
              <Button
                size="sm"
                data-ocid="nav.login.button"
                onClick={login}
                disabled={isLoggingIn}
                className="text-xs font-semibold"
                style={{
                  background: "oklch(65% 0.22 45)",
                  color: "oklch(10% 0.02 270)",
                }}
              >
                <LogIn className="w-3 h-3 mr-1" />
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            )}

            {/* 3-dot menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid="nav.dropdown_menu"
                  className="w-9 h-9 rounded-full border border-border/50"
                >
                  {menuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <MoreVertical className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-border/50"
                style={{
                  background: "oklch(16% 0.025 260)",
                  color: "oklch(95% 0.01 60)",
                }}
              >
                <DropdownMenuItem
                  data-ocid="nav.history.link"
                  onClick={() => {
                    navigate({ to: "/history" });
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <History
                    className="w-4 h-4"
                    style={{ color: "oklch(65% 0.22 45)" }}
                  />
                  My History
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="nav.admin.link"
                  onClick={() => {
                    navigate({ to: "/admin" });
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Shield
                    className="w-4 h-4"
                    style={{ color: "oklch(65% 0.22 45)" }}
                  />
                  Admin Panel
                </DropdownMenuItem>
                {identity && (
                  <DropdownMenuItem
                    data-ocid="nav.signout.button"
                    onClick={() => {
                      clear();
                      setMenuOpen(false);
                    }}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
