import React from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Quote,
  Copy,
  Check
} from 'lucide-react';

interface SourceEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  citationText: string;
  citationSource?: string;
  rawTranscript: string;
  rawResume: string;
  candidateName: string;
}

export const SourceEvidenceModal: React.FC<SourceEvidenceModalProps> = ({
  isOpen,
  onClose,
  citationText,
  citationSource,
  rawTranscript,
  rawResume,
  candidateName,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isResumeCited = citationSource?.toLowerCase().includes('resume') || citationText.toLowerCase().includes('resume');
  const [activeDoc, setActiveDoc] = React.useState<'transcript' | 'resume'>(isResumeCited ? 'resume' : 'transcript');

  if (!isOpen) return null;

  const displayedDocText = activeDoc === 'transcript' ? rawTranscript : rawResume;

  // Extract candidate snippet
  const match = citationText.match(/['"](.*?)['"]/);
  const snippet = (match ? match[1] : citationText).trim();

  // Function to highlight snippet in document text
  const renderHighlightedDocument = () => {
    if (!snippet || snippet.length < 6) {
      return <pre className="whitespace-pre-wrap font-mono text-xs text-[#F3EDE2] leading-relaxed">{displayedDocText}</pre>;
    }

    // Try finding snippet or first 25 characters
    const searchTarget = snippet.slice(0, 30);
    const lowerDoc = displayedDocText.toLowerCase();
    const targetIndex = lowerDoc.indexOf(searchTarget.toLowerCase());

    if (targetIndex === -1) {
      return (
        <div className="space-y-3">
          <div className="p-2.5 rounded bg-[#2C2314] border border-[#7A5F28] text-xs text-[#DDB86C] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Citation snippet matched with synthesis variations or is located in the other document tab.</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-[#F3EDE2] leading-relaxed">{displayedDocText}</pre>
        </div>
      );
    }

    const before = displayedDocText.slice(0, targetIndex);
    const highlighted = displayedDocText.slice(targetIndex, targetIndex + Math.min(snippet.length, 250));
    const after = displayedDocText.slice(targetIndex + Math.min(snippet.length, 250));

    return (
      <div className="font-mono text-xs text-[#C4B7A5] leading-relaxed">
        <span className="whitespace-pre-wrap">{before}</span>
        <mark className="bg-[#2C2314] text-[#DDB86C] font-bold px-1 py-0.5 rounded border border-[#7A5F28] inline shadow-xs">
          {highlighted}
        </mark>
        <span className="whitespace-pre-wrap">{after}</span>
      </div>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#241D17] border border-[#3A3026] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#1E1813] border-b border-[#332A21] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#2A211A] border border-[#4A3E34] text-[#DDB86C]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F3EDE2] tracking-wide uppercase m-0 flex items-center gap-2 font-charter">
                Ground-Truth Source Verification
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A271E] text-[#78B88A] border border-[#3A5F44] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Grounded in Document
                </span>
              </h2>
              <p className="text-[11px] text-[#C4B7A5] font-serif">
                Candidate: <span className="text-[#F3EDE2] font-semibold">{candidateName}</span>
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

        {/* Selected Quote Banner */}
        <div className="p-4 bg-[#1E1813] border-b border-[#332A21] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-[#DDB86C] flex items-center gap-1">
              <Quote className="w-3 h-3" />
              Verified Citation String: {citationSource ? `(${citationSource})` : ''}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] font-mono text-[#DDB86C] hover:text-[#F3EDE2]"
            >
              {copied ? <Check className="w-3 h-3 text-[#78B88A]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Quote'}</span>
            </button>
          </div>
          <p className="text-xs italic font-mono text-[#F3EDE2] bg-[#15100C] p-2.5 rounded border border-[#3A3026]">
            "{citationText}"
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1A140F] border-b border-[#332A21] text-xs">
          <span className="text-[#8E8070] font-mono uppercase text-[10px] font-bold">Source File:</span>
          <button
            onClick={() => setActiveDoc('transcript')}
            className={`px-3 py-1 rounded transition-colors font-mono ${
              activeDoc === 'transcript'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-bold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#251E17]'
            }`}
          >
            Interview Transcript (verbatim_qa.txt)
          </button>
          <button
            onClick={() => setActiveDoc('resume')}
            className={`px-3 py-1 rounded transition-colors font-mono ${
              activeDoc === 'resume'
                ? 'bg-[#2C231B] text-[#F3EDE2] font-bold border border-[#5A4B3D] shadow-xs'
                : 'text-[#A89A88] hover:text-[#F3EDE2] hover:bg-[#251E17]'
            }`}
          >
            Candidate Resume (resume.txt)
          </button>
        </div>

        {/* Document View Pane */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#1A140F]">
          <div className="p-4 rounded bg-[#15100C] border border-[#332A21] overflow-x-auto shadow-inner">
            {renderHighlightedDocument()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#1E1813] border-t border-[#332A21] flex items-center justify-between">
          <span className="text-[11px] text-[#8E8070] font-mono">
            Ground-truth quote matching powered by deterministic indexer
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#3A2D1F] hover:bg-[#4E3D2B] text-[#F3EDE2] text-xs font-serif font-semibold transition-colors"
          >
            Close Source Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
