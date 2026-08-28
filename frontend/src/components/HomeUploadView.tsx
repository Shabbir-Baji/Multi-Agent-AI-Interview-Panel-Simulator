import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Lock,
  X,
  FileCheck,
  Users,
  MessageSquareQuote,
  Award,
  HelpCircle,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { PipelineTracker } from './PipelineTracker';
import type { PipelineStageEvent } from '../types';
import { uploadSingleSlotFile } from '../services/api';

export type SlotStatus = 'empty' | 'uploading' | 'ready' | 'error';

export interface SlotFileState {
  file: File | null;
  name: string;
  sizeBytes: number;
  charsExtracted?: number;
  previewSnippet?: string;
  status: SlotStatus;
  errorMessage?: string | null;
}

interface HomeUploadViewProps {
  isRunningPipeline: boolean;
  currentStage: PipelineStageEvent | null;
  onConveneCommittee: (data: {
    hasCandidateB: boolean;
  }) => void;
  onSwitchToWorkspace: () => void;
  hasRunResults?: boolean;
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const initialSlotState = (): SlotFileState => ({
  file: null,
  name: '',
  sizeBytes: 0,
  status: 'empty',
  errorMessage: null,
});

interface FileSlotProps {
  title: string;
  subtitle: string;
  slotState: SlotFileState;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  isLocked: boolean;
  required?: boolean;
}

const FileSlot: React.FC<FileSlotProps> = ({
  title,
  subtitle,
  slotState,
  onFileSelect,
  onFileRemove,
  isLocked,
  required = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLocked || slotState.status === 'uploading') return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLocked || slotState.status === 'uploading') return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      onFileSelect(droppedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const isReady = slotState.status === 'ready';
  const isUploading = slotState.status === 'uploading';
  const isError = slotState.status === 'error';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#F3EDE2] font-serif flex items-center gap-1.5">
          <span>{title}</span>
          {required ? (
            <span className="text-[10px] font-mono text-[#DDB86C] font-normal">(Required)</span>
          ) : (
            <span className="text-[10px] font-mono text-[#8E8070] font-normal">(Optional)</span>
          )}
        </label>
        {isReady && (
          <span className="text-[10px] font-mono text-[#78B88A] flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        )}
        {isUploading && (
          <span className="text-[10px] font-mono text-[#DDB86C] flex items-center gap-1 font-bold">
            <Loader2 className="w-3 h-3 animate-spin" /> Ingesting & Extracting...
          </span>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLocked && !isUploading && !isReady && inputRef.current?.click()}
        className={`relative rounded-lg p-3.5 border transition-all ${
          isLocked
            ? 'bg-[#18120D] border-[#2C241D] opacity-80 cursor-not-allowed'
            : isDragging
            ? 'bg-[#2C2314] border-[#DDB86C] scale-[1.01] shadow-md'
            : isUploading
            ? 'bg-[#2C2314] border-[#7A5F28]'
            : isReady
            ? 'bg-[#1A271E] border-[#3A5F44]'
            : isError
            ? 'bg-[#2C1818] border-[#6B3030]'
            : 'bg-[#1E1813] border-[#3A3026] hover:border-[#524436] hover:bg-[#251E17] cursor-pointer'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          disabled={isLocked || isUploading}
          onChange={handleInputChange}
          className="hidden"
          id={`file-input-${title.replace(/\s+/g, '-').toLowerCase()}`}
          aria-label={`Upload ${title}`}
        />

        {/* Locked State Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-[#16110D]/60 backdrop-blur-[0.5px] rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#C4B7A5] z-10">
            <Lock className="w-3.5 h-3.5 text-[#DDB86C]" />
            <span>Locked during review for evidence traceability</span>
          </div>
        )}

        {/* State 1: Uploading / Processing */}
        {isUploading ? (
          <div className="flex items-center gap-3 py-1">
            <div className="p-2 rounded bg-[#2A211A] border border-[#7A5F28] text-[#DDB86C] shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-[#DDB86C]" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[#DDB86C] font-mono flex items-center gap-1.5">
                <span>Ingesting {slotState.name || 'PDF'}...</span>
              </div>
              <p className="text-[11px] text-[#C4B7A5] font-serif">
                Parsing PDF layout, extracting text stream, and generating ground-truth index.
              </p>
            </div>
          </div>
        ) : isReady ? (
          /* State 2: Ready / Verified */
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-2 rounded bg-[#241D17] border border-[#3A5F44] text-[#78B88A] shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-semibold text-[#F3EDE2] font-mono truncate">
                  {slotState.name}
                </div>
                <div className="text-[10px] font-mono text-[#78B88A] flex items-center gap-2">
                  <span>{formatFileSize(slotState.sizeBytes)}</span>
                  <span>•</span>
                  <span>{slotState.charsExtracted?.toLocaleString() || 0} chars extracted</span>
                  <span>•</span>
                  <span className="font-bold">PDF Ready</span>
                </div>
                {slotState.previewSnippet && (
                  <p className="text-[11px] text-[#C4B7A5] italic font-serif line-clamp-1 mt-1 border-l border-[#3A5F44] pl-2">
                    "{slotState.previewSnippet}..."
                  </p>
                )}
              </div>
            </div>

            {!isLocked && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="px-2 py-1 rounded bg-[#241D17] hover:bg-[#2F241C] text-[#C4B7A5] hover:text-[#F3EDE2] border border-[#3A3026] text-[10px] font-serif transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove();
                  }}
                  className="p-1 rounded text-[#8E8070] hover:text-[#E27D7D] hover:bg-[#2C1818] transition-colors"
                  title="Remove file"
                  aria-label="Remove attached file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : isError ? (
          /* State 3: Inline Error on Failing Slot */
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 text-xs text-[#E27D7D] font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#E27D7D] mt-0.5" />
                <div>
                  <span className="font-bold block">{title} Extraction Failed:</span>
                  <span className="text-[#F3EDE2] font-serif text-[11px] leading-relaxed block mt-0.5">
                    {slotState.errorMessage || "No text could be extracted from this PDF. Please ensure it is not a scanned image."}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                className="p-1 rounded text-[#8E8070] hover:text-[#F3EDE2]"
                title="Clear and retry"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-[#C4B7A5] font-serif italic">
                Click to choose another text-based PDF file.
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="px-2.5 py-0.5 rounded bg-[#2C1818] hover:bg-[#3D2020] text-[#E27D7D] border border-[#6B3030] text-[10px] font-serif transition-colors"
              >
                Re-Upload File
              </button>
            </div>
          </div>
        ) : (
          /* State 4: Empty / Prompt */
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C] shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-left">
              <div className="text-xs font-semibold text-[#F3EDE2] font-serif">
                Drop {title} PDF here, or <span className="text-[#DDB86C] underline decoration-[#7A5F28]">browse files</span>
              </div>
              <p className="text-[11px] text-[#8E8070] font-serif">
                {subtitle} • Accepts PDF only (max 25MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const HomeUploadView: React.FC<HomeUploadViewProps> = ({
  isRunningPipeline,
  currentStage,
  onConveneCommittee,
  onSwitchToWorkspace,
  hasRunResults = false,
}) => {
  // 5 Dedicated Slots with state
  const [jdSlot, setJdSlot] = useState<SlotFileState>(initialSlotState());
  const [candAResumeSlot, setCandAResumeSlot] = useState<SlotFileState>(initialSlotState());
  const [candATranscriptSlot, setCandATranscriptSlot] = useState<SlotFileState>(initialSlotState());
  const [candBResumeSlot, setCandBResumeSlot] = useState<SlotFileState>(initialSlotState());
  const [candBTranscriptSlot, setCandBTranscriptSlot] = useState<SlotFileState>(initialSlotState());

  // Upload handler for individual slot
  const handleUploadSlot = async (
    candidateId: string,
    slotType: 'job_description' | 'resume' | 'transcript',
    file: File,
    slotTitle: string,
    setSlot: React.Dispatch<React.SetStateAction<SlotFileState>>
  ) => {
    // 1. Validate extension immediately
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setSlot({
        file: null,
        name: file.name,
        sizeBytes: file.size,
        status: 'error',
        errorMessage: `${slotTitle}: "${file.name}" is not a PDF. Only .pdf documents are supported.`
      });
      return;
    }

    // 2. Set uploading state
    setSlot({
      file,
      name: file.name,
      sizeBytes: file.size,
      status: 'uploading',
      errorMessage: null,
    });

    // 3. Upload immediately to backend and extract text
    try {
      const res = await uploadSingleSlotFile(candidateId, slotType, file);
      
      // If uploading shared JD, also update candidate_b session on server if candidate_b is being configured
      if (slotType === 'job_description') {
        try {
          await uploadSingleSlotFile('candidate_b', 'job_description', file);
        } catch {
          // Ignore secondary sync
        }
      }

      setSlot({
        file,
        name: file.name,
        sizeBytes: file.size,
        charsExtracted: res.chars_extracted,
        previewSnippet: res.preview_snippet,
        status: 'ready',
        errorMessage: null,
      });
    } catch (err: any) {
      setSlot({
        file,
        name: file.name,
        sizeBytes: file.size,
        status: 'error',
        errorMessage: err.message || `${slotTitle}: Text extraction failed. Please ensure the PDF has a selectable text layer.`,
      });
    }
  };

  // Clear all uploads
  const clearAllUploads = () => {
    setJdSlot(initialSlotState());
    setCandAResumeSlot(initialSlotState());
    setCandATranscriptSlot(initialSlotState());
    setCandBResumeSlot(initialSlotState());
    setCandBTranscriptSlot(initialSlotState());
  };

  // Readiness Calculation: Requires confirmed 'ready' status from server
  const isJdReady = jdSlot.status === 'ready';
  const isCandAResumeReady = candAResumeSlot.status === 'ready';
  const isCandATranscriptReady = candATranscriptSlot.status === 'ready';
  const isCandAReady = isCandAResumeReady && isCandATranscriptReady;

  const isCandBResumeReady = candBResumeSlot.status === 'ready';
  const isCandBTranscriptReady = candBTranscriptSlot.status === 'ready';
  const hasCandBAny = candBResumeSlot.status !== 'empty' || candBTranscriptSlot.status !== 'empty';
  const isCandBComplete = isCandBResumeReady && isCandBTranscriptReady;
  const isCandBPartial = hasCandBAny && !isCandBComplete;

  const isAnyUploading =
    jdSlot.status === 'uploading' ||
    candAResumeSlot.status === 'uploading' ||
    candATranscriptSlot.status === 'uploading' ||
    candBResumeSlot.status === 'uploading' ||
    candBTranscriptSlot.status === 'uploading';

  // Strict readiness guard
  const isConveneReady = isJdReady && isCandAReady && !isAnyUploading && (!hasCandBAny || isCandBComplete);

  // Action trigger
  const handleRun = () => {
    if (!isConveneReady || isRunningPipeline) return;

    onConveneCommittee({
      hasCandidateB: isCandBComplete,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* 1. Header & Framing */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold text-[#F3EDE2] tracking-wide font-charter m-0">
                Convene the Hiring Committee
              </h2>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#2C2314] text-[#DDB86C] border border-[#7A5F28]">
                Case File & Source Intake
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#C4B7A5] font-serif leading-relaxed">
              Upload the job description and each candidate's materials to convene the panel.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
            {hasRunResults && (
              <button
                type="button"
                onClick={onSwitchToWorkspace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A271E] hover:bg-[#223528] text-[#78B88A] border border-[#3A5F44] text-xs font-serif font-semibold transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Return to Active Workspace</span>
              </button>
            )}

            {(jdSlot.status !== 'empty' || candAResumeSlot.status !== 'empty' || candATranscriptSlot.status !== 'empty' || candBResumeSlot.status !== 'empty' || candBTranscriptSlot.status !== 'empty') && !isRunningPipeline && (
              <button
                type="button"
                onClick={clearAllUploads}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#241D17] hover:bg-[#2C1818] text-[#8E8070] hover:text-[#E27D7D] border border-[#3A3026] text-xs font-serif transition-colors"
                title="Clear all attached files"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Pipeline Progress Tracker (if running) */}
      {isRunningPipeline && (
        <div className="animate-fadeIn">
          <PipelineTracker
            currentStage={currentStage}
            isRunning={isRunningPipeline}
          />
        </div>
      )}

      {/* 2. Shared Job Description Section */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)] space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#332A21]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F3EDE2] uppercase tracking-wide font-charter m-0">
                1. Shared Job Description (Role Standard)
              </h3>
              <p className="text-[11px] text-[#8E8070] font-serif">
                A single PDF containing the core rubric requirements used to calibrate all candidate evaluations.
              </p>
            </div>
          </div>
        </div>

        <FileSlot
          title="Job Description Document"
          subtitle="e.g. Senior AI Systems Engineer JD"
          slotState={jdSlot}
          onFileSelect={(f) => handleUploadSlot('candidate_a', 'job_description', f, 'Job Description', setJdSlot)}
          onFileRemove={() => setJdSlot(initialSlotState())}
          isLocked={isRunningPipeline}
          required={true}
        />
      </div>

      {/* 3. Candidates Grid (Side-by-Side on Desktop, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Candidate A Panel */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)] space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#332A21]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#2A211A] border border-[#4A3E34] flex items-center justify-center text-xs font-mono font-bold text-[#DDB86C]">
                A
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#F3EDE2] font-charter m-0">
                  Candidate A Dossier
                </h3>
                <span className="text-[10px] font-mono text-[#78B88A]">Primary Review Subject</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#C4B7A5] border border-[#3A3026]">
              2 Files Required
            </span>
          </div>

          {/* Candidate A Resume */}
          <FileSlot
            title="Candidate A Resume"
            subtitle="Curriculum Vitae / Work History PDF (Name derived automatically)"
            slotState={candAResumeSlot}
            onFileSelect={(f) => handleUploadSlot('candidate_a', 'resume', f, 'Candidate A Resume', setCandAResumeSlot)}
            onFileRemove={() => setCandAResumeSlot(initialSlotState())}
            isLocked={isRunningPipeline}
            required={true}
          />

          {/* Candidate A Interview Transcript */}
          <FileSlot
            title="Candidate A Interview Transcript"
            subtitle="Verbatim Q&A Technical Transcript PDF"
            slotState={candATranscriptSlot}
            onFileSelect={(f) => handleUploadSlot('candidate_a', 'transcript', f, 'Candidate A Interview Transcript', setCandATranscriptSlot)}
            onFileRemove={() => setCandATranscriptSlot(initialSlotState())}
            isLocked={isRunningPipeline}
            required={true}
          />
        </div>

        {/* Candidate B Panel (Optional) */}
        <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.25)] space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#332A21]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#2A211A] border border-[#4A3E34] flex items-center justify-center text-xs font-mono font-bold text-[#78B88A]">
                B
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#F3EDE2] font-charter m-0">
                  Candidate B Dossier
                </h3>
                <span className="text-[10px] font-mono text-[#8E8070]">(Optional Comparative)</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E1813] text-[#8E8070] border border-[#3A3026]">
              Optional
            </span>
          </div>

          {/* Candidate B Resume */}
          <FileSlot
            title="Candidate B Resume"
            subtitle="Curriculum Vitae / Work History PDF (Name derived automatically)"
            slotState={candBResumeSlot}
            onFileSelect={(f) => handleUploadSlot('candidate_b', 'resume', f, 'Candidate B Resume', setCandBResumeSlot)}
            onFileRemove={() => setCandBResumeSlot(initialSlotState())}
            isLocked={isRunningPipeline}
            required={false}
          />

          {/* Candidate B Interview Transcript */}
          <FileSlot
            title="Candidate B Interview Transcript"
            subtitle="Verbatim Q&A Technical Transcript PDF"
            slotState={candBTranscriptSlot}
            onFileSelect={(f) => handleUploadSlot('candidate_b', 'transcript', f, 'Candidate B Interview Transcript', setCandBTranscriptSlot)}
            onFileRemove={() => setCandBTranscriptSlot(initialSlotState())}
            isLocked={isRunningPipeline}
            required={false}
          />
        </div>
      </div>

      {/* 4. Readiness Checklist & Primary Action Card */}
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl p-5 shadow-[0_2px_6px_rgba(0,0,0,0.3)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Readiness Checklist */}
          <div className="space-y-1.5">
            <div className="text-[11px] uppercase font-mono font-bold text-[#8E8070] tracking-wider">
              Intake Readiness Checklist:
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              {/* JD check */}
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded border ${
                isJdReady
                  ? 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]'
                  : jdSlot.status === 'uploading'
                  ? 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]'
                  : 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]'
              }`}>
                {isJdReady ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : jdSlot.status === 'uploading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                <span>Job Description {isJdReady ? '(Ready)' : jdSlot.status === 'uploading' ? '(Extracting...)' : '(Required)'}</span>
              </span>

              {/* Candidate A check */}
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded border ${
                isCandAReady
                  ? 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]'
                  : candAResumeSlot.status === 'uploading' || candATranscriptSlot.status === 'uploading'
                  ? 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]'
                  : 'bg-[#2C1818] text-[#E27D7D] border-[#6B3030]'
              }`}>
                {isCandAReady ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : candAResumeSlot.status === 'uploading' || candATranscriptSlot.status === 'uploading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                <span>
                  Candidate A {isCandAReady ? '(Ready: Resume + Transcript)' : `(${[isCandAResumeReady && 'Resume Ready', isCandATranscriptReady && 'Transcript Ready'].filter(Boolean).join(', ') || 'Resume + Transcript Required'})`}
                </span>
              </span>

              {/* Candidate B check */}
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded border ${
                isCandBComplete
                  ? 'bg-[#1A271E] text-[#78B88A] border-[#3A5F44]'
                  : isCandBPartial
                  ? 'bg-[#2C2314] text-[#DDB86C] border-[#7A5F28]'
                  : 'bg-[#1E1813] text-[#8E8070] border-[#3A3026]'
              }`}>
                {isCandBComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#78B88A]" />
                ) : isCandBPartial ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#DDB86C]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#5A4B3D]" />
                )}
                <span>
                  Candidate B {isCandBComplete ? '(Ready)' : isCandBPartial ? '(Incomplete: Need both files)' : '(Skipped)'}
                </span>
              </span>
            </div>

            {/* Plain language explanation when disabled */}
            {!isConveneReady && (
              <p className="text-[11px] text-[#C4B7A5] font-serif italic pt-1">
                {isAnyUploading
                  ? "Extracting uploaded PDF document streams on server... please wait a moment."
                  : !isJdReady && !isCandAReady
                  ? "Please upload the Job Description PDF and Candidate A's Resume and Transcript to convene the panel."
                  : !isJdReady
                  ? "Job Description PDF required — please upload above."
                  : !isCandAResumeReady && !isCandATranscriptReady
                  ? "Candidate A Resume and Transcript required — please upload above."
                  : !isCandAResumeReady
                  ? "Candidate A Resume required — please upload above."
                  : !isCandATranscriptReady
                  ? "Candidate A Interview Transcript required — please upload above."
                  : isCandBPartial
                  ? "Candidate B requires both Resume and Transcript, or clear both to run Candidate A exclusively."
                  : ""}
              </p>
            )}
          </div>

          {/* Primary Action Button (Strictly unclickable until ready) */}
          <div className="shrink-0">
            <button
              id="convene-committee-btn"
              type="button"
              disabled={!isConveneReady || isRunningPipeline}
              aria-disabled={!isConveneReady || isRunningPipeline}
              onClick={handleRun}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg text-sm font-serif font-semibold border shadow-md transition-all ${
                isConveneReady && !isRunningPipeline
                  ? 'bg-[#3A2D1F] hover:bg-[#4E3D2B] text-[#F3EDE2] border-[#6E5535] cursor-pointer hover:shadow-lg'
                  : 'bg-[#201812] text-[#6E6052] border-[#332A21] cursor-not-allowed opacity-50 pointer-events-none'
              }`}
            >
              <Play className="w-4 h-4 fill-current text-[#DDB86C]" />
              <span>Convene Committee & Run Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Plain-Language Process Explainer (Below the fold) */}
      <div className="bg-[#1E1813] border border-[#3A3026] rounded-xl p-5 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DDB86C] font-charter">
          <HelpCircle className="w-4 h-4 text-[#DDB86C]" />
          <span>How the Committee Review Process Works</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-serif">
          <div className="p-3 rounded bg-[#241D17] border border-[#332A21] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#F3EDE2] font-charter">
              <Users className="w-3.5 h-3.5 text-[#DDB86C]" />
              <span>1. Four Isolated Evaluators</span>
            </div>
            <p className="text-[#C4B7A5] leading-relaxed text-[11px]">
              Specialized agents (Technical, HR, Hiring Manager, Skeptic) review materials independently with strictly isolated prompts and zero peer context.
            </p>
          </div>

          <div className="p-3 rounded bg-[#241D17] border border-[#332A21] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#F3EDE2] font-charter">
              <MessageSquareQuote className="w-3.5 h-3.5 text-[#DDB86C]" />
              <span>2. Steelmanned Panel Debate</span>
            </div>
            <p className="text-[#C4B7A5] leading-relaxed text-[11px]">
              Agents cross-examine opposing viewpoints across multiple rounds, required by protocol to charitably steelman counter-arguments before rebutting.
            </p>
          </div>

          <div className="p-3 rounded bg-[#241D17] border border-[#332A21] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#F3EDE2] font-charter">
              <Award className="w-3.5 h-3.5 text-[#DDB86C]" />
              <span>3. Grounded Non-Average Verdict</span>
            </div>
            <p className="text-[#C4B7A5] leading-relaxed text-[11px]">
              The Committee Chair synthesizes a final verdict memorandum grounded in verifiable citations and fatal disqualifiers—not an arithmetic average.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
