"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Question {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options: string[];
  conditionalRule?: { dependsOn: string; showWhen: any };
}

interface JobInfo {
  id: string;
  slug: string;
  title: string;
  employer: { name: string };
  location: string;
  workArrangement: string;
  employmentType: string;
  categoryId?: string;
  familyId?: string;
}

type WizardStep = "overview" | "questions" | "review" | "submitted";

export default function ApplyPage() {
  const { jobSlug } = useParams<{ jobSlug: string }>();
  const router = useRouter();

  const [step, setStep] = useState<WizardStep>("overview");
  const [job, setJob] = useState<JobInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    // Fetch job info
    fetch(`/api/jobs/${jobSlug}`)
      .then(r => r.json())
      .then((data) => {
        if (data?.id) {
          setJob(data);
          // Fetch questions for this job's category/family
          const params = new URLSearchParams();
          if (data.categoryId) params.set("categoryId", data.categoryId);
          if (data.familyId) params.set("familyId", data.familyId);
          return fetch(`/api/applications/questions?${params}`);
        }
      })
      .then(r => r?.json())
      .then(q => {
        if (Array.isArray(q)) setQuestions(q);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobSlug]);

  const getVisibleQuestions = () => {
    return questions.filter(q => {
      if (!q.conditionalRule) return true;
      const parentAnswer = answers[q.conditionalRule.dependsOn];
      return parentAnswer === q.conditionalRule.showWhen;
    });
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelectToggle = (questionId: string, option: string) => {
    const current: string[] = answers[questionId] || [];
    const next = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
    handleAnswer(questionId, next);
  };

  const missingRequired = () => {
    return getVisibleQuestions()
      .filter(q => q.required)
      .some(q => {
        const val = answers[q.id];
        if (val === undefined || val === null || val === "") return true;
        if (Array.isArray(val) && val.length === 0) return true;
        return false;
      });
  };

  const handleSubmit = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter,
          answers: getVisibleQuestions().map(q => ({
            questionId: q.id,
            answer: answers[q.id] ?? null,
          })),
        }),
      });
      if (res.ok) {
        setStep("submitted");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-loading">
        <div className="loading-spinner" />
        <p>Loading application…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="apply-error">
        <p>Job not found.</p>
        <button onClick={() => router.push("/dashboard")} className="btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="apply-page">
      {/* Progress bar header */}
      <div className="apply-header">
        <div className="apply-header-inner">
          <button className="back-btn" onClick={() => router.back()}>← Back</button>
          <div className="apply-steps">
            {(["overview", "questions", "review"] as WizardStep[]).map((s, i) => (
              <div key={s} className={`apply-step ${step === s ? "active" : ""} ${["overview","questions","review","submitted"].indexOf(step) > i ? "done" : ""}`}>
                <div className="step-dot">{["overview","questions","review","submitted"].indexOf(step) > i ? "" : i + 1}</div>
                <span className="step-label">{s === "overview" ? "Overview" : s === "questions" ? "Questions" : "Review"}</span>
              </div>
            ))}
          </div>
          <div style={{ width: 80 }} />
        </div>
        <div className="apply-progress-track">
          <div className="apply-progress-fill" style={{ width: step === "overview" ? "10%" : step === "questions" ? "55%" : step === "review" ? "90%" : "100%" }} />
        </div>
      </div>

      <div className="apply-content">
        {/* ── Step 1: Overview ── */}
        {step === "overview" && (
          <div className="apply-card">
            <div className="job-overview-header">
              <div className="job-overview-icon"></div>
              <div>
                <h1 className="job-overview-title">{job.title}</h1>
                <p className="job-overview-company">{job.employer.name}</p>
                <div className="job-overview-meta">
                  <span> {job.location}</span>
                  <span> {job.employmentType}</span>
                  <span> {job.workArrangement}</span>
                </div>
              </div>
            </div>

            <div className="overview-section">
              <h3>Cover Letter <span className="optional-tag">optional</span></h3>
              <p className="overview-hint">A brief, relevant cover letter can significantly improve your chances.</p>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder={`Dear Hiring Team at ${job.employer.name},\n\nI am excited to apply for the ${job.title} role…`}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />
            </div>

            <div className="overview-info">
              {questions.length > 0 ? (
                <div className="info-box info-box-blue">
                   <span className="font-semibold text-[#f1f5f9]">Next:</span> {questions.length} application {questions.length === 1 ? "question" : "questions"} specific to this role
                </div>
              ) : (
                <div className="info-box info-box-green">
                   No additional questions. You can submit right after reviewing.
                </div>
              )}
            </div>

            <div className="step-actions">
              <button
                className="btn-primary btn-lg"
                onClick={() => setStep(questions.length > 0 ? "questions" : "review")}
              >
                {questions.length > 0 ? "Next: Answer Questions →" : "Review Application →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Questions ── */}
        {step === "questions" && (
          <div className="apply-card">
            <div className="questions-header">
              <h2>Application Questions</h2>
              <p>These questions help {job.employer.name} find the right fit for this role.</p>
            </div>

            <div className="questions-list">
              {getVisibleQuestions().map((q, idx) => (
                <div key={q.id} className="question-block">
                  <label className="question-label">
                    {idx + 1}. {q.question}
                    {q.required && <span className="required-star">*</span>}
                  </label>

                  {q.type === "text" && (
                    <input
                      className="form-input"
                      value={answers[q.id] || ""}
                      onChange={e => handleAnswer(q.id, e.target.value)}
                      placeholder="Your answer…"
                    />
                  )}

                  {q.type === "textarea" && (
                    <textarea
                      className="form-textarea"
                      rows={4}
                      value={answers[q.id] || ""}
                      onChange={e => handleAnswer(q.id, e.target.value)}
                      placeholder="Your answer…"
                    />
                  )}

                  {q.type === "number" && (
                    <input
                      type="number"
                      className="form-input"
                      value={answers[q.id] || ""}
                      onChange={e => handleAnswer(q.id, e.target.value)}
                      min={0}
                    />
                  )}

                  {q.type === "date" && (
                    <input
                      type="date"
                      className="form-input"
                      value={answers[q.id] || ""}
                      onChange={e => handleAnswer(q.id, e.target.value)}
                    />
                  )}

                  {q.type === "boolean" && (
                    <div className="bool-options">
                      {["Yes", "No"].map(opt => (
                        <button
                          key={opt}
                          className={`bool-btn ${answers[q.id] === (opt === "Yes") ? "selected" : ""}`}
                          onClick={() => handleAnswer(q.id, opt === "Yes")}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "single_select" && (
                    <div className="select-options">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          className={`select-btn ${answers[q.id] === opt ? "selected" : ""}`}
                          onClick={() => handleAnswer(q.id, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === "multi_select" && (
                    <div className="select-options multi">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          className={`select-btn ${(answers[q.id] || []).includes(opt) ? "selected" : ""}`}
                          onClick={() => handleMultiSelectToggle(q.id, opt)}
                        >
                          {(answers[q.id] || []).includes(opt) ? " " : ""}{opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="step-actions">
              <button className="btn-ghost" onClick={() => setStep("overview")}>← Back</button>
              <button
                className="btn-primary btn-lg"
                onClick={() => setStep("review")}
                disabled={missingRequired()}
              >
                Review Application →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === "review" && (
          <div className="apply-card">
            <h2>Review Your Application</h2>
            <p className="review-sub">Please review everything before submitting. You can go back to make changes.</p>

            <div className="review-section">
              <h4>Applying for</h4>
              <div className="review-job-box">
                <span className="font-semibold text-[#f1f5f9]">{job.title}</span>
                <span>{job.employer.name} · {job.location}</span>
              </div>
            </div>

            {coverLetter && (
              <div className="review-section">
                <h4>Cover Letter</h4>
                <div className="review-text-box">{coverLetter}</div>
              </div>
            )}

            {getVisibleQuestions().length > 0 && (
              <div className="review-section">
                <h4>Your Answers</h4>
                <div className="review-answers">
                  {getVisibleQuestions().map(q => {
                    const val = answers[q.id];
                    let display = "—";
                    if (val !== undefined && val !== null && val !== "") {
                      if (typeof val === "boolean") display = val ? "Yes" : "No";
                      else if (Array.isArray(val)) display = val.join(", ");
                      else display = String(val);
                    }
                    return (
                      <div key={q.id} className="review-answer-row">
                        <span className="review-q">{q.question}</span>
                        <span className="review-a">{display}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="step-actions">
              <button className="btn-ghost" onClick={() => setStep(questions.length > 0 ? "questions" : "overview")}>← Back</button>
              <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit Application "}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Submitted ── */}
        {step === "submitted" && (
          <div className="apply-card apply-success">
            <div className="success-icon"></div>
            <h2>Application Submitted!</h2>
            <p>Your application for <span className="font-semibold text-[#f1f5f9]">{job.title}</span> at <span className="font-semibold text-[#f1f5f9]">{job.employer.name}</span> has been submitted.</p>
            <p className="success-hint">You'll receive a notification when the employer reviews your application.</p>
            <div className="step-actions" style={{ justifyContent: "center" }}>
              <button className="btn-primary" onClick={() => router.push("/dashboard/applications")}>
                View My Applications
              </button>
              <button className="btn-ghost" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .apply-page {
          min-height: 100vh;
          background: var(--bg-primary, #0f0f1a);
          color: var(--text-primary, #f1f5f9);
        }

        .apply-loading, .apply-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
          color: rgba(255,255,255,0.5);
        }

        .loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(167,139,250,0.2);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .apply-header {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .apply-header-inner {
          max-width: 720px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .back-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0;
          transition: color 0.2s;
          width: 80px;
          text-align: left;
        }
        .back-btn:hover { color: #f1f5f9; }

        .apply-steps {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .apply-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0.4;
          transition: opacity 0.2s;
        }
        .apply-step.active, .apply-step.done { opacity: 1; }
        .apply-step.active .step-dot { background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; }
        .apply-step.done .step-dot { background: #22c55e; color: white; }

        .step-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }

        .apply-progress-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
        }

        .apply-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #2563eb);
          transition: width 0.5s ease;
        }

        .apply-content {
          max-width: 720px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .apply-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2rem;
        }

        .apply-success {
          text-align: center;
          padding: 3rem 2rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .apply-success h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.75rem;
        }

        .apply-success p {
          color: rgba(255,255,255,0.6);
          margin: 0 0 0.5rem;
        }

        .success-hint { font-size: 0.875rem; }

        .job-overview-header {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          margin-bottom: 1.75rem;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .job-overview-icon {
          font-size: 2.5rem;
          width: 56px; height: 56px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .job-overview-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 0.25rem;
        }

        .job-overview-company {
          color: rgba(255,255,255,0.55);
          font-size: 0.9rem;
          margin: 0 0 0.5rem;
        }

        .job-overview-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .job-overview-meta span {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
        }

        .overview-section { margin-bottom: 1.5rem; }

        .overview-section h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .optional-tag {
          font-size: 0.72rem;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .overview-hint {
          color: rgba(255,255,255,0.45);
          font-size: 0.85rem;
          margin: 0 0 0.75rem;
        }

        .info-box {
          border-radius: 10px;
          padding: 0.8rem 1rem;
          font-size: 0.875rem;
          margin-top: 1.25rem;
        }

        .info-box-blue {
          background: rgba(56,189,248,0.08);
          border: 1px solid rgba(56,189,248,0.2);
          color: #7dd3fc;
        }

        .info-box-green {
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
        }

        .step-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary.btn-lg { padding: 0.8rem 1.75rem; font-size: 0.95rem; }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(124,58,237,0.4);
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 0.65rem 1.25rem;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }

        .btn-submit {
          background: linear-gradient(135deg, #059669, #0284c7);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.8rem 2rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(5,150,105,0.4);
        }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .questions-header { margin-bottom: 1.75rem; }
        .questions-header h2 { font-size: 1.35rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.4rem; }
        .questions-header p { color: rgba(255,255,255,0.5); font-size: 0.875rem; margin: 0; }

        .questions-list { display: flex; flex-direction: column; gap: 1.5rem; }

        .question-block { display: flex; flex-direction: column; gap: 0.75rem; }

        .question-label {
          font-size: 0.925rem;
          font-weight: 600;
          color: #f1f5f9;
          line-height: 1.4;
        }

        .required-star { color: #f87171; margin-left: 0.2rem; }

        .form-input, .form-textarea {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          color: #f1f5f9;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .form-input:focus, .form-textarea:focus {
          border-color: rgba(167,139,250,0.5);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
        }
        .form-textarea { resize: vertical; }

        .bool-options, .select-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .bool-btn, .select-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.45rem 1rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .bool-btn.selected, .select-btn.selected {
          background: rgba(124,58,237,0.15);
          border-color: rgba(124,58,237,0.5);
          color: #a78bfa;
          font-weight: 600;
        }

        .bool-btn:hover, .select-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: #f1f5f9;
        }

        .review-sub { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin: 0 0 1.5rem; }

        .review-section { margin-bottom: 1.5rem; }
        .review-section h4 {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(255,255,255,0.4);
          margin: 0 0 0.75rem;
        }

        .review-job-box {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 1rem 1.25rem;
        }
        .review-job-box strong { color: #f1f5f9; font-size: 1rem; }
        .review-job-box span { color: rgba(255,255,255,0.5); font-size: 0.875rem; }

        .review-text-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          color: rgba(255,255,255,0.65);
          font-size: 0.875rem;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .review-answers {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .review-answer-row {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 0.75rem 1rem;
        }
        .review-q { color: rgba(255,255,255,0.55); font-size: 0.82rem; }
        .review-a { color: #f1f5f9; font-size: 0.9rem; font-weight: 500; }
      `}</style>
    </div>
  );
}
