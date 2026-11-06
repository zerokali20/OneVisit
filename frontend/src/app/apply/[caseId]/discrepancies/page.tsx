'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw,
  FileText, ShieldAlert, Check, HelpCircle
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { fetchCase, fetchReadinessReport, resolveDiscrepancy } from '@/lib/api';
import { ApplicationCase, ReadinessReport } from '@/lib/types';

export default function DiscrepancyResolutionPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [caseData, setCaseData] = useState<ApplicationCase | null>(null);
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [confirmedValue, setConfirmedValue] = useState<string>('KAMAL MOHAN DE SILVA');
  const [explanation, setExplanation] = useState<string>(
    'The name on the Birth Certificate is my complete legal name. The initials on my NIC stand for Kamal Mohan.'
  );

  const loadData = async () => {
    try {
      const [c, r] = await Promise.all([
        fetchCase(caseId),
        fetchReadinessReport(caseId).catch(() => null),
      ]);
      setCaseData(c);
      setReport(r);
      if (r && r.discrepancies && r.discrepancies.length > 0) {
        setConfirmedValue(r.discrepancies[0].value_b || 'KAMAL MOHAN DE SILVA');
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

  const handleResolve = async (field_name: string) => {
    setResolving(true);
    try {
      const res = await resolveDiscrepancy(caseId, {
        field_name: field_name || 'full_name',
        confirmed_value: confirmedValue,
        explanation: explanation,
      });

      alert(`Discrepancy resolved. System verdict is now: ${res.new_overall_status}`);
      if (res.new_overall_status === 'READY') {
        router.push(`/apply/${caseId}/report`);
      } else {
        router.push(`/apply/${caseId}/verify`);
      }
    } catch (err) {
      alert('Failed to resolve discrepancy. Make sure backend is running.');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        Loading discrepancy center...
      </div>
    );
  }

  const discrepancies = report?.discrepancies || [];
  const missingItems = report?.missing_items || [];

  return (
    <div className="flex flex-col flex-1">
      <ProgressBar caseId={caseId} currentStep="verify" progressPercentage={85} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Discrepancy Resolution Center
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Clarification & Inconsistency Review</h1>
          <p className="text-sm text-slate-600 mt-1">
            The AI agent detected variances across submitted documents that must be clarified prior to your appointment.
          </p>
        </div>

        {/* If no discrepancies or missing items */}
        {discrepancies.length === 0 && missingItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Active Discrepancies Detected</h3>
            <p className="text-sm text-slate-500 mb-6">
              All extracted tokens match consistently across your submitted documents.
            </p>
            <button
              onClick={() => router.push(`/apply/${caseId}/report`)}
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm"
            >
              Go to Readiness Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Discrepancies List */}
            {discrepancies.map((d, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cross-Document Variance: {d.field}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {d.reason}
                    </p>
                  </div>
                </div>

                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Document A: {d.doc_a}
                    </span>
                    <p className="text-base font-bold text-slate-900 mt-1 font-mono">
                      "{d.value_a}"
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Extracted from submitted {d.doc_a}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                      Document B: {d.doc_b}
                    </span>
                    <p className="text-base font-bold text-blue-900 mt-1 font-mono">
                      "{d.value_b}"
                    </p>
                    <span className="text-[11px] text-blue-500 mt-1 block">
                      Certified legal name entry
                    </span>
                  </div>
                </div>

                {/* Statutory Guideline */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <strong>Rule LK-PASS-003:</strong> The Sri Lanka Department of Immigration requires applicant names on passports to match the certified birth registration entry. If initials on your NIC stand for your given names, you must confirm your full legal name.
                </div>

                {/* Resolution Form */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirmed Exact Legal Name to appear on Passport *
                    </label>
                    <input
                      type="text"
                      value={confirmedValue}
                      onChange={(e) => setConfirmedValue(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-semibold border border-blue-400 rounded-lg bg-blue-50/20 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Applicant Explanation / Declaration *
                    </label>
                    <textarea
                      rows={2}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleResolve('full_name')}
                    disabled={resolving}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
                  >
                    {resolving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Re-evaluating Verification Graph...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm Legal Name & Rerun Verification
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Missing Items List (if Scenario B) */}
            {missingItems.length > 0 && (
              <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Missing Required Evidence ({missingItems.length})
                </div>
                <div className="space-y-3">
                  {missingItems.map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span>{m.item}</span>
                        <span className="font-mono text-[10px] text-rose-700">{m.rule_code}</span>
                      </div>
                      <p className="text-slate-700 mt-1">{m.action}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push(`/apply/${caseId}/documents`)}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg transition-colors"
                >
                  Return to Document Upload
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="pt-6">
          <button
            onClick={() => router.push(`/apply/${caseId}/verify`)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Verification Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
