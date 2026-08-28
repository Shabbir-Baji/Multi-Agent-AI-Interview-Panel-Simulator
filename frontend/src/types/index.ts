export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type RecommendationType = 'Strong Hire' | 'Hire' | 'Lean No' | 'No Hire';

export type AgentRole = 'Technical' | 'HR' | 'HiringManager' | 'Skeptic';

export type ReactionType = 'agree' | 'disagree' | 'partially_agree';

export type DebateStanceShiftType = 'HELD POSITION' | 'PARTIALLY SHIFTED' | 'STANCE SHIFTED';

export type EvidenceStrength = 'direct_statement' | 'inferred' | 'single_data_point' | 'contradicted_elsewhere';

export type RequirementStatus = 'met' | 'partially_met' | 'not_addressed' | 'contradicted';

export interface EvidenceItem {
  point: string;
  evidence: string;
  evidence_strength?: EvidenceStrength;
  strength_justification?: string;
  citation_source?: string;
  verified_in_source?: boolean;
  match_confidence?: number;
}

export interface RequirementEvaluation {
  requirement: string;
  status: RequirementStatus;
  evidence?: string | null;
  points: number;
}

export interface ClaimItem {
  claim: string;
  evidence: string;
  verified: boolean;
  citation_source?: string;
  verified_in_source?: boolean;
}

export interface ResumeFact {
  category: string;
  detail: string;
  quote: string;
  verified_in_source?: boolean;
}

export interface TranscriptFact {
  topic: string;
  detail: string;
  quote: string;
  verified_in_source?: boolean;
}

export interface GapInfo {
  gap: string;
  impact: string;
  is_security_flag?: boolean;
}

export interface CandidateProfile {
  candidate_name: string;
  candidate_full_name?: string;
  target_role: string;
  experience_years: number;
  skills: string[];
  claims: ClaimItem[];
  resume_facts: ResumeFact[];
  transcript_facts: TranscriptFact[];
  gaps_missing_info: GapInfo[];
  prompt_injection_detected?: boolean;
}

export interface AgentOpinion {
  score: number;
  confidence: ConfidenceLevel;
  strengths: EvidenceItem[];
  concerns: EvidenceItem[];
  unknowns: string[];
  summary: string;
  invoked_at?: string;
  execution_order?: number;
  isolated_context_verified?: boolean;
  requirement_breakdown?: RequirementEvaluation[];
  repeated_runs?: number[];
  consistency_note?: string;
}

export interface OpinionState {
  score: number;
  stance: string;
}

export interface DebateTurn {
  round: number;
  agent: AgentRole;
  target_agent: string;
  claim_being_addressed: string;
  steelman: string;
  counter_evidence?: string | null;
  target_point_quote: string;
  reaction: ReactionType;
  stance_shift_type: DebateStanceShiftType;
  opinion_before: OpinionState;
  saw: string[];
  reasoning: string;
  opinion_after: OpinionState;
  changed: boolean;
  change_reason?: string | null;
}

export interface UnresolvedDisagreement {
  topic: string;
  agents_involved: string[];
  why_unresolved: string;
  turn_reference?: number;
}

export interface AgentWeightContribution {
  agent_name: string;
  raw_score: number;
  confidence: string;
  confidence_multiplier: number;
  strengths_weighted: number;
  concerns_weighted: number;
  contested_penalty: number;
  net_agent_score: number;
  flags: string[];
}

export interface ComputedWeightsTable {
  agent_breakdowns: AgentWeightContribution[];
  total_weighted_for: number;
  total_weighted_against: number;
  net_weighted_score: number;
  raw_arithmetic_mean: number;
  divergence_delta: number;
  mathematical_formula: string;
  recommends_verdict: string;
}

export type SensitivityStatus = 'unverified' | 'contested' | 'single_data_point' | 'weakly_evidenced';
export type ResolvedAsType = 'confirmed' | 'disproven';

export interface VerdictSensitivityItem {
  factor: string;
  current_status: SensitivityStatus;
  current_weight_contribution: number;
  if_resolved_as: ResolvedAsType;
  projected_verdict_shift: string;
  how_to_resolve: string;
  source_quote?: string;
  source_label?: string;
}

export interface ChairOutput {
  final_recommendation: RecommendationType;
  confidence: ConfidenceLevel;
  confidence_cap_reason?: string | null;
  reasoning_steps: string[];
  key_evidence_for: EvidenceItem[];
  key_evidence_against: EvidenceItem[];
  unresolved_disagreements: UnresolvedDisagreement[];
  missing_info_caveats: string[];
  computed_weights?: ComputedWeightsTable;
  verdict_sensitivity?: VerdictSensitivityItem[];
}

export interface AgentCallRecord {
  call_id: string;
  stage: string;
  agent_name: string;
  system_prompt_preview: string;
  input_summary: string;
  output_summary: string;
  latency_ms: number;
  quotes_verified_count: number;
}

export interface PipelineAudit {
  total_api_calls: number;
  independent_calls_count: number;
  debate_calls_count: number;
  chair_calls_count: number;
  raw_mean_score: number;
  chair_verdict: string;
  chair_divergence_rationale: string;
  pre_debate_score_variance?: number;
  panel_agreement_level?: string;
  total_citations_count?: number;
  verified_citations_count?: number;
  unverified_citations_count?: number;
  call_records: AgentCallRecord[];
  raw_transcript_text: string;
  raw_resume_text: string;
}

export interface PipelineResult {
  candidate_id: string;
  profile: CandidateProfile;
  independent_opinions: Record<string, AgentOpinion>;
  debate_log: DebateTurn[];
  chair_output: ChairOutput;
  pre_debate_score_variance?: number;
  panel_agreement_level?: 'High' | 'Medium' | 'Low';
  audit?: PipelineAudit;
}

export interface PipelineStageEvent {
  stage: number;
  name: string;
  progress: number;
  result?: PipelineResult;
}

export interface CandidateComparisonCandidate {
  name: string;
  role: string;
  recommendation: RecommendationType;
  confidence: ConfidenceLevel;
  top_strengths: EvidenceItem[];
  top_concerns: EvidenceItem[];
}

export interface ComparisonData {
  candidate_a: CandidateComparisonCandidate;
  candidate_b: CandidateComparisonCandidate;
  calibration_verified?: boolean;
  shared_requirements?: string[];
  synthesized_recommendation: string;
  primary_differentiator: string;
}
