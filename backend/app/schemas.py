from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field

EvidenceStrength = Literal["direct_statement", "inferred", "single_data_point", "contradicted_elsewhere"]
RequirementStatus = Literal["met", "partially_met", "not_addressed", "contradicted"]

class EvidenceItem(BaseModel):
    point: str = Field(..., description="The main claim or finding point")
    evidence: str = Field(..., description="Exact supporting quote from transcript or resume")
    evidence_strength: EvidenceStrength = "direct_statement"
    strength_justification: Optional[str] = None
    citation_source: Optional[str] = None
    verified_in_source: bool = True
    match_confidence: Optional[float] = 1.0

class RequirementEvaluation(BaseModel):
    requirement: str
    status: RequirementStatus
    evidence: Optional[str] = None
    points: float = 0.0

class ClaimItem(BaseModel):
    claim: str
    evidence: str
    verified: bool
    citation_source: Optional[str] = None
    verified_in_source: bool = True

class ResumeFact(BaseModel):
    category: str
    detail: str
    quote: str
    verified_in_source: bool = True

class TranscriptFact(BaseModel):
    topic: str
    detail: str
    quote: str
    verified_in_source: bool = True

class GapInfo(BaseModel):
    gap: str
    impact: str
    is_security_flag: bool = False

class CandidateProfile(BaseModel):
    candidate_name: str
    candidate_full_name: Optional[str] = None
    target_role: str
    experience_years: int
    skills: List[str]
    claims: List[ClaimItem]
    resume_facts: List[ResumeFact]
    transcript_facts: List[TranscriptFact]
    gaps_missing_info: List[GapInfo]
    prompt_injection_detected: bool = False

class AgentOpinion(BaseModel):
    score: float = Field(..., ge=0.0, le=10.0)
    confidence: Literal["low", "medium", "high"]
    strengths: List[EvidenceItem]
    concerns: List[EvidenceItem]
    unknowns: List[str]
    summary: str
    invoked_at: Optional[str] = None
    execution_order: Optional[int] = None
    isolated_context_verified: bool = True
    requirement_breakdown: Optional[List[RequirementEvaluation]] = None
    repeated_runs: Optional[List[float]] = None
    consistency_note: Optional[str] = None

class OpinionState(BaseModel):
    score: float
    stance: str

class DebateTurn(BaseModel):
    round: int
    agent: Literal["Technical", "HR", "HiringManager", "Skeptic"]
    target_agent: str
    claim_being_addressed: str
    steelman: str
    counter_evidence: Optional[str] = None
    target_point_quote: str
    reaction: Literal["agree", "disagree", "partially_agree"]
    stance_shift_type: Literal["HELD POSITION", "PARTIALLY SHIFTED", "STANCE SHIFTED"]
    opinion_before: OpinionState
    saw: List[str]
    reasoning: str
    opinion_after: OpinionState
    changed: bool
    change_reason: Optional[str] = None

class UnresolvedDisagreement(BaseModel):
    topic: str
    agents_involved: List[str]
    why_unresolved: str
    turn_reference: Optional[int] = None

class AgentWeightContribution(BaseModel):
    agent_name: str
    raw_score: float
    confidence: str
    confidence_multiplier: float
    strengths_weighted: float
    concerns_weighted: float
    contested_penalty: float
    net_agent_score: float
    flags: List[str] = []

class ComputedWeightsTable(BaseModel):
    agent_breakdowns: List[AgentWeightContribution]
    total_weighted_for: float
    total_weighted_against: float
    net_weighted_score: float
    raw_arithmetic_mean: float
    divergence_delta: float
    mathematical_formula: str
    recommends_verdict: str

SensitivityStatus = Literal["unverified", "contested", "single_data_point", "weakly_evidenced"]
ResolvedAsType = Literal["confirmed", "disproven"]

class VerdictSensitivityItem(BaseModel):
    factor: str
    current_status: SensitivityStatus
    current_weight_contribution: float
    if_resolved_as: ResolvedAsType
    projected_verdict_shift: str
    how_to_resolve: str
    source_quote: Optional[str] = None
    source_label: Optional[str] = None

class ChairOutput(BaseModel):
    final_recommendation: Literal["Strong Hire", "Hire", "Lean No", "No Hire"]
    confidence: Literal["low", "medium", "high"]
    confidence_cap_reason: Optional[str] = None
    reasoning_steps: List[str]
    key_evidence_for: List[EvidenceItem]
    key_evidence_against: List[EvidenceItem]
    unresolved_disagreements: List[UnresolvedDisagreement]
    missing_info_caveats: List[str]
    computed_weights: Optional[ComputedWeightsTable] = None
    verdict_sensitivity: List[VerdictSensitivityItem] = []

class AgentCallRecord(BaseModel):
    call_id: str
    stage: str
    agent_name: str
    system_prompt_preview: str
    input_summary: str
    output_summary: str
    latency_ms: int
    quotes_verified_count: int

class PipelineAudit(BaseModel):
    total_api_calls: int
    independent_calls_count: int
    debate_calls_count: int
    chair_calls_count: int
    raw_mean_score: float
    chair_verdict: str
    chair_divergence_rationale: str
    pre_debate_score_variance: float = 0.0
    panel_agreement_level: str = "High"
    total_citations_count: int = 0
    verified_citations_count: int = 0
    unverified_citations_count: int = 0
    call_records: List[AgentCallRecord]
    raw_transcript_text: str
    raw_resume_text: str

class PipelineResult(BaseModel):
    candidate_id: str
    profile: CandidateProfile
    independent_opinions: Dict[str, AgentOpinion]
    debate_log: List[DebateTurn]
    chair_output: ChairOutput
    pre_debate_score_variance: float = 0.0
    panel_agreement_level: Literal["High", "Medium", "Low"] = "High"
    audit: Optional[PipelineAudit] = None
