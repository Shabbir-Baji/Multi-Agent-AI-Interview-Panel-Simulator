from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import logging
from typing import Optional

from .schemas import PipelineResult
from .pipeline import (
    load_candidate_data,
    run_pipeline_simulation,
    synthesize_comparison,
    extract_text_from_pdf_bytes,
    store_uploaded_documents,
    validate_candidate_documents_present,
    DocumentExtractionError,
    SESSION_DOCUMENTS
)

logger = logging.getLogger("paneltrace.api")

app = FastAPI(
    title="PanelTrace - Multi-Agent Deliberation API",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "app": "PanelTrace - Multi-Agent Deliberation API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/candidate-status/{candidate_id}")
def get_candidate_status(candidate_id: str):
    """
    Checks session intake readiness for candidate_id.
    """
    docs = SESSION_DOCUMENTS.get(candidate_id, {})
    has_jd = bool(docs.get("job_description", "").strip())
    has_resume = bool(docs.get("resume", "").strip())
    has_transcript = bool(docs.get("transcript", "").strip())
    
    return {
        "candidate_id": candidate_id,
        "is_ready": has_jd and has_resume and has_transcript,
        "slots": {
            "job_description": has_jd,
            "resume": has_resume,
            "transcript": has_transcript
        }
    }

@app.get("/api/candidates/{candidate_id}")
def get_candidate_result(candidate_id: str):
    """
    Returns candidate deliberation result. Throws HTTP 400 if no real uploaded documents exist.
    """
    try:
        data = load_candidate_data(candidate_id)
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail={"code": "ERR_PIPELINE_FAILED", "message": str(e)})

@app.post("/api/upload-slot-file")
async def upload_slot_file(
    candidate_id: str = Form(...),
    slot_type: str = Form(...),  # 'job_description' | 'resume' | 'transcript'
    candidate_name: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Uploads a single slot file immediately, extracts text with pypdf,
    and returns immediate confirmation or an inline slot error.
    """
    slot_labels = {
        "job_description": "Job Description",
        "resume": "Candidate Resume",
        "transcript": "Candidate Interview Transcript"
    }
    slot_name = slot_labels.get(slot_type, slot_type.replace("_", " ").title())
    
    try:
        file_bytes = await file.read()
        extracted_text = extract_text_from_pdf_bytes(file_bytes, file.filename or f"{slot_type}.pdf", slot_name)
    except DocumentExtractionError as doc_err:
        logger.error(f"[UPLOAD FAIL] {slot_name} upload error: {doc_err.code} - {doc_err.message}")
        raise HTTPException(status_code=400, detail={
            "code": doc_err.code,
            "slot": slot_type,
            "slot_name": slot_name,
            "message": doc_err.message
        })
    except Exception as err:
        logger.error(f"[UPLOAD FAIL] Unexpected error in {slot_name}: {str(err)}")
        raise HTTPException(status_code=400, detail={
            "code": "ERR_EXTRACTION_CORRUPTED",
            "slot": slot_type,
            "slot_name": slot_name,
            "message": f"{slot_name}: Failed to extract PDF text ({str(err)})."
        })

    # Save to session
    kw = {slot_type: extracted_text}
    summary = store_uploaded_documents(
        candidate_id=candidate_id,
        candidate_name=candidate_name or f"Candidate {candidate_id.upper()}",
        jd_text=extracted_text if slot_type == "job_description" else None,
        resume_text=extracted_text if slot_type == "resume" else None,
        transcript_text=extracted_text if slot_type == "transcript" else None
    )

    return {
        "status": "ready",
        "candidate_id": candidate_id,
        "slot": slot_type,
        "filename": file.filename,
        "chars_extracted": len(extracted_text),
        "preview_snippet": extracted_text[:120].replace("\n", " ").strip(),
        "summary": summary
    }

@app.post("/api/upload-documents")
async def upload_documents(
    candidate_id: str = Form(...),
    candidate_name: Optional[str] = Form(None),
    job_description: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    transcript: Optional[UploadFile] = File(None)
):
    """
    Bulk uploads documents for candidate session.
    """
    jd_text: Optional[str] = None
    resume_text: Optional[str] = None
    transcript_text: Optional[str] = None

    try:
        if job_description:
            jd_bytes = await job_description.read()
            jd_text = extract_text_from_pdf_bytes(jd_bytes, job_description.filename or "Job_Description.pdf", "Job Description")
            
        if resume:
            resume_bytes = await resume.read()
            resume_text = extract_text_from_pdf_bytes(resume_bytes, resume.filename or "Resume.pdf", "Candidate Resume")
            
        if transcript:
            transcript_bytes = await transcript.read()
            transcript_text = extract_text_from_pdf_bytes(transcript_bytes, transcript.filename or "Transcript.pdf", "Candidate Interview Transcript")
    except DocumentExtractionError as doc_err:
        raise HTTPException(status_code=400, detail={
            "code": doc_err.code,
            "slot": doc_err.slot_name,
            "message": doc_err.message
        })
    except Exception as err:
        raise HTTPException(status_code=400, detail={
            "code": "ERR_EXTRACTION_CORRUPTED",
            "slot": "document",
            "message": f"Document extraction error: {str(err)}"
        })

    summary = store_uploaded_documents(
        candidate_id=candidate_id,
        candidate_name=candidate_name or f"Candidate {candidate_id.upper()}",
        jd_text=jd_text,
        resume_text=resume_text,
        transcript_text=transcript_text
    )

    return {
        "status": "success",
        "candidate_id": candidate_id,
        "candidate_name": summary["candidate_name"],
        "files_extracted": {
            "job_description_chars": len(jd_text) if jd_text else 0,
            "resume_chars": len(resume_text) if resume_text else 0,
            "transcript_chars": len(transcript_text) if transcript_text else 0
        }
    }

@app.get("/api/run-pipeline/{candidate_id}")
@app.post("/api/run-pipeline/{candidate_id}")
async def run_pipeline_endpoint(candidate_id: str):
    """
    Hard-guarded endpoint: Rejects execution if no real uploaded documents exist for candidate_id.
    Streams progress events of multi-agent deliberation.
    """
    # Validate before creating the stream
    validate_candidate_documents_present(candidate_id)

    async def event_generator():
        async for step in run_pipeline_simulation(candidate_id):
            yield f"data: {json.dumps(step)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/compare")
def compare_candidates(candidate_a_id: str = "candidate_a", candidate_b_id: str = "candidate_b"):
    try:
        data_a = load_candidate_data(candidate_a_id)
        data_b = load_candidate_data(candidate_b_id)
        return synthesize_comparison(data_a, data_b)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail={"code": "ERR_COMPARE_FAILED", "message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
