import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  RefreshCw,
  Shield,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PaymentStatus } from "../backend";
import {
  useApprovePayment,
  useGetAllPaymentRequests,
  useGetAllRegistrations,
  useGetAllUsers,
  useListTournaments,
  useRejectPayment,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "adarshwebmaker";

export function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    data: users = [],
    isLoading: usersLoading,
    dataUpdatedAt: usersUpdated,
  } = useGetAllUsers();
  const {
    data: registrations = [],
    isLoading: regsLoading,
    dataUpdatedAt: regsUpdated,
  } = useGetAllRegistrations();
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    dataUpdatedAt: paymentsUpdated,
  } = useGetAllPaymentRequests();
  const { data: tournaments = [] } = useListTournaments();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();

  useEffect(() => {
    if (usersUpdated || regsUpdated || paymentsUpdated) {
      setLastUpdated(new Date());
    }
  }, [usersUpdated, regsUpdated, paymentsUpdated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password!");
    }
  };

  const getTournamentName = (id: string) => {
    const t = tournaments.find((x) => x.id === id);
    if (!t) return id;
    return `${t.tournamentType === "duo" ? "2vs2" : "4vs4"} @ ${t.timeSlot}:00`;
  };

  const handleApprove = async (userId: any, tournamentId: string) => {
    try {
      await approvePayment.mutateAsync({ userId, tournamentId });
      toast.success("Payment approved!");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (userId: any, tournamentId: string) => {
    try {
      await rejectPayment.mutateAsync({ userId, tournamentId });
      toast.success("Payment rejected.");
    } catch {
      toast.error("Failed to reject");
    }
  };

  const pendingCount = payments.filter(
    (p) => p.status === PaymentStatus.pending,
  ).length;

  if (!authenticated) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="admin.login.card"
          className="w-full max-w-sm p-8 rounded-2xl space-y-5"
          style={{
            background: "oklch(16% 0.025 260)",
            border: "1px solid oklch(65% 0.22 45 / 0.3)",
          }}
        >
          <div className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(65% 0.22 45 / 0.15)" }}
            >
              <Shield
                className="w-7 h-7"
                style={{ color: "oklch(65% 0.22 45)" }}
              />
            </div>
            <h1
              className="font-display font-extrabold text-2xl"
              style={{ color: "white" }}
            >
              Admin Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: "black" }}>
              Enter password to access admin controls
            </p>
          </div>
          <div className="space-y-3">
            <Input
              data-ocid="admin.password.input"
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="h-10 text-sm"
            />
            {error && (
              <p
                data-ocid="admin.error_state"
                className="text-xs"
                style={{ color: "black" }}
              >
                ⚠️ {error}
              </p>
            )}
            <Button
              data-ocid="admin.login.button"
              onClick={handleLogin}
              className="w-full font-bold h-10"
              style={{
                background:
                  "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
                color: "oklch(10% 0.02 270)",
              }}
            >
              Access Admin
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Shield
                  className="w-6 h-6"
                  style={{ color: "oklch(65% 0.22 45)" }}
                />
                <h1
                  className="font-display font-extrabold text-2xl"
                  style={{ color: "white" }}
                >
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "oklch(35% 0.15 145 / 0.2)",
                    border: "1px solid oklch(50% 0.2 145 / 0.4)",
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: "oklch(60% 0.22 145)" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ background: "oklch(60% 0.22 145)" }}
                    />
                  </span>
                  <span style={{ color: "black" }}>LIVE</span>
                </div>
                {lastUpdated && (
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ color: "black" }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: <Users className="w-5 h-5" />,
                  label: "Total Users",
                  value: users.length,
                },
                {
                  icon: <Trophy className="w-5 h-5" />,
                  label: "Registrations",
                  value: registrations.length,
                },
                {
                  icon: <CreditCard className="w-5 h-5" />,
                  label: "Payments",
                  value: payments.length,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "oklch(16% 0.025 260)",
                    border: "1px solid oklch(28% 0.04 40 / 0.5)",
                  }}
                >
                  <div
                    className="flex justify-center mb-2"
                    style={{ color: "oklch(65% 0.22 45)" }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className="font-display font-extrabold text-2xl"
                    style={{ color: "black" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs" style={{ color: "black" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="payments" className="space-y-4">
              <TabsList
                className="grid grid-cols-3 w-full"
                style={{ background: "oklch(16% 0.025 260)" }}
              >
                <TabsTrigger data-ocid="admin.users.tab" value="users">
                  All Users
                  {users.length > 0 && (
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "oklch(65% 0.22 45 / 0.2)",
                        color: "black",
                      }}
                    >
                      {users.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="admin.registrations.tab"
                  value="registrations"
                >
                  Registrations
                  {registrations.length > 0 && (
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "oklch(65% 0.22 45 / 0.2)",
                        color: "black",
                      }}
                    >
                      {registrations.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger data-ocid="admin.payments.tab" value="payments">
                  Payments
                  {pendingCount > 0 && (
                    <span
                      className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "oklch(55% 0.22 25 / 0.25)",
                        color: "black",
                      }}
                    >
                      {pendingCount} pending
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Users */}
              <TabsContent value="users">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid oklch(28% 0.04 40 / 0.5)" }}
                >
                  {usersLoading ? (
                    <div
                      data-ocid="admin.users.loading_state"
                      className="flex justify-center py-8"
                    >
                      <Loader2
                        className="w-6 h-6 animate-spin"
                        style={{ color: "oklch(65% 0.22 45)" }}
                      />
                    </div>
                  ) : users.length === 0 ? (
                    <div
                      data-ocid="admin.users.empty_state"
                      className="text-center py-12 text-sm"
                      style={{ color: "black" }}
                    >
                      No users registered yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table data-ocid="admin.users.table">
                        <TableHeader
                          style={{ background: "oklch(14% 0.02 265)" }}
                        >
                          <TableRow>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              #
                            </TableHead>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              Name
                            </TableHead>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              Email
                            </TableHead>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              Age
                            </TableHead>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              Game Name
                            </TableHead>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              FF UID
                            </TableHead>
                            <TableHead
                              className="text-xs"
                              style={{ color: "black" }}
                            >
                              Phone
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u, i) => (
                            <TableRow
                              key={u.email || `user-${i}`}
                              data-ocid={`admin.users.row.${i + 1}`}
                              style={{
                                borderColor: "oklch(28% 0.04 40 / 0.3)",
                              }}
                            >
                              <TableCell
                                className="text-xs"
                                style={{ color: "black" }}
                              >
                                {i + 1}
                              </TableCell>
                              <TableCell
                                className="text-xs font-medium"
                                style={{ color: "black" }}
                              >
                                {u.name}
                              </TableCell>
                              <TableCell
                                className="text-xs"
                                style={{ color: "black" }}
                              >
                                {u.email}
                              </TableCell>
                              <TableCell
                                className="text-xs"
                                style={{ color: "black" }}
                              >
                                {u.age.toString()}
                              </TableCell>
                              <TableCell
                                className="text-xs font-mono"
                                style={{ color: "black" }}
                              >
                                {u.gameName}
                              </TableCell>
                              <TableCell
                                className="text-xs font-mono"
                                style={{ color: "black" }}
                              >
                                {u.ffUID.toString()}
                              </TableCell>
                              <TableCell
                                className="text-xs"
                                style={{ color: "black" }}
                              >
                                {u.phoneNumber}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Registrations */}
              <TabsContent value="registrations">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid oklch(28% 0.04 40 / 0.5)" }}
                >
                  {regsLoading ? (
                    <div
                      data-ocid="admin.regs.loading_state"
                      className="flex justify-center py-8"
                    >
                      <Loader2
                        className="w-6 h-6 animate-spin"
                        style={{ color: "oklch(65% 0.22 45)" }}
                      />
                    </div>
                  ) : registrations.length === 0 ? (
                    <div
                      data-ocid="admin.regs.empty_state"
                      className="text-center py-12 text-sm"
                      style={{ color: "black" }}
                    >
                      No registrations yet.
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {registrations.map((r, i) => (
                        <div
                          key={`${r.tournamentId}-${r.userId.toString()}`}
                          data-ocid={`admin.registrations.item.${i + 1}`}
                          className="rounded-xl p-4 space-y-3"
                          style={{
                            background: "oklch(16% 0.025 260)",
                            border: "1px solid oklch(28% 0.04 40 / 0.4)",
                          }}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <span
                                className="text-xs"
                                style={{ color: "black" }}
                              >
                                Tournament:
                              </span>
                              <span
                                className="ml-2 text-sm font-semibold"
                                style={{ color: "black" }}
                              >
                                {getTournamentName(r.tournamentId)}
                              </span>
                            </div>
                            <div
                              className="text-xs font-mono"
                              style={{ color: "black" }}
                            >
                              {new Date(
                                Number(r.timestamp) / 1_000_000,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-xs" style={{ color: "black" }}>
                            UPI:{" "}
                            <span
                              className="font-mono"
                              style={{ color: "black" }}
                            >
                              {r.teamInfo.teamLeaderUPI}
                            </span>{" "}
                            | Insta:{" "}
                            <span style={{ color: "black" }}>
                              {r.teamInfo.teamLeaderInsta}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {r.teamInfo.members.map((m, mi) => (
                              <div
                                key={m.gameName || `member-${mi}`}
                                className="p-2 rounded-lg text-xs"
                                style={{ background: "oklch(20% 0.025 260)" }}
                              >
                                <div
                                  className="font-bold"
                                  style={{ color: "black" }}
                                >
                                  {m.gameName}
                                </div>
                                <div style={{ color: "black" }}>
                                  UID: {m.ffUID.toString()}
                                </div>
                                <div style={{ color: "black" }}>
                                  Ph: {m.phoneNumber}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Payments */}
              <TabsContent value="payments">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid oklch(28% 0.04 40 / 0.5)" }}
                >
                  {paymentsLoading ? (
                    <div
                      data-ocid="admin.payments.loading_state"
                      className="flex justify-center py-8"
                    >
                      <Loader2
                        className="w-6 h-6 animate-spin"
                        style={{ color: "oklch(65% 0.22 45)" }}
                      />
                    </div>
                  ) : payments.length === 0 ? (
                    <div
                      data-ocid="admin.payments.empty_state"
                      className="text-center py-12 text-sm"
                      style={{ color: "black" }}
                    >
                      No payment requests yet.
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {payments.map((p, i) => (
                        <div
                          key={`${p.tournamentId}-${p.userId.toString()}`}
                          data-ocid={`admin.payments.item.${i + 1}`}
                          className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
                          style={{
                            background: "oklch(16% 0.025 260)",
                            border:
                              p.status === PaymentStatus.pending
                                ? "1px solid oklch(55% 0.22 45 / 0.5)"
                                : "1px solid oklch(28% 0.04 40 / 0.4)",
                          }}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div
                              className="text-xs truncate"
                              style={{ color: "black" }}
                            >
                              User:{" "}
                              <span
                                className="font-mono"
                                style={{ color: "black" }}
                              >
                                {p.userId.toString().slice(0, 20)}...
                              </span>
                            </div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "black" }}
                            >
                              {getTournamentName(p.tournamentId)}
                            </div>
                            <div className="text-xs" style={{ color: "black" }}>
                              {new Date(
                                Number(p.timestamp) / 1_000_000,
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                p.status === PaymentStatus.approved
                                  ? "badge-approved"
                                  : p.status === PaymentStatus.rejected
                                    ? "badge-rejected"
                                    : "badge-pending"
                              }`}
                            >
                              {p.status}
                            </span>
                            {p.status === PaymentStatus.pending && (
                              <div className="flex gap-2">
                                <Button
                                  data-ocid={`admin.payments.approve.button.${i + 1}`}
                                  size="sm"
                                  onClick={() =>
                                    handleApprove(p.userId, p.tournamentId)
                                  }
                                  disabled={approvePayment.isPending}
                                  className="h-7 px-3 text-xs font-bold"
                                  style={{
                                    background: "oklch(50% 0.2 145)",
                                    color: "white",
                                  }}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  data-ocid={`admin.payments.reject.button.${i + 1}`}
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleReject(p.userId, p.tournamentId)
                                  }
                                  disabled={rejectPayment.isPending}
                                  className="h-7 px-3 text-xs font-bold"
                                >
                                  <XCircle className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
