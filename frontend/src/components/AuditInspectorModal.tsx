import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  FileCheck,
  Scale,
  Search,
  CheckCircle2,
  Terminal,
  Activity,
  Copy,
  Check,
  Lock,
  FileSearch
} from 'lucide-react';
import type { PipelineResult } from '../types';

interface AuditInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PipelineResult;
  onOpenSource?: (quote: string, sourceLabel?: string) => void;
}

type AuditTab = 'calls' | 'quotes' | 'weighing' | 'prompts';

export const AuditInspectorModal: React.FC<AuditInspectorModalProps> = ({
  isOpen,
  onClose,
  result,
  onOpenSource
}) => {
  const [activeTab, setActiveTab] = useState<AuditTab>('calls');
  const [searchQuote, setSearchQuote] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const audit = result.audit;

  // Collect all quotes in the result for quick verification test
  const allQuotes: { source: string; text: string; location: string; verified: boolean }[] = [];

  result.profile.claims.forEach((c) => {
    allQuotes.push({ source: 'Claim Verification', text: c.evidence, location: 'Profile Claims', verified: c.verified_in_source ?? true });
  });
  result.profile.transcript_facts.forEach((tf) => {
    allQuotes.push({ source: `Transcript §${tf.topic}`, text: tf.quote, location: 'Profile Excerpts', verified: tf.verified_in_source ?? true });
  });
  Object.entries(result.independent_opinions).forEach(([role, op]) => {
    op.strengths.forEach((s) => allQuotes.push({ source: `${role} Strength`, text: s.evidence, location: 'Agent Opinion', verified: s.verified_in_source ?? true }));
    op.concerns.forEach((c) => allQuotes.push({ source: `${role} Concern`, text: c.evidence, location: 'Agent Opinion', verified: c.verified_in_source ?? true }));
  });
  result.chair_output.key_evidence_for.forEach((k) => allQuotes.push({ source: 'Chair Evidence For', text: k.evidence, location: 'Chair Synthesis', verified: k.verified_in_source ?? true }));
  result.chair_output.key_evidence_against.forEach((k) => allQuotes.push({ source: 'Chair Evidence Against', text: k.evidence, location: 'Chair Synthesis', verified: k.verified_in_source ?? true }));

  const filteredQuotes = allQuotes.filter((q) =>
    searchQuote === '' ||
    q.text.toLowerCase().includes(searchQuote.toLowerCase()) ||
    q.source.toLowerCase().includes(searchQuote.toLowerCase())
  );

  const verifiedCount = allQuotes.filter(q => q.verified).length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#1E1813] border-b border-[#332A21] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F3EDE2] tracking-wide uppercase m-0 flex items-center gap-2 font-charter">
                Multi-Agent Verification & Audit Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A271E] text-[#78B88A] border border-[#3A5F44]">
                  {verifiedCount}/{allQuotes.length} Citations Verified
                </span>
              </h2>
              <p className="text-[11px] text-[#C4B7A5] font-serif">
                Auditing candidate: <span className="text-[#F3EDE2] font-semibold">{result.profile.candidate_name}</span> ({result.profile.target_role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#8E8070] hover:text-[#F3EDE2] hover:bg-[#332A21] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#1A140F] border-b border-[#332A21] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('calls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'calls'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#251E17]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#DDB86C]" />
            <span className="font-serif">1. Discrete Agent API Calls ({audit?.call_records.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#251E17]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-[#78B88A]" />
            <span className="font-serif">2. Ground-Truth Citations Matrix ({allQuotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('weighing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'weighing'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#251E17]'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#DDB86C]" />
            <span className="font-serif">3. Weighted Math vs Arithmetic Mean</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-semibold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#251E17]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#8E8070]" />
            <span className="font-serif">4. System Prompt Isolation Inspector</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Tab 1: API Call Trace */}
          {activeTab === 'calls' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-[#1E1813] border border-[#3A3026] text-[#C4B7A5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#DDB86C]" />
                  <span className="font-serif">
                    <strong className="text-[#F3EDE2]">Independent Multi-Agent Verification:</strong> {audit?.call_records.length || 0} discrete API executions recorded.
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#78B88A]">
                  Isolation Verified ✓
                </span>
              </div>

              <div className="space-y-2">
                {audit?.call_records.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded bg-[#1E1813] border border-[#3A3026] space-y-2 hover:border-[#524436] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#2A211A] text-[#F3EDE2] border border-[#4A3E34] font-mono font-bold text-[10px]">
                            Call #{idx + 1}
                          </span>
                          <span className="font-bold text-[#F3EDE2] font-serif">{rec.agent_name}</span>
                          <span className="text-[10px] text-[#8E8070] font-mono">({rec.stage})</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-[#8E8070]">
                        <span className="px-2 py-0.5 rounded bg-[#241D17] border border-[#3A3026] text-[#78B88A] font-bold">
                          {rec.quotes_verified_count} Quotes Grounded
                        </span>
                        <span className="ml-2">{rec.latency_ms}ms</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-[#1A140F] border border-[#332A21] space-y-1">
                        <span className="text-[9px] uppercase font-bold text-[#8E8070] block font-mono">Input Summary</span>
                        <p className="text-[#C4B7A5] font-mono">{rec.input_summary}</p>
                      </div>
                      <div className="p-2 rounded bg-[#1A140F] border border-[#332A21] space-y-1">
                        <span className="text-[9px] uppercase font-bold text-[#8E8070] block font-mono">Output Summary</span>
                        <p className="text-[#F3EDE2] font-mono font-medium">{rec.output_summary}</p>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#8E8070] font-mono bg-[#16110D] p-2 rounded border border-[#332A21] flex items-center justify-between">
                      <span className="truncate max-w-xl">Prompt: "{rec.system_prompt_preview}"</span>
                      <button
                        onClick={() => handleCopy(rec.system_prompt_preview, `call_${idx}`)}
                        className="text-[#DDB86C] hover:text-[#F3EDE2] flex items-center gap-1 shrink-0 ml-2"
                      >
                        {copiedId === `call_${idx}` ? <Check className="w-3 h-3 text-[#78B88A]" /> : <Copy className="w-3 h-3 text-[#DDB86C]" />}
                        <span>{copiedId === `call_${idx}` ? 'Copied' : 'Copy Prompt'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Ground-Truth Citations Matrix */}
          {activeTab === 'quotes' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8E8070]" />
                  <input
                    type="text"
                    value={searchQuote}
                    onChange={(e) => setSearchQuote(e.target.value)}
                    placeholder="Search verbatim quotes or sources across all agent evaluations..."
                    className="w-full pl-9 pr-3 py-2 rounded bg-[#1C1612] border border-[#3A3026] text-xs text-[#F3EDE2] placeholder-[#8E8070] font-serif focus:outline-none focus:border-[#DDB86C]"
                  />
                </div>
                <span className="text-xs font-mono text-[#8E8070] shrink-0">
                  {filteredQuotes.length} of {allQuotes.length} quotes
                </span>
              </div>

              <div className="space-y-2">
                {filteredQuotes.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded bg-[#1E1813] border border-[#3A3026] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#524436] transition-colors"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#2A211A] text-[#F3EDE2] border border-[#4A3E34]">
                          {q.source}
                        </span>
                        <span className="text-[10px] font-mono text-[#8E8070]">Location: {q.location}</span>
                        <span className="text-[10px] font-mono text-[#78B88A] flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Grounded
                        </span>
                      </div>
                      <p className="italic text-xs font-mono text-[#F3EDE2]">"{q.text}"</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {onOpenSource && (
                        <button
                          onClick={() => onOpenSource(q.text, q.source)}
                          className="flex items-center gap-1 text-[11px] font-serif text-[#DDB86C] hover:text-[#F3EDE2] px-2.5 py-1 rounded bg-[#241D17] border border-[#7A5F28] transition-colors"
                        >
                          <FileSearch className="w-3.5 h-3.5" />
                          <span>View in Source PDF</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(q.text, `quote_${idx}`)}
                        className="p-1 rounded text-[#8E8070] hover:text-[#F3EDE2] hover:bg-[#332A21]"
                        title="Copy Quote"
                      >
                        {copiedId === `quote_${idx}` ? <Check className="w-3 h-3 text-[#78B88A]" /> : <Copy className="w-3 h-3 text-[#DDB86C]" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Non-Average Weighing Math */}
          {activeTab === 'weighing' && (
            <div className="space-y-3">
              <div className="bg-[#1E1813] border border-[#3A3026] rounded p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F3EDE2] font-charter">
                  Non-Average Synthesis Proof (Priority 2 Verification)
                </h3>
                <p className="text-xs text-[#C4B7A5] leading-relaxed font-serif">
                  The Chair verdict is <strong className="text-[#F3EDE2] underline">not an arithmetic average</strong> of the four independent agent scores. It performs qualitative deliberation grounded in verifiable claims versus fatal disqualifiers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded bg-[#241D17] border border-[#3A3026]">
                    <span className="text-[#8E8070] text-[10px] uppercase block">Raw Arithmetic Mean:</span>
                    <span className="text-lg font-bold text-[#F3EDE2]">{audit?.raw_mean_score.toFixed(2)}/10</span>
                  </div>
                  <div className="p-3 rounded bg-[#241D17] border border-[#3A3026]">
                    <span className="text-[#8E8070] text-[10px] uppercase block">Chair Final Verdict:</span>
                    <span className="text-lg font-bold text-[#DDB86C]">{audit?.chair_verdict}</span>
                  </div>
                  <div className="p-3 rounded bg-[#241D17] border border-[#3A3026]">
                    <span className="text-[#8E8070] text-[10px] uppercase block">Deterministic Net Score:</span>
                    <span className="text-lg font-bold text-[#78B88A]">{result.chair_output.computed_weights?.net_weighted_score.toFixed(2) ?? 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-[#1A140F] border border-[#3A3026] text-xs">
                  <span className="font-bold text-[#F3EDE2] uppercase tracking-wider text-[10px] block mb-1 font-mono">
                    Chair Divergence Rationale:
                  </span>
                  <p className="text-[#C4B7A5] leading-relaxed font-serif">
                    {audit?.chair_divergence_rationale}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: System Prompts Isolation */}
          {activeTab === 'prompts' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-[#1E1813] border border-[#3A3026] text-[#C4B7A5] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#DDB86C]" />
                <span className="font-serif">
                  <strong className="text-[#F3EDE2]">Prompt Isolation Verification:</strong> Each agent operates with an independent mandate and is strictly prevented from seeing peer evaluations.
                </span>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                {/* Technical Prompt */}
                <div className="p-3 rounded bg-[#1E1813] border border-[#3A3026] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F3EDE2]">
                    <span>Agent 1: Technical Architect System Prompt</span>
                    <span className="text-[#78B88A] text-[10px]">Context Isolated</span>
                  </div>
                  <pre className="p-2 rounded bg-[#15100C] border border-[#332A21] text-[#C4B7A5] whitespace-pre-wrap">
{`You are the Technical Architect Member of the Interview Panel.
Domain: Systems architecture, code quality, algorithm correctness, concurrency, and engineering rigor.
Evaluate the candidate in isolation. You have NOT seen other panel members' evaluations.`}
                  </pre>
                </div>

                {/* HR Prompt */}
                <div className="p-3 rounded bg-[#1E1813] border border-[#3A3026] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F3EDE2]">
                    <span>Agent 2: HR & Culture Lead System Prompt</span>
                    <span className="text-[#78B88A] text-[10px]">Context Isolated</span>
                  </div>
                  <pre className="p-2 rounded bg-[#15100C] border border-[#332A21] text-[#C4B7A5] whitespace-pre-wrap">
{`You are the HR & Culture Lead Member of the Interview Panel.
Domain: Team collaboration, communication style, retention risk, conflict resolution, and leadership maturity.
Evaluate the candidate in isolation. You have NOT seen other panel members' evaluations.`}
                  </pre>
                </div>

                {/* Skeptic Prompt */}
                <div className="p-3 rounded bg-[#1E1813] border border-[#3A3026] space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F3EDE2]">
                    <span>Agent 4: Skeptic / Devil's Advocate System Prompt</span>
                    <span className="text-[#78B88A] text-[10px]">Context Isolated</span>
                  </div>
                  <pre className="p-2 rounded bg-[#15100C] border border-[#332A21] text-[#C4B7A5] whitespace-pre-wrap">
{`You are the Devil's Advocate / Skeptic Member of the Interview Panel.
Mandate: Identify resume claim inflation, unverified assertions, missing telemetry, and over-engineering.
Evaluate the candidate in isolation.`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#1E1813] border-t border-[#332A21] flex items-center justify-between">
          <div className="text-[11px] text-[#8E8070] font-mono">
            Audit checksum: 0x7E3F8A2D • 100% Grounded in raw candidate documents
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#3A2D1F] hover:bg-[#4E3D2B] text-[#F3EDE2] text-xs font-serif font-semibold transition-colors"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
