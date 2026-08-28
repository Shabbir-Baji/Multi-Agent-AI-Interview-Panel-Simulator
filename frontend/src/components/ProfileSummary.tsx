import React, { useState } from 'react';
import {
  Briefcase,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Quote,
  FileSearch,
  ShieldAlert
} from 'lucide-react';
import type { CandidateProfile } from '../types';

interface ProfileSummaryProps {
  profile: CandidateProfile;
  onOpenSource?: (quote: string, sourceLabel?: string) => void;
}

export const ProfileSummary: React.FC<ProfileSummaryProps> = ({ profile, onOpenSource }) => {
  const displayName = profile.candidate_full_name || profile.candidate_name || "Candidate";
  const initials = displayName.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 3).toUpperCase();

  const [openSections, setOpenSections] = useState({
    skills: true,
    claims: true,
    resume: true,
    transcript: true,
    gaps: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    setOpenSections({ skills: true, claims: true, resume: true, transcript: true, gaps: true });
  };

  const collapseAll = () => {
    setOpenSections({ skills: false, claims: false, resume: false, transcript: false, gaps: false });
  };

  return (
    <div className="space-y-4">
      {/* Candidate Header Dossier Card */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded bg-[#2A211A] border border-[#4A3E34] flex items-center justify-center text-[#DDB86C] font-bold text-lg font-charter shadow-inner">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-[#F3EDE2] tracking-wide font-charter">
                  {displayName}
                </h2>
                <span className="px-2.5 py-0.5 rounded text-xs font-serif font-medium bg-[#1E1813] text-[#F3EDE2] border border-[#3A3026] flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-[#DDB86C]" />
                  {profile.target_role}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#DDB86C]" />
                  {profile.experience_years} Years Experience
                </span>
              </div>
              <p className="text-xs text-[#8E8070] mt-1 font-serif">
                Archival Evaluation Dossier • {profile.skills.length} Competencies Verified • {profile.claims.length} Claims Cross-Examined
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={expandAll}
              className="text-xs text-[#C4B7A5] hover:text-[#F3EDE2] px-2.5 py-1 rounded bg-[#1E1813] border border-[#3A3026] hover:bg-[#2A211A] transition-colors font-serif"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-[#C4B7A5] hover:text-[#F3EDE2] px-2.5 py-1 rounded bg-[#1E1813] border border-[#3A3026] hover:bg-[#2A211A] transition-colors font-serif"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Priority 6: Anti-Gaming / Prompt-Injection Warning if flagged */}
        {profile.prompt_injection_detected && (
          <div className="mt-3.5 p-3 rounded bg-[#2C1818] border border-[#6B3030] text-xs text-[#E27D7D] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#E27D7D] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#E27D7D] block font-mono">
                Security Alert: Evaluator Manipulation Pattern Flagged
              </span>
              <p className="font-mono text-[11px] mt-0.5 text-[#F3EDE2]">
                Transcript contains adversarial text attempting to manipulate automated scoring. Instruction was intercepted and quarantined; not used as evaluative signal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Structured Sections */}
      <div className="space-y-3">
        {/* 1. Core Skills */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => toggleSection('skills')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2A211A] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F3EDE2] uppercase tracking-wider font-charter">
                1. Extracted Technical Skills & Tooling
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026]">
                {profile.skills.length}
              </span>
              {openSections.skills ? <ChevronUp className="w-4 h-4 text-[#8C7355]" /> : <ChevronDown className="w-4 h-4 text-[#8C7355]" />}
            </div>
          </button>

          {openSections.skills && (
            <div className="px-4 pb-4 pt-1 border-t border-[#332A21]">
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#1E1813] text-[#F3EDE2] border border-[#3A3026]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Key Claims & Verification */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => toggleSection('claims')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2A211A] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#DDB86C]" />
              <span className="text-xs font-bold text-[#F3EDE2] uppercase tracking-wider font-charter">
                2. Resume Claims & Evidence Verification
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026]">
                {profile.claims.length} Claims
              </span>
              {openSections.claims ? <ChevronUp className="w-4 h-4 text-[#8C7355]" /> : <ChevronDown className="w-4 h-4 text-[#8C7355]" />}
            </div>
          </button>

          {openSections.claims && (
            <div className="px-4 pb-4 pt-1 border-t border-[#332A21] space-y-2.5">
              {profile.claims.map((claim, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded border ${
                    claim.verified
                      ? 'bg-[#1E1813] border-[#3A3026]'
                      : 'bg-[#2C1818] border-[#6B3030]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2">
                      {claim.verified ? (
                        <CheckCircle2 className="w-4 h-4 text-[#78B88A] shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#E27D7D] shrink-0 mt-0.5" />
                      )}
                      <span className="text-xs font-medium text-[#F3EDE2] leading-snug font-serif">
                        {claim.claim}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                        claim.verified
                          ? 'bg-[#1A271E] text-[#78B88A] border border-[#3A5F44]'
                          : 'bg-[#241D17] text-[#E27D7D] border border-[#6B3030]'
                      }`}
                    >
                      {claim.verified ? 'Verified' : 'Flagged / Overstated'}
                    </span>
                  </div>

                  <div
                    onClick={() => onOpenSource && onOpenSource(claim.evidence, claim.citation_source || "Claim Verification")}
                    className={`quote-box ${claim.verified ? 'quote-box-emerald' : 'quote-box-rose'} ${onOpenSource ? 'cursor-pointer hover:border-[#F3EDE2] transition-colors' : ''}`}
                    title={onOpenSource ? "Click to view highlighted in source document" : undefined}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center justify-between opacity-90">
                      <span className="flex items-center gap-1">
                        <Quote className="w-2.5 h-2.5" />
                        Ground Truth Citation
                      </span>
                      {onOpenSource && (
                        <span className="text-[9px] font-mono flex items-center gap-1">
                          <FileSearch className="w-2.5 h-2.5" /> Click to view source
                        </span>
                      )}
                    </div>
                    <p className="italic text-xs font-mono">"{claim.evidence}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Resume Facts */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => toggleSection('resume')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2A211A] transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#DDB86C]" />
              <span className="text-xs font-bold text-[#F3EDE2] uppercase tracking-wider font-charter">
                3. Extracted Resume Facts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026]">
                {profile.resume_facts.length} Facts
              </span>
              {openSections.resume ? <ChevronUp className="w-4 h-4 text-[#8C7355]" /> : <ChevronDown className="w-4 h-4 text-[#8C7355]" />}
            </div>
          </button>

          {openSections.resume && (
            <div className="px-4 pb-4 pt-1 border-t border-[#332A21] grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {profile.resume_facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="bg-[#1E1813] border border-[#3A3026] rounded p-3 flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#2A211A] text-[#C4B7A5] border border-[#4A3E34] mb-1.5">
                      {fact.category}
                    </span>
                    <p className="text-xs font-medium text-[#F3EDE2] mb-2 font-serif">
                      {fact.detail}
                    </p>
                  </div>
                  <div
                    onClick={() => onOpenSource && onOpenSource(fact.quote, "Resume Excerpt")}
                    className={`quote-box quote-box-neutral ${onOpenSource ? 'cursor-pointer hover:border-[#F3EDE2] transition-colors' : ''}`}
                    title={onOpenSource ? "Click to view highlighted in source document" : undefined}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] uppercase font-bold text-[#8E8070]">Resume Quote</span>
                      {onOpenSource && <FileSearch className="w-2.5 h-2.5 text-[#8C7355]" />}
                    </div>
                    <p className="italic text-[11px] font-mono">"{fact.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Interview Transcript Excerpts */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => toggleSection('transcript')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2A211A] transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#DDB86C]" />
              <span className="text-xs font-bold text-[#F3EDE2] uppercase tracking-wider font-charter">
                4. Verbatim Interview Transcript Excerpts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026]">
                {profile.transcript_facts.length} Excerpts
              </span>
              {openSections.transcript ? <ChevronUp className="w-4 h-4 text-[#8C7355]" /> : <ChevronDown className="w-4 h-4 text-[#8C7355]" />}
            </div>
          </button>

          {openSections.transcript && (
            <div className="px-4 pb-4 pt-1 border-t border-[#332A21] space-y-2.5">
              {profile.transcript_facts.map((tf, idx) => (
                <div key={idx} className="bg-[#1E1813] border border-[#3A3026] rounded p-3.5">
                  <div className="text-xs font-bold text-[#C4B7A5] uppercase tracking-wide font-mono mb-1">
                    Section: {tf.topic}
                  </div>
                  <p className="text-xs text-[#C4B7A5] mb-2 font-serif">{tf.detail}</p>
                  <div
                    onClick={() => onOpenSource && onOpenSource(tf.quote, `Transcript §${tf.topic}`)}
                    className={`quote-box ${onOpenSource ? 'cursor-pointer hover:border-[#DDB86C] transition-colors' : ''}`}
                    title={onOpenSource ? "Click to view highlighted in source document" : undefined}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#DDB86C] mb-0.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Quote className="w-2.5 h-2.5" />
                        Direct Candidate Answer
                      </span>
                      {onOpenSource && (
                        <span className="text-[9px] font-mono text-[#DDB86C] flex items-center gap-1">
                          <FileSearch className="w-2.5 h-2.5" /> View in transcript
                        </span>
                      )}
                    </div>
                    <p className="italic text-xs font-mono text-[#F3EDE2]">"{tf.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Gaps / Caveats */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => toggleSection('gaps')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#2A211A] transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#8C7355]" />
              <span className="text-xs font-bold text-[#F3EDE2] uppercase tracking-wider font-charter">
                5. Identified Profile Gaps & Risks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026]">
                {profile.gaps_missing_info.length} Gaps
              </span>
              {openSections.gaps ? <ChevronUp className="w-4 h-4 text-[#8C7355]" /> : <ChevronDown className="w-4 h-4 text-[#8C7355]" />}
            </div>
          </button>

          {openSections.gaps && (
            <div className="px-4 pb-4 pt-1 border-t border-[#332A21] space-y-2.5">
              {profile.gaps_missing_info.map((g, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    g.is_security_flag ? 'bg-[#2C1818] border-[#6B3030]' : 'bg-[#1E1813] border-[#3A3026]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-[#F3EDE2] font-serif">
                    {g.is_security_flag ? (
                      <ShieldAlert className="w-4 h-4 text-[#E27D7D] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#DDB86C] shrink-0" />
                    )}
                    <span>{g.gap}</span>
                  </div>
                  <div className="quote-box quote-box-neutral md:max-w-md">
                    <span className="text-[9px] uppercase font-bold text-[#8E8070] block mb-0.5">Impact Assessment</span>
                    <p className="text-xs font-mono">{g.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
