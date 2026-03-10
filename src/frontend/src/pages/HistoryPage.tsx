import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { PaymentStatus, TournamentType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetPaymentStatus,
  useGetUserHistory,
  useListTournaments,
} from "../hooks/useQueries";

function PaymentBadge({
  status,
}: { status: PaymentStatus | null | undefined }) {
  if (!status || status === PaymentStatus.pending)
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(55% 0.18 45 / 0.15)",
          color: "oklch(70% 0.18 45)",
          border: "1px solid oklch(55% 0.18 45 / 0.4)",
        }}
      >
        ⏳ Registration in Progress
      </span>
    );
  if (status === PaymentStatus.approved)
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          background: "oklch(50% 0.2 145 / 0.15)",
          color: "oklch(65% 0.2 145)",
          border: "1px solid oklch(50% 0.2 145 / 0.4)",
        }}
      >
        ✓ Registered
      </span>
    );
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: "oklch(45% 0.2 25 / 0.15)",
        color: "oklch(65% 0.2 25)",
        border: "1px solid oklch(45% 0.2 25 / 0.4)",
      }}
    >
      ✗ Rejected
    </span>
  );
}

function HistoryItem({ reg, tournaments }: { reg: any; tournaments: any[] }) {
  const tournament = tournaments?.find((t: any) => t.id === reg.tournamentId);
  const { data: paymentStatus } = useGetPaymentStatus(reg.tournamentId);
  const isDuo = tournament?.tournamentType === TournamentType.duo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "oklch(16% 0.025 260)",
        border: `1px solid ${
          paymentStatus === PaymentStatus.approved
            ? "oklch(50% 0.2 145 / 0.5)"
            : paymentStatus === PaymentStatus.rejected
              ? "oklch(45% 0.2 25 / 0.5)"
              : "oklch(55% 0.18 45 / 0.4)"
        }`,
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "oklch(65% 0.22 45)" }} />
          <div>
            <div className="text-sm font-display font-bold text-foreground">
              {tournament
                ? isDuo
                  ? "2vs2 Duo"
                  : "4vs4 Squad"
                : reg.tournamentId}
            </div>
            {tournament && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Number(tournament.timeSlot)}:00{" "}
                {Number(tournament.timeSlot) < 12 ? "AM" : "PM"}
              </div>
            )}
          </div>
        </div>
        <PaymentBadge status={paymentStatus} />
      </div>

      <div className="flex flex-wrap gap-2">
        {reg.teamInfo.members.map((m: any, i: number) => (
          <div
            key={m.gameName || `member-${i}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
            style={{ background: "oklch(20% 0.025 260)" }}
          >
            <span style={{ color: "oklch(65% 0.22 45)" }}>P{i + 1}</span>
            <span className="text-foreground font-semibold">{m.gameName}</span>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Registered:{" "}
        {new Date(Number(reg.timestamp) / 1_000_000).toLocaleString()}
      </div>
    </motion.div>
  );
}

export function HistoryPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: history, isLoading } = useGetUserHistory();
  const { data: tournaments } = useListTournaments();

  if (!identity) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm" data-ocid="history.login.card">
          <Trophy
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "oklch(65% 0.22 45)" }}
          />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">
            Sign In to View History
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Your tournament history will appear here after signing in.
          </p>
          <Button
            data-ocid="history.login.button"
            onClick={login}
            className="font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
              color: "oklch(10% 0.02 270)",
            }}
          >
            Sign In
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          data-ocid="history.back.button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="mb-8">
          <p
            className="text-xs uppercase tracking-[0.3em] mb-1"
            style={{ color: "oklch(65% 0.22 45)" }}
          >
            Player Records
          </p>
          <h1 className="font-display font-extrabold text-3xl text-foreground">
            My Tournament History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All tournaments you've registered for.
          </p>
        </div>

        {isLoading ? (
          <div
            data-ocid="history.loading_state"
            className="flex justify-center py-16"
          >
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "oklch(65% 0.22 45)" }}
            />
          </div>
        ) : !history || history.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="text-center py-16 rounded-2xl"
            style={{
              background: "oklch(16% 0.025 260)",
              border: "1px dashed oklch(28% 0.04 40 / 0.5)",
            }}
          >
            <Trophy
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(65% 0.22 45 / 0.3)" }}
            />
            <h3 className="font-display font-bold text-lg text-foreground mb-1">
              No Tournaments Yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't registered for any tournament yet. Jump in!
            </p>
            <Button
              data-ocid="history.register.button"
              onClick={() => navigate("/")}
              className="font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
                color: "oklch(10% 0.02 270)",
              }}
            >
              🔥 Join a Tournament
            </Button>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="history.list">
            {history.map((reg) => (
              <HistoryItem
                key={`${reg.tournamentId}-${String(reg.timestamp)}`}
                reg={reg}
                tournaments={tournaments || []}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
