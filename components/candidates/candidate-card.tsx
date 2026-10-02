import clsx from "clsx";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/matching/match-score";

export interface CandidateCardProps {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  avatarUrl?: string;
  matchScore?: number;
  matchLabel?: string;
  skills?: string[];
  experienceYears?: number;
  verificationStatus?: "verified" | "pending" | "not_started";
  className?: string;
  onClick?: () => void;
}

export function CandidateCard({
  id,
  name,
  headline,
  location,
  avatarUrl,
  matchScore,
  matchLabel,
  skills = [],
  experienceYears = 0,
  verificationStatus = "not_started",
  className,
  onClick,
}: CandidateCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative overflow-hidden rounded-[14px] border border-line bg-paper p-5 transition-all",
        onClick && "cursor-pointer hover:border-accent hover:shadow-md",
        className
      )}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar src={avatarUrl} name={name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-[16px] text-ink">
                {name}
              </h3>
              {verificationStatus === "verified" && (null)}
            </div>
            {headline && (
              <p className="mt-0.5 text-[14px] text-ink-soft">{headline}</p>
            )}
            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-label">
                
                {location}
              </p>
            )}
          </div>
        </div>

        {matchScore !== undefined && (
          <div className="shrink-0 text-right">
            <MatchScore score={matchScore} label={matchLabel} size="sm" />
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
        <div>
          <span className="block font-data text-[11.5px] uppercase tracking-wider text-muted-label">
            Experience
          </span>
          <p className="mt-1 font-medium text-[14px] text-ink">
            {experienceYears} {experienceYears === 1 ? "year" : "years"}
          </p>
        </div>
        <div>
          <span className="block font-data text-[11.5px] uppercase tracking-wider text-muted-label">
            Top Skills
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="neutral" size="sm">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <span className="text-[12px] text-muted-label flex items-center pl-1">
                +{skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
