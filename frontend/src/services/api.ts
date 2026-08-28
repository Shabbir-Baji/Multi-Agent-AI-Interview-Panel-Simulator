import type { PipelineResult, PipelineStageEvent, ComparisonData } from '../types';

const API_BASE = '';

export async function fetchCandidateData(candidateId: string): Promise<PipelineResult | null> {
  const res = await fetch(`${API_BASE}/api/candidates/${candidateId}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.detail?.message || errBody.detail || `Candidate '${candidateId}' not found (HTTP ${res.status})`;
    throw new Error(message);
  }
  return await res.json();
}

export async function fetchComparisonData(candAId = 'candidate_a', candBId = 'candidate_b'): Promise<ComparisonData | null> {
  const res = await fetch(`${API_BASE}/api/compare?candidate_a_id=${candAId}&candidate_b_id=${candBId}`);
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.detail?.message || errBody.detail || `Comparative analysis failed (HTTP ${res.status})`;
    throw new Error(message);
  }
  return await res.json();
}

/**
 * Upload a single slot file immediately upon selection with instant server-side text extraction.
 */
export async function uploadSingleSlotFile(
  candidateId: string,
  slotType: 'job_description' | 'resume' | 'transcript',
  file: File,
  candidateName?: string
) {
  const formData = new FormData();
  formData.append('candidate_id', candidateId);
  formData.append('slot_type', slotType);
  if (candidateName) formData.append('candidate_name', candidateName);
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload-slot-file`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.detail?.message || errBody.detail || `Upload failed (HTTP ${res.status})`;
    const err = new Error(message);
    (err as any).code = errBody.detail?.code || 'ERR_UPLOAD_FAILED';
    (err as any).slot = errBody.detail?.slot || slotType;
    throw err;
  }
  return await res.json();
}

export async function uploadCandidateDocuments(
  candidateId: string,
  candidateName?: string,
  jdFile?: File | null,
  resumeFile?: File | null,
  transcriptFile?: File | null
) {
  const formData = new FormData();
  formData.append('candidate_id', candidateId);
  if (candidateName) formData.append('candidate_name', candidateName);
  if (jdFile) formData.append('job_description', jdFile);
  if (resumeFile) formData.append('resume', resumeFile);
  if (transcriptFile) formData.append('transcript', transcriptFile);

  const res = await fetch(`${API_BASE}/api/upload-documents`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message = errBody.detail?.message || errBody.detail || `Document upload failed: HTTP ${res.status}`;
    throw new Error(message);
  }
  return await res.json();
}

/**
 * Execute the 6-stage pipeline over real uploaded documents with real SSE streaming.
 */
export function runPipelineStream(
  candidateId: string,
  onStageChange: (event: PipelineStageEvent) => void,
  onComplete: (data: PipelineResult) => void,
  onError?: (error: any) => void
): () => void {
  let isCancelled = false;

  const eventSource = new EventSource(`${API_BASE}/api/run-pipeline/${candidateId}`);

  eventSource.onmessage = (event) => {
    if (isCancelled) {
      eventSource.close();
      return;
    }
    try {
      const data: PipelineStageEvent = JSON.parse(event.data);
      onStageChange(data);

      if (data.stage === 6 && data.result) {
        eventSource.close();
        onComplete(data.result);
      }
    } catch (parseErr) {
      console.error("Failed to parse deliberation SSE payload:", parseErr);
      if (onError) onError(parseErr);
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
    if (!isCancelled && onError) {
      onError(new Error(`Deliberation stream failed for candidate '${candidateId}'. Please verify documents were uploaded.`));
    }
  };

  return () => {
    isCancelled = true;
    eventSource.close();
  };
}
