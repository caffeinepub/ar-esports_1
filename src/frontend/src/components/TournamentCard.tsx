import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Clock, Coins, Trophy, Users, Zap } from "lucide-react";
import type { Tournament } from "../backend";
import { TournamentType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface TournamentCardProps {
  tournament: Tournament;
  index: number;
}

function formatTime(ts: bigint): string {
  const hour = Number(ts);
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
}

export function TournamentCard({ tournament, index }: TournamentCardProps) {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isDuo = tournament.tournamentType === TournamentType.duo;

  const handleRegister = () => {
    if (!identity) {
      login();
      return;
    }
    navigate({ to: `/register/${tournament.id}` });
  };

  const gradients = [
    "from-orange-950/80 to-red-950/60",
    "from-red-950/80 to-orange-950/60",
    "from-amber-950/80 to-red-950/60",
    "from-orange-950/60 to-amber-950/80",
  ];

  return (
    <div
      data-ocid={`tournament.card.${index + 1}`}
      className="relative rounded-xl overflow-hidden card-glow cursor-pointer transition-all duration-300 gradient-border"
      style={{ background: "oklch(16% 0.025 260)" }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[index % 4]} pointer-events-none`}
      />

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div
          className="w-2 h-2 rounded-full pulse-ring"
          style={{ background: "oklch(65% 0.22 45)" }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "oklch(65% 0.22 45)" }}
        >
          Daily
        </span>
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: isDuo
                ? "oklch(65% 0.22 45 / 0.2)"
                : "oklch(55% 0.25 25 / 0.2)",
              color: isDuo ? "oklch(75% 0.2 45)" : "oklch(70% 0.2 25)",
              border: `1px solid ${isDuo ? "oklch(65% 0.22 45 / 0.4)" : "oklch(55% 0.25 25 / 0.4)"}`,
            }}
          >
            <Users className="w-3 h-3" />
            {isDuo ? "2 vs 2 DUO" : "4 vs 4 SQUAD"}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg text-foreground mb-4">
          {isDuo ? "Duo Showdown" : "Squad Battle"}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Clock
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(65% 0.22 45)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground">Time</div>
              <div className="text-sm font-semibold text-foreground">
                {formatTime(tournament.timeSlot)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(80% 0.18 80)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground">Entry Fee</div>
              <div
                className="text-sm font-bold"
                style={{ color: "oklch(80% 0.18 80)" }}
              >
                ₹{tournament.entryFee.toString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(80% 0.2 70)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground">Win Prize</div>
              <div
                className="text-sm font-bold"
                style={{ color: "oklch(80% 0.2 70)" }}
              >
                ₹{tournament.prize.toString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap
              className="w-4 h-4 shrink-0"
              style={{ color: "oklch(65% 0.22 45)" }}
            />
            <div>
              <div className="text-xs text-muted-foreground">Format</div>
              <div className="text-sm font-semibold text-foreground">
                Custom Room
              </div>
            </div>
          </div>
        </div>

        <Button
          data-ocid={`tournament.register.button.${index + 1}`}
          onClick={handleRegister}
          className="w-full font-bold uppercase tracking-wider text-sm h-10"
          style={{
            background:
              "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
            color: "oklch(10% 0.02 270)",
            boxShadow: "0 0 15px oklch(65% 0.22 45 / 0.3)",
          }}
        >
          🔥 Register Now
        </Button>
      </div>
    </div>
  );
}
