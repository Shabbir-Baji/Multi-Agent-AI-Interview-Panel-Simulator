# PanelTrace: Multi-Agent AI Interview Panel Simulator & Deliberation Engine

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev)

**PanelTrace** is a multi-agent hiring committee simulator and structured deliberation engine. It simulates an expert hiring committee comprising specialized evaluators who cross-examine interview transcripts and resumes, engage in structured debate with steelmanned rebuttals, compute deterministic hybrid-weighted scorecards, and produce audit-verifiable hiring verdicts.

---

## 🏛️ Key Features

- **Document Upload & Auto Name Extraction**: Ingests Job Descriptions, Resumes, and Interview Transcripts (PDF) with automatic candidate header parsing and fallback diagnostics.
- **Candidate Profile Builder**: Extracts structured facts, verified claims, and missing-information caveats directly from source text.
- **4 Independent Agent Evaluators**:
  - 🛠️ **Technical Evaluator**: System architecture, algorithmic complexity, hands-on production depth.
  - 🔍 **Skeptic Evaluator**: Fact-checking, claim inflation detection, cross-verifying resume claims against verbatim transcript quotes.
  - 💼 **Hiring Manager**: Delivery ownership, scope execution, team execution impact.
  - 👥 **HR & Culture Evaluator**: Growth mindset, blameless collaboration, retention risk.
- **Steelmanned Cross-Examination & Debate**: Round-based peer challenges where agents must state their counter-agent's best argument (steelman) before defending or shifting position.
- **Deterministic Hybrid Weighing Engine**: Mathematical weight calculation factoring confidence multipliers, evidence tier strengths (`direct_statement`, `single_data_point`, `inferred`, `contradicted_elsewhere`), and contested claim penalties.
- **What Would Change This Verdict (Decision Boundary Sensitivity Analysis)**: Re-runs deterministic weighting simulations on unresolved factors to show recruiters exactly what evidence would shift the recommendation.
- **Side-by-Side Candidate Comparison**: Comprehensive comparative matrix across Technical Mastery, Integrity, Ownership, and Culture Fit.
- **Interactive Source Citation Inspector**: Clickable citations highlight exact passages in original source documents.
- **Memorandum Export**: Consolidated Markdown (`.md`) and printable PDF memorandum exports.
- **Restrained "Charter & Seal" Dark Warm Theme**: Aged walnut base, brass accents, oxblood/moss indicators, and legible typography.

---

## 📐 Architecture Overview

```
                          [ Upload JD / Resume / Transcript ]
                                          │
                                          ▼
                            [ Candidate Profile Builder ]
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
          [ Technical Agent ]     [ Skeptic Agent ]      [ Hiring Mgr / HR ]
                  └───────────────────────┬───────────────────────┘
                                          │ (Independent Baseline)
                                          ▼
                              [ Steelmanned Debate ]
                                          │
                                          ▼
                         [ Hybrid Deterministic Weighing ]
                                          │
                                          ▼
                            [ Chair Final Synthesis ]
                                          │
                                          ▼
                    [ Decision Boundary Sensitivity Analysis ]
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install fastapi uvicorn pypdf pydantic

# Run the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Tests

PanelTrace includes a 20-point automated test suite covering:
- Deterministic score weighting & confidence cap logic
- Stance shift & steelmanned rebuttal convergence
- Traceability & citation verification
- Decision boundary sensitivity simulations (decisive & non-decisive shifts)
- Automatic name extraction & PDF diagnostic error handling

```bash
# Run unit test suite
python backend/tests/test_deliberation.py
```

---

## 📄 License
MIT License. Built for rigorous, transparent, and fair candidate evaluations.
