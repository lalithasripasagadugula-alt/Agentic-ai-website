import React, { useState } from 'react';
import {
  ExternalLink,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const N8N_FEEDBACK_FORM_URL =
  'https://navyapriya.app.n8n.cloud/form/4fdcbe98-0900-4da1-8db0-06a4315ae2c3';

export const StudentFeedbackPage: React.FC = () => {
  const { student } = useApp();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleReload = () => {
    setIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#A5E6E2]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F0FAF9] border border-[#77DAD7]/50 text-[#0B757B] text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5 text-[#0A858C]" />
            <span>Student Academic Intake & Feedback</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B757B] tracking-tight">
            ProAct AI Student Form & Survey
          </h1>
          <p className="text-xs text-slate-500">
            Submit course feedback, academic support requests, or evaluation surveys directly through our verified n8n workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleReload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Reload form embed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${!iframeLoaded ? 'animate-spin text-[#0A858C]' : ''}`} />
            <span>Reload</span>
          </button>

          <a
            href={N8N_FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B757B] hover:bg-[#0A858C] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>Open in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-[#F0FAF9] border border-[#77DAD7]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#0B757B] border border-[#A5E6E2]/70 shadow-xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#0A858C]" />
          </div>
          <div>
            <p className="font-bold text-[#0B757B]">
              Automated Cloud Form Integration (n8n Cloud)
            </p>
            <p className="text-[11px] text-slate-500">
              Form responses are processed in real-time by your automated n8n cloud pipeline.
              {student ? ` Pre-associating records with student: ${student.fullName} (${student.studentId || student.email}).` : ''}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#0A858C] bg-white px-2.5 py-1 rounded-md border border-[#A5E6E2]/50 shrink-0">
          navyapriya.app.n8n.cloud
        </span>
      </div>

      {/* Embedded Form Card */}
      <div className="bg-white rounded-2xl border border-[#A5E6E2]/60 shadow-xs overflow-hidden flex flex-col">
        {/* Card toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Live n8n Form Gateway</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Encrypted SSL</span>
            <a
              href={N8N_FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0B757B] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>Direct Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Loading state indicator */}
        {!iframeLoaded && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0B757B]" />
            <p className="text-xs font-medium">Connecting to n8n Cloud Form...</p>
            <p className="text-[11px] text-slate-400">
              If the form does not display due to browser restrictions, you can{' '}
              <a
                href={N8N_FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B757B] underline font-bold"
              >
                open it directly here
              </a>.
            </p>
          </div>
        )}

        {/* The iframe embed */}
        <div className="w-full relative min-h-[680px]">
          <iframe
            key={iframeKey}
            src={N8N_FEEDBACK_FORM_URL}
            title="ProAct AI Student Intake & Feedback Form"
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-[720px] border-0"
            allow="camera; microphone; geolocation"
          />
        </div>

        {/* Footer fallback */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Having trouble loading the embedded view?</span>
          <a
            href={N8N_FEEDBACK_URL_HELPER}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#0B757B] hover:text-[#0A858C] inline-flex items-center gap-1"
          >
            Launch n8n Form in a dedicated browser window →
          </a>
        </div>
      </div>
    </div>
  );
};

const N8N_FEEDBACK_URL_HELPER = N8N_FEEDBACK_FORM_URL;
