import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TeamMember } from "../backend";

interface TeamFormProps {
  members: Partial<TeamMember>[];
  onChange: (index: number, field: keyof TeamMember, value: string) => void;
  count: number;
}

export function TeamForm({ members, onChange, count }: TeamFormProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, i) => i).map((i) => (
        <div
          key={`member-${i}`}
          data-ocid={`team.member.card.${i + 1}`}
          className="rounded-xl p-4 sm:p-5 space-y-4"
          style={{
            background: "oklch(18% 0.025 260)",
            border: "1px solid oklch(28% 0.04 40 / 0.5)",
          }}
        >
          <h4
            className="font-display font-bold text-sm uppercase tracking-wider"
            style={{ color: "oklch(65% 0.22 45)" }}
          >
            Player {i + 1} {i === 0 ? "(Team Leader)" : ""}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                FF Max UID *
              </Label>
              <Input
                data-ocid={`team.player${i + 1}.ffuid.input`}
                type="number"
                placeholder="Enter FF UID"
                value={
                  members[i]?.ffUID !== undefined
                    ? String(members[i].ffUID)
                    : ""
                }
                onChange={(e) => onChange(i, "ffUID", e.target.value)}
                className="h-9 text-sm bg-input border-border/50 focus:border-fire-orange/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Game Name *
              </Label>
              <Input
                data-ocid={`team.player${i + 1}.gamename.input`}
                placeholder="In-game name"
                value={members[i]?.gameName || ""}
                onChange={(e) => onChange(i, "gameName", e.target.value)}
                className="h-9 text-sm bg-input border-border/50 focus:border-fire-orange/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Phone Number *
              </Label>
              <Input
                data-ocid={`team.player${i + 1}.phone.input`}
                type="tel"
                placeholder="10-digit mobile"
                value={members[i]?.phoneNumber || ""}
                onChange={(e) => onChange(i, "phoneNumber", e.target.value)}
                className="h-9 text-sm bg-input border-border/50 focus:border-fire-orange/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input
                data-ocid={`team.player${i + 1}.email.input`}
                type="email"
                placeholder="email@example.com"
                value={members[i]?.email || ""}
                onChange={(e) => onChange(i, "email", e.target.value)}
                className="h-9 text-sm bg-input border-border/50 focus:border-fire-orange/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Age *</Label>
              <Input
                data-ocid={`team.player${i + 1}.age.input`}
                type="number"
                placeholder="Age"
                min="10"
                max="60"
                value={
                  members[i]?.age !== undefined ? String(members[i].age) : ""
                }
                onChange={(e) => onChange(i, "age", e.target.value)}
                className="h-9 text-sm bg-input border-border/50 focus:border-fire-orange/50"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
