import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  Flame,
  Instagram,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { TournamentType } from "../backend";
import { TournamentCard } from "../components/TournamentCard";
import { useListTournaments } from "../hooks/useQueries";

// Static fallback schedule if no backend data
const STATIC_TOURNAMENTS = [
  {
    id: "duo-11am",
    tournamentType: TournamentType.duo,
    entryFee: BigInt(30),
    prize: BigInt(50),
    timeSlot: BigInt(11),
  },
  {
    id: "squad-1pm",
    tournamentType: TournamentType.squad,
    entryFee: BigInt(40),
    prize: BigInt(65),
    timeSlot: BigInt(13),
  },
  {
    id: "duo-4pm",
    tournamentType: TournamentType.duo,
    entryFee: BigInt(30),
    prize: BigInt(50),
    timeSlot: BigInt(16),
  },
  {
    id: "squad-8pm",
    tournamentType: TournamentType.squad,
    entryFee: BigInt(40),
    prize: BigInt(65),
    timeSlot: BigInt(20),
  },
];

export function HomePage() {
  const { data: tournaments, isLoading } = useListTournaments();
  const displayTournaments =
    tournaments && tournaments.length > 0 ? tournaments : STATIC_TOURNAMENTS;

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section
        data-ocid="home.section"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/assets/generated/hero-bg.dim_1920x600.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div
          className="absolute inset-0 z-1"
          style={{
            background:
              "linear-gradient(to bottom, oklch(10% 0.02 270 / 0.6) 0%, oklch(10% 0.02 270 / 0.85) 50%, oklch(10% 0.02 270) 100%)",
          }}
        />

        {/* Tactical grid overlay */}
        <div className="absolute inset-0 z-2 tactical-grid opacity-30" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/assets/generated/ar-esports-logo-transparent.dim_200x200.png"
                alt="AR Esports"
                className="w-16 h-16 object-contain drop-shadow-2xl"
              />
            </div>

            <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight mb-4 glitch-text">
              <span
                style={{ color: "oklch(65% 0.22 45)" }}
                className="fire-glow"
              >
                AR
              </span>{" "}
              <span className="text-foreground">ESPORTS</span>
            </h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="h-0.5 w-48 mx-auto mb-6"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(65% 0.22 45), transparent)",
              }}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg sm:text-2xl font-semibold tracking-widest uppercase mb-2"
              style={{ color: "oklch(75% 0.15 50)" }}
            >
              🔥 Dominate the Arena
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8"
            >
              Free Fire Max Custom Tournament Platform — Daily 2vs2 & 4vs4
              matches. Register, compete, and claim your prize!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap items-center justify-center gap-6"
            >
              {[
                { icon: <Shield className="w-4 h-4" />, label: "Custom Rooms" },
                { icon: <Users className="w-4 h-4" />, label: "Duo & Squad" },
                { icon: <Star className="w-4 h-4" />, label: "Daily Prizes" },
                { icon: <Flame className="w-4 h-4" />, label: "Free Fire Max" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "oklch(65% 0.15 50)" }}
                >
                  <span style={{ color: "oklch(65% 0.22 45)" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
        >
          <ChevronDown
            className="w-6 h-6"
            style={{ color: "oklch(65% 0.22 45 / 0.6)" }}
          />
        </motion.div>
      </section>

      {/* Tournament Schedule */}
      <section id="tournaments" className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p
            className="text-xs uppercase tracking-[0.3em] mb-2"
            style={{ color: "oklch(65% 0.22 45)" }}
          >
            Daily Schedule
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground">
            Today's Tournaments
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            4 matches every day — join and win real prizes!
          </p>
        </motion.div>

        {isLoading ? (
          <div
            data-ocid="tournaments.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-64 rounded-xl"
                style={{ background: "oklch(18% 0.025 260)" }}
              />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayTournaments.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <TournamentCard tournament={t} index={i} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </section>

      {/* How It Works */}
      <section
        className="py-16 px-4"
        style={{ background: "oklch(13% 0.02 265)" }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ color: "oklch(65% 0.22 45)" }}
            >
              Process
            </p>
            <h2 className="font-display font-extrabold text-3xl text-foreground">
              How to Join
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Sign In",
                desc: "Create account with Google/Internet Identity",
              },
              {
                step: "02",
                title: "Register",
                desc: "Fill your team details & player info",
              },
              {
                step: "03",
                title: "Pay Entry",
                desc: "Scan QR & pay entry fee via UPI",
              },
              {
                step: "04",
                title: "Play & Win",
                desc: "Get room code & compete for prize",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center p-5 rounded-xl relative"
                style={{
                  background: "oklch(16% 0.025 260)",
                  border: "1px solid oklch(28% 0.04 40 / 0.4)",
                }}
              >
                <div
                  className="font-display font-extrabold text-4xl mb-3"
                  style={{ color: "oklch(65% 0.22 45 / 0.3)" }}
                >
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p
              className="text-xs uppercase tracking-[0.3em] mb-2"
              style={{ color: "oklch(65% 0.22 45)" }}
            >
              Support
            </p>
            <h2 className="font-display font-bold text-2xl text-foreground mb-4">
              Need Help?
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              For any issues or queries, contact us on Instagram:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["@a0arsh", "@rahul373", "@arpita_gaming27"].map((handle) => (
                <a
                  key={handle}
                  href={`https://instagram.com/${handle.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="contact.instagram.link"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(55% 0.25 10), oklch(65% 0.22 45), oklch(70% 0.2 290))",
                    color: "white",
                  }}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  {handle}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-border/30 py-8 px-4"
        style={{ background: "oklch(10% 0.02 270)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/ar-esports-logo-transparent.dim_200x200.png"
                alt="AR Esports"
                className="w-6 h-6 object-contain"
              />
              <span
                className="font-display font-bold text-sm"
                style={{ color: "oklch(65% 0.22 45)" }}
              >
                AR Esports
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              All rights reserved © {new Date().getFullYear()} AR Esports |
              Arpita, Adarsh & Rahul
            </p>
            <p className="text-xs" style={{ color: "oklch(50% 0.04 50)" }}>
              Credit:{" "}
              <span style={{ color: "oklch(65% 0.22 45)" }}>Adarsh</span>
            </p>
            <p className="text-xs" style={{ color: "oklch(40% 0.03 50)" }}>
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "oklch(65% 0.22 45)" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
