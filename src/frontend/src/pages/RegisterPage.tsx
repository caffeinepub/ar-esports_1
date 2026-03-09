import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Loader2,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { TeamMember, UserProfile } from "../backend";
import { TournamentType } from "../backend";
import { ConfettiEffect } from "../components/ConfettiEffect";
import { TeamForm } from "../components/TeamForm";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCheckDuplicate,
  useGetCallerProfile,
  useListTournaments,
  useRegisterTournament,
  useSaveProfile,
} from "../hooks/useQueries";

type Step = "profile" | "team" | "payment" | "done";

export function RegisterPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { identity, login, isLoggingIn } = useInternetIdentity();

  const { data: tournaments } = useListTournaments();
  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const { data: isDuplicate, isLoading: dupLoading } = useCheckDuplicate(
    tournamentId || "",
  );
  const saveMutation = useSaveProfile();
  const registerMutation = useRegisterTournament();

  const tournament = tournaments?.find((t) => t.id === tournamentId);
  const isDuo = tournament?.tournamentType === TournamentType.duo;
  const memberCount = isDuo ? 2 : 4;

  const [step, setStep] = useState<Step>("profile");
  const [showConfetti, setShowConfetti] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState<
    Partial<UserProfile & { name: string }>
  >({
    name: "",
    email: "",
    age: undefined,
    ffUID: undefined,
    gameName: "",
    phoneNumber: "",
  });

  // Team form
  const [members, setMembers] = useState<Partial<TeamMember>[]>(
    Array.from({ length: 4 }, () => ({
      ffUID: undefined,
      gameName: "",
      phoneNumber: "",
      email: "",
      age: undefined,
    })),
  );
  const [teamUPI, setTeamUPI] = useState("");
  const [teamInsta, setTeamInsta] = useState("");

  // Prefill profile
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        email: profile.email,
        age: profile.age,
        ffUID: profile.ffUID,
        gameName: profile.gameName,
        phoneNumber: profile.phoneNumber,
      });
    }
  }, [profile]);

  const handleMemberChange = useCallback(
    (index: number, field: keyof TeamMember, value: string) => {
      setMembers((prev) => {
        const next = [...prev];
        if (field === "ffUID" || field === "age") {
          next[index] = {
            ...next[index],
            [field]: value ? BigInt(value) : undefined,
          };
        } else {
          next[index] = { ...next[index], [field]: value };
        }
        return next;
      });
    },
    [],
  );

  const handleSaveProfile = async () => {
    if (
      !profileForm.name ||
      !profileForm.email ||
      !profileForm.age ||
      !profileForm.ffUID ||
      !profileForm.gameName ||
      !profileForm.phoneNumber
    ) {
      toast.error("Please fill all profile fields!");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        name: profileForm.name || "",
        email: profileForm.email || "",
        age: profileForm.age || BigInt(0),
        ffUID: profileForm.ffUID || BigInt(0),
        gameName: profileForm.gameName || "",
        phoneNumber: profileForm.phoneNumber || "",
      });
      toast.success("Profile saved!");
      setStep("team");
    } catch (_e) {
      toast.error("Failed to save profile.");
    }
  };

  const handleSubmitTeam = () => {
    const validMembers = members.slice(0, memberCount);
    for (let i = 0; i < memberCount; i++) {
      const m = validMembers[i];
      if (
        !m?.ffUID ||
        !m?.gameName ||
        !m?.phoneNumber ||
        !m?.email ||
        !m?.age
      ) {
        toast.error(`Player ${i + 1}: fill all fields!`);
        return;
      }
    }
    if (!teamUPI) {
      toast.error("Team Leader UPI ID is required for prize!");
      return;
    }
    if (!teamInsta) {
      toast.error("Team Leader Instagram ID is required for redeem code!");
      return;
    }
    setStep("payment");
  };

  const handlePaid = async () => {
    if (!tournamentId) return;
    const validMembers = members.slice(0, memberCount).map((m) => ({
      ffUID: m.ffUID || BigInt(0),
      gameName: m.gameName || "",
      phoneNumber: m.phoneNumber || "",
      email: m.email || "",
      age: m.age || BigInt(0),
    }));
    try {
      await registerMutation.mutateAsync({
        tournamentId,
        team: {
          members: validMembers,
          teamLeaderUPI: teamUPI,
          teamLeaderInsta: teamInsta,
        },
      });
      setStep("done");
      setShowConfetti(true);
      toast.success("Registration submitted! Payment pending admin approval.");
    } catch (_e) {
      toast.error("Registration failed. Please try again.");
    }
  };

  // Not logged in
  if (!identity) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
          data-ocid="register.login.card"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: "oklch(65% 0.22 45 / 0.15)",
              border: "2px solid oklch(65% 0.22 45 / 0.4)",
            }}
          >
            <User className="w-7 h-7" style={{ color: "oklch(65% 0.22 45)" }} />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-foreground mb-2">
            Sign In Required
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            You must sign in to register for tournaments.
          </p>
          <Button
            data-ocid="register.login.button"
            onClick={login}
            disabled={isLoggingIn}
            className="w-full font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
              color: "oklch(10% 0.02 270)",
            }}
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Sign In to Continue
          </Button>
        </motion.div>
      </main>
    );
  }

  if (dupLoading || profileLoading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div
          data-ocid="register.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "oklch(65% 0.22 45)" }}
          />
          <p className="text-muted-foreground text-sm">
            Checking registration status...
          </p>
        </div>
      </main>
    );
  }

  // Already registered
  if (isDuplicate) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          data-ocid="register.duplicate.card"
          className="text-center max-w-sm p-6 rounded-2xl"
          style={{
            background: "oklch(18% 0.025 260)",
            border: "1px solid oklch(65% 0.22 45 / 0.3)",
          }}
        >
          <AlertTriangle
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: "oklch(80% 0.18 80)" }}
          />
          <h2 className="font-display font-extrabold text-xl text-foreground mb-2">
            Already Registered!
          </h2>
          <p className="text-muted-foreground text-sm mb-5">
            You are already registered for this tournament!
          </p>
          <Button
            data-ocid="register.back.button"
            onClick={() => navigate("/")}
            variant="outline"
            className="border-fire-orange/30 hover:border-fire-orange/60"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen px-4 py-8">
      <ConfettiEffect
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          type="button"
          data-ocid="register.back.button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tournaments
        </button>

        {/* Tournament info */}
        {tournament && (
          <div
            className="rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4"
            style={{
              background: "oklch(16% 0.025 260)",
              border: "1px solid oklch(65% 0.22 45 / 0.25)",
            }}
          >
            <div className="flex-1">
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ color: "oklch(65% 0.22 45)" }}
              >
                Registering for
              </p>
              <h2 className="font-display font-extrabold text-lg text-foreground">
                {isDuo ? "2vs2 Duo Showdown" : "4vs4 Squad Battle"}
              </h2>
            </div>
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Entry</p>
                <p
                  className="font-bold"
                  style={{ color: "oklch(80% 0.18 80)" }}
                >
                  ₹{tournament.entryFee.toString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prize</p>
                <p className="font-bold" style={{ color: "oklch(80% 0.2 70)" }}>
                  ₹{tournament.prize.toString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {(["profile", "team", "payment", "done"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background:
                    step === s
                      ? "oklch(65% 0.22 45)"
                      : ["profile", "team", "payment", "done"].indexOf(step) > i
                        ? "oklch(65% 0.22 45 / 0.3)"
                        : "oklch(22% 0.03 260)",
                  color:
                    step === s ? "oklch(10% 0.02 270)" : "oklch(60% 0.04 50)",
                }}
              >
                {["profile", "team", "payment", "done"].indexOf(step) > i
                  ? "✓"
                  : i + 1}
              </div>
              {i < 3 && (
                <div
                  className="flex-1 h-0.5 min-w-4"
                  style={{
                    background:
                      ["profile", "team", "payment", "done"].indexOf(step) > i
                        ? "oklch(65% 0.22 45 / 0.5)"
                        : "oklch(22% 0.03 260)",
                  }}
                />
              )}
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-2 capitalize">
            {step}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Profile */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-1">
                  Your Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Confirm your player details before registration.
                </p>
              </div>

              <div
                className="rounded-xl p-5 space-y-4"
                style={{
                  background: "oklch(16% 0.025 260)",
                  border: "1px solid oklch(28% 0.04 40 / 0.5)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Full Name *
                    </Label>
                    <Input
                      data-ocid="profile.name.input"
                      placeholder="Your name"
                      value={profileForm.name || ""}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Email *
                    </Label>
                    <Input
                      data-ocid="profile.email.input"
                      type="email"
                      placeholder="email@example.com"
                      value={profileForm.email || ""}
                      onChange={(e) =>
                        setProfileForm((p) => ({ ...p, email: e.target.value }))
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Age *
                    </Label>
                    <Input
                      data-ocid="profile.age.input"
                      type="number"
                      placeholder="Your age"
                      value={
                        profileForm.age !== undefined
                          ? String(profileForm.age)
                          : ""
                      }
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          age: e.target.value
                            ? BigInt(e.target.value)
                            : undefined,
                        }))
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Phone Number *
                    </Label>
                    <Input
                      data-ocid="profile.phone.input"
                      type="tel"
                      placeholder="10-digit mobile"
                      value={profileForm.phoneNumber || ""}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      FF Max UID *
                    </Label>
                    <Input
                      data-ocid="profile.ffuid.input"
                      type="number"
                      placeholder="Free Fire Max UID"
                      value={
                        profileForm.ffUID !== undefined
                          ? String(profileForm.ffUID)
                          : ""
                      }
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          ffUID: e.target.value
                            ? BigInt(e.target.value)
                            : undefined,
                        }))
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Game Name *
                    </Label>
                    <Input
                      data-ocid="profile.gamename.input"
                      placeholder="In-game name"
                      value={profileForm.gameName || ""}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          gameName: e.target.value,
                        }))
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <Button
                data-ocid="profile.save.button"
                onClick={handleSaveProfile}
                disabled={saveMutation.isPending}
                className="w-full font-bold h-11"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
                  color: "oklch(10% 0.02 270)",
                }}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save & Continue →
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Team */}
          {step === "team" && (
            <motion.div
              key="team"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-1">
                  Team Details — {isDuo ? "2 Players" : "4 Players"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fill in all {memberCount} players' Free Fire Max details.
                </p>
              </div>

              <TeamForm
                members={members}
                onChange={handleMemberChange}
                count={memberCount}
              />

              {/* Team Leader info */}
              <div
                className="rounded-xl p-4 space-y-4"
                style={{
                  background: "oklch(16% 0.025 260)",
                  border: "1px solid oklch(65% 0.22 45 / 0.2)",
                }}
              >
                <h4
                  className="font-display font-bold text-sm uppercase tracking-wider"
                  style={{ color: "oklch(65% 0.22 45)" }}
                >
                  Prize & Redeem Info (Team Leader)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      UPI ID (for prize money) *
                    </Label>
                    <Input
                      data-ocid="team.upi.input"
                      placeholder="yourname@upi"
                      value={teamUPI}
                      onChange={(e) => setTeamUPI(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Instagram ID (for redeem code) *
                    </Label>
                    <Input
                      data-ocid="team.insta.input"
                      placeholder="@yourinsta"
                      value={teamInsta}
                      onChange={(e) => setTeamInsta(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  data-ocid="team.back.button"
                  onClick={() => setStep("profile")}
                  variant="outline"
                  className="border-border/50"
                >
                  ← Back
                </Button>
                <Button
                  data-ocid="team.submit.button"
                  onClick={handleSubmitTeam}
                  className="flex-1 font-bold h-11"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
                    color: "oklch(10% 0.02 270)",
                  }}
                >
                  Continue to Payment →
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Payment */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-display font-bold text-xl text-foreground mb-1">
                  Payment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code and pay the entry fee to complete
                  registration.
                </p>
              </div>

              <div
                className="rounded-2xl p-6 text-center space-y-4"
                style={{
                  background: "oklch(16% 0.025 260)",
                  border: "1px solid oklch(65% 0.22 45 / 0.3)",
                }}
                data-ocid="payment.card"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CreditCard
                    className="w-5 h-5"
                    style={{ color: "oklch(65% 0.22 45)" }}
                  />
                  <span className="font-display font-bold text-base text-foreground">
                    Scan & Pay
                  </span>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-3 rounded-xl bg-white inline-block">
                    <img
                      src="/assets/uploads/IMG-20260309-WA0008-1.jpg"
                      alt="Payment QR Code"
                      className="w-48 h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {/* Fallback QR placeholder */}
                    <div
                      className="w-48 h-48 flex flex-col items-center justify-center"
                      style={{ display: "none" }}
                    >
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-xs text-gray-500">QR Code</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pay to:</p>
                  <p className="font-display font-bold text-lg text-foreground">
                    Purushottam Kumar
                  </p>
                  <p
                    className="text-sm font-mono"
                    style={{ color: "oklch(65% 0.22 45)" }}
                  >
                    8317701193@ybl
                  </p>
                  {tournament && (
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                      style={{
                        background: "oklch(65% 0.22 45 / 0.15)",
                        color: "oklch(80% 0.18 80)",
                        border: "1px solid oklch(65% 0.22 45 / 0.3)",
                      }}
                    >
                      Amount: ₹{tournament.entryFee.toString()}
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground pt-2">
                  ⚠️ After paying, click "I Have Paid" below. Admin will verify
                  and approve your registration.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  data-ocid="payment.back.button"
                  onClick={() => setStep("team")}
                  variant="outline"
                  className="border-border/50"
                >
                  ← Back
                </Button>
                <Button
                  data-ocid="payment.confirm.button"
                  onClick={handlePaid}
                  disabled={registerMutation.isPending}
                  className="flex-1 font-bold h-11"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
                    color: "oklch(10% 0.02 270)",
                    boxShadow: "0 0 20px oklch(65% 0.22 45 / 0.3)",
                  }}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "🎮"
                  )}
                  {registerMutation.isPending
                    ? "Submitting..."
                    : "I Have Paid — Submit Registration"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Done */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
              data-ocid="register.success_state"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
              >
                <CheckCircle
                  className="w-20 h-20 mx-auto"
                  style={{ color: "oklch(70% 0.2 145)" }}
                />
              </motion.div>
              <h3
                className="font-display font-extrabold text-3xl"
                style={{ color: "oklch(65% 0.22 45)" }}
              >
                🎉 You're In!
              </h3>
              <p className="text-muted-foreground">
                Registration submitted! Admin will verify your payment and
                approve your entry.
              </p>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{
                  background: "oklch(70% 0.2 80 / 0.15)",
                  color: "oklch(80% 0.18 80)",
                  border: "1px solid oklch(70% 0.18 80 / 0.4)",
                }}
              >
                Status: Payment Pending Approval
              </div>
              <div className="pt-2">
                <Button
                  data-ocid="register.home.button"
                  onClick={() => navigate("/")}
                  className="font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(65% 0.22 45), oklch(55% 0.25 25))",
                    color: "oklch(10% 0.02 270)",
                  }}
                >
                  Back to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
