"use client";

import { Badge } from "@/components/ui/badge";
import { Status } from "@/components/ui/status";
import type { CandidateProfileMatchData } from "@/lib/data";

interface CareerPassportProps {
  profile: CandidateProfileMatchData & {
    name: string;
    headline?: string;
    about?: string;
    experienceYears?: number;
    education?: string[];
    certifications?: string[];
    languages?: string[];
    verified?: boolean;
    verificationType?: string[];
  };
  isRecruiterView?: boolean;
}

export function CareerPassport({ profile, isRecruiterView = false }: CareerPassportProps) {
  return (
    <div className="rounded-[16px] border border-line bg-paper overflow-hidden">
      {/* Header section */}
      <div className="bg-[#1A1A1A] p-5 md:p-8 text-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] bg-[length:20px_20px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display text-[32px] font-bold tracking-tight">{profile.name}</h2>
              {profile.verified && (
                <span className="flex items-center gap-1.5 rounded-full bg-[#2E7D32]/20 px-2.5 py-1 text-[12px] font-medium text-[#4CAF50] border border-[#2E7D32]/30">
                  
                  Verified Identity
                </span>
              )}
            </div>
            {profile.headline && (
              <p className="text-[18px] text-[#A1A1AA] max-w-[600px]">{profile.headline}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.location && (
                <span className="flex items-center gap-1.5 text-[14px] text-[#D4D4D8]">
                  
                  {profile.location}
                </span>
              )}
              {profile.experienceYears !== undefined && (
                <span className="flex items-center gap-1.5 text-[14px] text-[#D4D4D8]">
                  
                  {profile.experienceYears} Years Experience
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <span className="block text-[11px] font-data uppercase tracking-wider text-[#A1A1AA] mb-1">
                Readiness Score
              </span>
              <span className="font-display text-[36px] font-bold text-accent leading-none">
                {profile.readiness_score}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body sections */}
      <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        <div className="md:col-span-2 space-y-10">
          {profile.about && (
            <section>
              <h3 className="font-display font-semibold text-[18px] mb-3">About</h3>
              <p className="text-[15px] text-ink-soft leading-relaxed whitespace-pre-wrap">
                {profile.about}
              </p>
            </section>
          )}

          <section>
            <h3 className="font-display font-semibold text-[18px] mb-4">Skills & Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map(skill => (
                <Badge key={skill} variant="neutral" className="bg-paper px-3 py-1.5 text-[14px]">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          {profile.education && profile.education.length > 0 && (
            <section>
              <h3 className="font-display font-semibold text-[18px] mb-4">Education</h3>
              <ul className="space-y-4">
                {profile.education.map((edu, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center shrink-0 border border-line">
                      
                    </div>
                    <div>
                      <p className="font-medium text-[15px]">{edu}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section className="rounded-[12px] bg-paper p-5 border border-line">
            <h3 className="font-data text-[12px] uppercase tracking-wider text-muted-label mb-4">
              Preferences
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-[13px] text-ink-soft mb-1.5">Work Arrangement</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.work_preferences?.map(pref => (
                    <span key={pref} className="capitalize text-[13px] font-medium bg-white border border-line rounded px-2 py-0.5">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[13px] text-ink-soft mb-1.5">Employment Type</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.employment_types?.map(type => (
                    <span key={type} className="capitalize text-[13px] font-medium bg-white border border-line rounded px-2 py-0.5">
                      {type.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {profile.languages && profile.languages.length > 0 && (
            <section>
              <h3 className="font-data text-[12px] uppercase tracking-wider text-muted-label mb-3">
                Languages
              </h3>
              <div className="space-y-2">
                {profile.languages.map(lang => (
                  <div key={lang} className="flex items-center justify-between text-[14px]">
                    <span className="font-medium">{lang}</span>
                    <Status status="verified" showDot={false} className="text-[11px]" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {profile.certifications && profile.certifications.length > 0 && (
            <section>
              <h3 className="font-data text-[12px] uppercase tracking-wider text-muted-label mb-3">
                Certifications
              </h3>
              <ul className="space-y-2">
                {profile.certifications.map(cert => (
                  <li key={cert} className="text-[14px] flex items-start gap-2">
                    
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isRecruiterView && profile.verificationType && (
            <section className="rounded-[12px] bg-accent-soft p-5 border border-accent/20">
              <h3 className="font-data text-[12px] uppercase tracking-wider text-accent-dark mb-3">
                Verified Claims
              </h3>
              <ul className="space-y-2">
                {profile.verificationType.map(type => (
                  <li key={type} className="text-[13px] font-medium text-accent-dark flex items-center gap-2 capitalize">
                     {type.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
