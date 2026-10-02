import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export interface OpportunityCardProps {
  id: string;
  role: string;
  country: string;
  employerName: string;
  employerLogo?: string;
  salary?: string;
  contractType?: string;
  supportAvailable?: boolean;
  fundingPathway?: string;
  eligibilityScore?: number;
  className?: string;
  onClick?: () => void;
}

export function OpportunityCard({
  id,
  role,
  country,
  employerName,
  employerLogo,
  salary,
  contractType,
  supportAvailable = false,
  fundingPathway,
  eligibilityScore,
  className,
  onClick,
}: OpportunityCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden rounded-[16px] border border-line bg-paper p-6 transition-all",
        onClick && "cursor-pointer hover:border-[#2F6D53] hover:shadow-lg",
        className
      )}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={employerLogo} name={employerName} size="md" />
            <div>
              <p className="text-[13px] font-medium text-ink-soft">{employerName}</p>
              <h3 className="font-display text-[18px] font-semibold text-ink group-hover:text-[#2F6D53] transition-colors">
                {role}
              </h3>
            </div>
          </div>
          {eligibilityScore !== undefined && (
            <div className="flex flex-col items-end">
              <span className="font-display text-[22px] font-bold text-[#2F6D53]">
                {eligibilityScore}%
              </span>
              <span className="text-[10px] font-data uppercase tracking-wider text-muted-label">
                Eligibility
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="neutral" className="bg-paper">
             {country}
          </Badge>
          {salary && (
            <Badge variant="neutral" className="bg-paper">
               {salary}
            </Badge>
          )}
          {contractType && (
            <Badge variant="neutral" className="bg-paper">
               {contractType}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-4">
        {supportAvailable ? (
          <div className="flex items-center gap-2 text-[#2F6D53]">
            
            <span className="text-[13px] font-medium">
              {fundingPathway ? `Eligible for ${fundingPathway}` : "Mobility support available"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-label">
            
            <span className="text-[13px]">Self-funded relocation</span>
          </div>
        )}
      </div>
    </div>
  );
}
