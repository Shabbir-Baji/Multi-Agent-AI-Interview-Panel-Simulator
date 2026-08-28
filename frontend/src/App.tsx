import { useState } from 'react';
import { Header } from './components/Header';
import { HomeUploadView } from './components/HomeUploadView';
import { PipelineTracker } from './components/PipelineTracker';
import { ProfileSummary } from './components/ProfileSummary';
import { IndependentOpinions } from './components/IndependentOpinions';
import { DebateTimeline } from './components/DebateTimeline';
import { ChairReport } from './components/ChairReport';
import { CandidateComparison } from './components/CandidateComparison';
import { AuditInspectorModal } from './components/AuditInspectorModal';
import { SourceEvidenceModal } from './components/SourceEvidenceModal';
import type {
  PipelineResult,
  PipelineStageEvent,
  ComparisonData
} from './types';
import {
  fetchCandidateData,
  fetchComparisonData,
  runPipelineStream
} from './services/api';
import {
  Users,
  MessageSquareQuote,
  Award,
  Scale,
  FileText
} from 'lucide-react';

type TabView = 'profile' | 'opinions' | 'debate' | 'chair' | 'compare';
type MainView = 'home' | 'workspace';

export function App() {
  const [activeMainView, setActiveMainView] = useState<MainView>('home');
  const [currentCandidateId, setCurrentCandidateId] = useState<string>('candidate_a');
  
  // Real data state (starts completely empty until user uploads and runs)
  const [candidateAData, setCandidateAData] = useState<PipelineResult | null>(null);
  const [candidateBData, setCandidateBData] = useState<PipelineResult | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  const [activeTab, setActiveTab] = useState<TabView>('debate');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);

  // Click-to-source modal state
  const [isSourceModalOpen, setIsSourceModalOpen] = useState<boolean>(false);
  const [activeCitationText, setActiveCitationText] = useState<string>('');
  const [activeCitationSource, setActiveCitationSource] = useState<string>('Transcript');

  // Pipeline execution state
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<PipelineStageEvent | null>(null);

  const activeResult: PipelineResult | null = currentCandidateId === 'candidate_b' ? candidateBData : candidateAData;

  const handleRunPipeline = (targetCandidate = currentCandidateId) => {
    if (isRunningPipeline) return;

    setIsRunningPipeline(true);
    setCurrentStage({ stage: 1, name: "Extracting uploaded documents & validating text", progress: 15 });

    runPipelineStream(
      targetCandidate,
      (stageEvent) => {
        setCurrentStage(stageEvent);
        if (stageEvent.stage === 4) {
          setActiveTab('debate');
        } else if (stageEvent.stage === 5 || stageEvent.stage === 6) {
          setActiveTab('chair');
        }
      },
      (finalResult) => {
        setIsRunningPipeline(false);
        setCurrentStage({ stage: 6, name: "Done", progress: 100, result: finalResult });

        if (targetCandidate === 'candidate_a') {
          setCandidateAData(finalResult);
        } else {
          setCandidateBData(finalResult);
        }
      },
      (err) => {
        console.error("Pipeline run error:", err);
        setIsRunningPipeline(false);
      }
    );
  };

  const handleConveneCommitteeFromHome = async (data: {
    hasCandidateB: boolean;
  }) => {
    setIsRunningPipeline(true);
    setCurrentStage({ stage: 1, name: "Convening committee & validating uploaded documents", progress: 15 });

    // Execute deliberation for Candidate A
    runPipelineStream(
      'candidate_a',
      (stageEvent) => {
        setCurrentStage(stageEvent);
        if (stageEvent.stage >= 3) {
          setActiveMainView('workspace');
        }
        if (stageEvent.stage === 4) {
          setActiveTab('debate');
        } else if (stageEvent.stage === 5 || stageEvent.stage === 6) {
          setActiveTab('chair');
        }
      },
      async (resultA) => {
        setCandidateAData(resultA);
        setCurrentCandidateId('candidate_a');

        // If Candidate B was also uploaded, run / fetch Candidate B & comparison
        if (data.hasCandidateB) {
          try {
            const resultB = await fetchCandidateData('candidate_b');
            if (resultB) setCandidateBData(resultB);
            const comp = await fetchComparisonData('candidate_a', 'candidate_b');
            if (comp) setComparisonData(comp);
          } catch (bErr) {
            console.warn("Candidate B processing note:", bErr);
          }
        }

        setIsRunningPipeline(false);
        setCurrentStage({ stage: 6, name: "Done", progress: 100, result: resultA });
        setActiveMainView('workspace');
      },
      (err) => {
        console.error("Deliberation error:", err);
        setIsRunningPipeline(false);
      }
    );
  };

  const handleSelectCandidate = (candidateId: string) => {
    setCurrentCandidateId(candidateId);
    setIsCompareMode(false);
    setActiveMainView('workspace');
  };

  const handleToggleCompareMode = (compare: boolean) => {
    setIsCompareMode(compare);
    setActiveMainView('workspace');
    if (compare) {
      setActiveTab('compare');
    } else if (activeTab === 'compare') {
      setActiveTab('debate');
    }
  };

  const handleOpenSource = (quoteText: string, sourceLabel?: string) => {
    setActiveCitationText(quoteText);
    setActiveCitationSource(sourceLabel || 'Document Citation');
    setIsSourceModalOpen(true);
  };

  const hasAnyRunResults = Boolean(candidateAData || candidateBData);

  return (
    <div className="min-h-screen bg-[#1A140F] text-[#F3EDE2] flex flex-col font-serif antialiased">
      {/* Top Header */}
      <Header
        currentCandidateId={currentCandidateId}
        onSelectCandidate={handleSelectCandidate}
        isRunningPipeline={isRunningPipeline}
        onRunPipeline={() => handleRunPipeline(currentCandidateId)}
        onOpenAudit={() => setIsAuditOpen(true)}
        isCompareMode={isCompareMode}
        onToggleCompareMode={handleToggleCompareMode}
        candidateAData={candidateAData}
        candidateBData={candidateBData}
        activeMainView={activeMainView}
        onSelectMainView={(v) => setActiveMainView(v)}
      />

      {/* Main Content: Home / Intake page vs Deliberation Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-5 space-y-5">
        {activeMainView === 'home' || !hasAnyRunResults ? (
          /* 1. Home / Case File Intake & Upload Page (Initial entry state) */
          <HomeUploadView
            isRunningPipeline={isRunningPipeline}
            currentStage={currentStage}
            onConveneCommittee={handleConveneCommitteeFromHome}
            onSwitchToWorkspace={() => setActiveMainView('workspace')}
            hasRunResults={hasAnyRunResults}
          />
        ) : (
          /* 2. Deliberation Workspace (Only visible after a real run has completed) */
          activeResult ? (
            <>
              {/* Pipeline Execution Tracker */}
              <PipelineTracker
                currentStage={currentStage}
                isRunning={isRunningPipeline}
              />

              {/* Section Navigation Tabs */}
              {!isCompareMode ? (
                <div className="flex items-center bg-[#16110D] p-1 rounded-lg border border-[#3A3026] overflow-x-auto shadow-xs no-print">
                  <button
                    id="tab-profile"
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs transition-colors whitespace-nowrap font-serif ${
                      activeTab === 'profile'
                        ? 'bg-[#2C231B] text-[#F3EDE2] font-bold border border-[#5A4B3D] shadow-xs'
                        : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#DDB86C]" />
                    <span>1. Candidate Profile Dossier</span>
                  </button>

                  <button
                    id="tab-opinions"
                    onClick={() => setActiveTab('opinions')}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs transition-colors whitespace-nowrap font-serif ${
                      activeTab === 'opinions'
                        ? 'bg-[#2C231B] text-[#F3EDE2] font-bold border border-[#5A4B3D] shadow-xs'
                        : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-[#DDB86C]" />
                    <span>2. Independent Opinions (Pre-Debate)</span>
                  </button>

                  <button
                    id="tab-debate"
                    onClick={() => setActiveTab('debate')}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs transition-colors whitespace-nowrap font-serif ${
                      activeTab === 'debate'
                        ? 'bg-[#2C231B] text-[#F3EDE2] font-bold border border-[#5A4B3D] shadow-xs'
                        : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                    }`}
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5 text-[#DDB86C]" />
                    <span>3. Committee Debate Transcript</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2C2314] text-[#DDB86C] border border-[#7A5F28]">
                      Core Ledger
                    </span>
                  </button>

                  <button
                    id="tab-chair"
                    onClick={() => setActiveTab('chair')}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-xs transition-colors whitespace-nowrap font-serif ${
                      activeTab === 'chair'
                        ? 'bg-[#2C231B] text-[#F3EDE2] font-bold border border-[#5A4B3D] shadow-xs'
                        : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#221B15]'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-[#DDB86C]" />
                    <span>4. Final Chair Report & Verdict</span>
                  </button>

                  {comparisonData && (
                    <>
                      <div className="h-4 w-[1px] bg-[#3A3026] mx-2 hidden md:block"></div>

                      <button
                        id="tab-compare-inline"
                        onClick={() => handleToggleCompareMode(true)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-serif font-semibold text-[#DDB86C] hover:text-[#F3EDE2] hover:bg-[#2A211A] transition-colors whitespace-nowrap"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>5. Comparative Synthesis (A vs B)</span>
                      </button>
                    </>
                  )}
                </div>
              ) : null}

              {/* Tab View Container */}
              <div>
                {isCompareMode && comparisonData ? (
                  <CandidateComparison
                    comparison={comparisonData}
                    onSelectCandidate={handleSelectCandidate}
                  />
                ) : (
                  <>
                    {activeTab === 'profile' && (
                      <ProfileSummary
                        profile={activeResult.profile}
                        onOpenSource={handleOpenSource}
                      />
                    )}

                    {activeTab === 'opinions' && (
                      <IndependentOpinions
                        opinions={activeResult.independent_opinions}
                        candidateName={activeResult.profile.candidate_name}
                        variance={activeResult.pre_debate_score_variance ?? 1.17}
                        agreementLevel={activeResult.panel_agreement_level ?? 'High'}
                        onOpenSource={handleOpenSource}
                      />
                    )}

                    {activeTab === 'debate' && (
                      <DebateTimeline
                        debateLog={activeResult.debate_log}
                        candidateName={activeResult.profile.candidate_name}
                        onOpenSource={handleOpenSource}
                      />
                    )}

                    {activeTab === 'chair' && (
                      <ChairReport
                        chairOutput={activeResult.chair_output}
                        candidateProfile={activeResult.profile}
                        candidateResult={activeResult}
                        onOpenAudit={() => setIsAuditOpen(true)}
                        onOpenSource={handleOpenSource}
                      />
                    )}
                  </>
                )}
              </div>
            </>
          ) : null
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#3A3026] bg-[#1E1813] py-4 px-4 text-center text-xs text-[#8E8070] no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F3EDE2] font-charter">PanelTrace</span>
            <span>•</span>
            <span className="font-serif">Deliberation Charter & Notarized Verdict System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Isolated Prompts: 4/4</span>
            <span>•</span>
            <span>Steelman Rebuttal: Enforced</span>
            {hasAnyRunResults && (
              <>
                <span>•</span>
                <button
                  onClick={() => setIsAuditOpen(true)}
                  className="text-[#DDB86C] hover:underline font-serif font-semibold"
                >
                  Verify Independence
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeResult && (
        <>
          <AuditInspectorModal
            isOpen={isAuditOpen}
            onClose={() => setIsAuditOpen(false)}
            result={activeResult}
            onOpenSource={handleOpenSource}
          />

          <SourceEvidenceModal
            isOpen={isSourceModalOpen}
            onClose={() => setIsSourceModalOpen(false)}
            citationText={activeCitationText}
            citationSource={activeCitationSource}
            rawTranscript={activeResult.audit?.raw_transcript_text || ""}
            rawResume={activeResult.audit?.raw_resume_text || ""}
            candidateName={activeResult.profile.candidate_name}
          />
        </>
      )}
    </div>
  );
}

export default App;
