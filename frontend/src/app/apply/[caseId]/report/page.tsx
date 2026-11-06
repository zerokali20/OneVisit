'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Download, Printer, CheckCircle2, AlertTriangle, ExternalLink,
  ShieldCheck, FileText, ArrowLeft, ArrowRight, RefreshCw, Calendar, Building
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import StatusBadge from '@/components/StatusBadge';
import { fetchCase, fetchReadinessReport, getPdfDownloadUrl } from '@/lib/api';
import { ApplicationCase, ReadinessReport } from '@/lib/types';

export default function ReadinessReportPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<ApplicationCase | null>(null);
  const [report, setReport] = useState<ReadinessReport | null>(null);

  const loadData = async () => {
    try {
      const [c, r] = await Promise.all([
        fetchCase(caseId),
        fetchReadinessReport(caseId).catch(() => null),
      ]);
      setCaseData(c);
      setReport(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        Compiling readiness report...
      </div>
    );
  }

  const pdfUrl = getPdfDownloadUrl(caseId);

  return (
    <div className="flex flex-col flex-1">
      <ProgressBar caseId={caseId} currentStep="report" progressPercentage={100} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Readiness Certificate
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Application Preparation Report
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Personalized checklist verified against official Department of Immigration regulations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#123B70] hover:bg-blue-900 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </a>
          </div>
        </div>

        {/* Report Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Header Banner */}
          <div className="bg-[#123B70] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest block">
                Official Preparation Assessment
              </span>
              <h2 className="text-2xl font-black mt-1">OneVisit Sri Lanka</h2>
              <p className="text-xs text-blue-200 mt-1">
                Generated: {new Date(report?.generated_at || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-blue-200 block uppercase">Overall Verdict</span>
              <div className="mt-1">
                <StatusBadge status={report?.overall_status || 'UNVERIFIED'} />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Meta Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Case Reference</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{caseData?.case_number}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Service Route</span>
                <span className="font-bold text-slate-800">
                  {caseData?.route === 'PREVIOUS_HOLDER_RENEWAL' ? 'Renewal / Alteration' : 'First-Time Applicant'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Regional Office</span>
                <span className="font-bold text-slate-800">{caseData?.regional_office}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Jurisdiction</span>
                <span className="font-bold text-emerald-700">Authorized Branch</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Preparation Assessment Summary
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                {report?.summary}
              </p>
            </div>

            {/* Satisfied Requirements */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Satisfied Requirements ({report?.satisfied_rules?.length || 0})
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {report?.satisfied_rules?.map((r, idx) => (
                  <div key={idx} className="p-3.5 flex items-start gap-3 bg-white">
                    <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex-shrink-0">
                      {r.rule_code}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{r.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending or Missing Items */}
            {report?.missing_items && report.missing_items.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Missing Required Evidence ({report.missing_items.length})
                </h3>
                <div className="border border-rose-200 rounded-xl overflow-hidden divide-y divide-rose-100 text-xs">
                  {report.missing_items.map((m, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-rose-950 block">{m.item}</span>
                        <span className="text-slate-600">{m.action}</span>
                      </div>
                      <span className="font-mono text-[10px] text-rose-800 bg-rose-100 px-2 py-0.5 rounded self-start sm:self-center">
                        {m.rule_code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report?.recommendations && report.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recommended Next Actions
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Source Citations */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Authoritative Legal Sources & Verification Dates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {report?.official_sources?.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-blue-700 block">{src.rule_code}</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{src.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Verified {new Date(src.verified).toLocaleDateString()}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>

            {/* Critical Legal Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Statutory Notice
              </div>
              <p className="leading-relaxed">
                A status of <strong>READY</strong> means your application passed all verified checklist requirements in OneVisit. Final acceptance, fee assessment, and issuance remain strictly at the statutory discretion of Department of Immigration and Emigration Sri Lanka officers at the time of lodgement.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/apply/${caseId}/verify`)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Verification
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
          >
            Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
