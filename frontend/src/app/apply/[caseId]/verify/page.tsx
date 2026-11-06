'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Cpu, Play, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  RefreshCw, ShieldCheck, Terminal, BookOpen, Layers, Check, ChevronRight
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import { fetchCase, triggerVerification, fetchAgentActions } from '@/lib/api';
import { ApplicationCase, AgentAction } from '@/lib/types';

export default function VerificationWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [caseData, setCaseData] = useState<ApplicationCase | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [verificationSummary, setVerificationSummary] = useState<any>(null);

  const loadData = async () => {
    try {
      const [c, acts] = await Promise.all([
        fetchCase(caseId),
        fetchAgentActions(caseId),
      ]);
      setCaseData(c);
      setActions(acts);
      if (acts.length > 0) {
        setActiveStep(acts[acts.length - 1].step_index);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleRunAgent = async () => {
    setRunning(true);
    try {
      const summary = await triggerVerification(caseId);
      setVerificationSummary(summary);
      await loadData();
    } catch (err) {
      alert('Verification loop failed. Make sure backend is running.');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        Loading AI verification workspace...
      </div>
    );
  }

  const hasDiscrepancies = caseData?.readiness_status === 'NEEDS_CLARIFICATION' && verificationSummary?.discrepancies_count > 0;
  const isReady = caseData?.readiness_status === 'READY';

  return (
    <div className="flex flex-col flex-1">
      <ProgressBar caseId={caseId} currentStep="verify" progressPercentage={caseData?.progress_percentage || 75} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Case {caseData?.case_number}
              </span>
              <StatusBadge status={caseData?.readiness_status || 'UNVERIFIED'} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-600" />
              AI Verification Workspace
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Autonomous LangGraph agent inspecting case state, running deterministic checks, and evaluating readiness.
            </p>
          </div>

          <button
            onClick={handleRunAgent}
            disabled={running}
            className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Agent Loop...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Run AI Verification Agent
              </>
            )}
          </button>
        </div>

        {/* Live Loop Visualizer: PERCEIVE -> DECIDE -> ACT -> LOOP */}
        <div className="bg-[#0B2447] text-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between border-b border-blue-900/80 pb-4 mb-4">
            <h2 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              LangGraph Agent Execution Cycle
            </h2>
            <span className="text-xs text-blue-200 bg-blue-900/60 px-3 py-1 rounded-full font-mono">
              Status: {caseData?.readiness_status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border text-center transition-all ${
              actions.length > 0 ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-blue-900 text-blue-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Phase 1</div>
              <div className="text-sm font-bold mt-1">PERCEIVE</div>
              <div className="text-[11px] text-blue-200 mt-1 font-mono">get_case_state</div>
            </div>

            <div className={`p-3 rounded-xl border text-center transition-all ${
              actions.length > 1 ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-blue-900 text-blue-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Phase 2</div>
              <div className="text-sm font-bold mt-1">DECIDE</div>
              <div className="text-[11px] text-blue-200 mt-1 font-mono">retrieve_rules</div>
            </div>

            <div className={`p-3 rounded-xl border text-center transition-all ${
              actions.length > 2 ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-blue-900 text-blue-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Phase 3</div>
              <div className="text-sm font-bold mt-1">ACT</div>
              <div className="text-[11px] text-blue-200 mt-1 font-mono">evaluate_rules</div>
            </div>

            <div className={`p-3 rounded-xl border text-center transition-all ${
              actions.length > 4 ? 'bg-blue-900/40 border-blue-500 text-white' : 'border-blue-900 text-blue-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Phase 4</div>
              <div className="text-sm font-bold mt-1">LOOP & REPORT</div>
              <div className="text-[11px] text-blue-200 mt-1 font-mono">generate_report</div>
            </div>
          </div>
        </div>

        {/* Action History Log & Status Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left 2 Cols: Activity Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Agent Activity History ({actions.length} Steps)</span>
              <span className="text-xs text-slate-500 font-normal">Deterministic tool logs</span>
            </h2>

            {actions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
                The agent has not run yet. Click "Run AI Verification Agent" to start autonomous verification.
              </div>
            ) : (
              <div className="space-y-3">
                {actions.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {act.step_index}
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-900 bg-slate-100 px-2 py-0.5 rounded">
                          {act.action_name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(act.created_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium mb-2">
                      {act.rationale}
                    </p>

                    {act.action_output && (
                      <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] font-mono text-slate-600 overflow-x-auto border border-slate-100">
                        {act.action_output}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Col: Quick Decision Center */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Verification Verdict
              </h3>

              <div className="text-center py-3">
                <StatusBadge status={caseData?.readiness_status || 'UNVERIFIED'} />
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  <strong>Route:</strong> {caseData?.route}
                </p>
                <p>
                  <strong>Office:</strong> {caseData?.regional_office}
                </p>
                <p>
                  <strong>Progress:</strong> {caseData?.progress_percentage}%
                </p>
              </div>

              {/* Conditional Next-Step Banners */}
              {caseData?.readiness_status === 'NEEDS_CLARIFICATION' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Action Required
                  </div>
                  <p className="text-[11px] text-amber-800">
                    The agent discovered an inconsistency or missing evidence requiring your review.
                  </p>
                  <button
                    onClick={() => router.push(`/apply/${caseId}/discrepancies`)}
                    className="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Resolve Discrepancies
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {caseData?.readiness_status === 'READY' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Application Ready
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    All requirements satisfied. Download your official-referenced readiness report.
                  </p>
                  <button
                    onClick={() => router.push(`/apply/${caseId}/report`)}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm"
                  >
                    View Readiness Report
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Official Authority Notice */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-2">
              <span className="font-bold text-slate-700 block">Deterministic Guardrails Active</span>
              <p>
                All decisions are enforced by hard-coded Sri Lankan statutory rules. The LLM cannot fabricate approval or bypass missing evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            onClick={() => router.push(`/apply/${caseId}/documents`)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </button>

          {caseData?.readiness_status === 'READY' ? (
            <button
              onClick={() => router.push(`/apply/${caseId}/report`)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              Go to Readiness Report
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/apply/${caseId}/discrepancies`)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              Discrepancy Resolution
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
