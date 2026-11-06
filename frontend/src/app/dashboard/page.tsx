'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileText, ArrowRight, Clock, AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';
import { fetchCases, createCase } from '@/lib/api';
import { ApplicationCase } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleStartNew = async () => {
    setCreating(true);
    try {
      const newCase = await createCase({
        service_type: 'SRI_LANKAN_PASSPORT',
        route: 'FIRST_TIME',
        regional_office: 'Kandy'
      });
      router.push(`/apply/${newCase.id}/questionnaire`);
    } catch (err) {
      alert('Could not start new application. Make sure backend is running.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Application Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage your Sri Lankan passport preparation cases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCases}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh Cases"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleStartNew}
            disabled={creating}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {creating ? 'Starting...' : 'New Application'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium">Loading applications...</p>
        </div>
      ) : cases.length === 0 ? (
        /* Empty State */
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <FolderSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Applications Found</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            You have not started any passport preparation cases yet. Start a new application or try one of the hackathon demonstration scenarios.
          </p>
          <button
            onClick={handleStartNew}
            disabled={creating}
            className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Start First Application
          </button>
        </div>
      ) : (
        /* List of cases */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    {c.case_number}
                  </span>
                  <StatusBadge status={c.readiness_status} />
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Sri Lankan Passport
                </h3>
                <div className="text-xs text-slate-600 space-y-1 mb-4">
                  <p>
                    <span className="text-slate-400">Route:</span>{' '}
                    <span className="font-medium text-slate-800">
                      {c.route === 'PREVIOUS_HOLDER_RENEWAL' ? 'Previous Holder Renewal' : 'First-Time Applicant'}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">Regional Branch:</span>{' '}
                    <span className="font-medium text-slate-800">{c.regional_office || 'Not Selected'}</span>
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(c.updated_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Preparation Progress</span>
                    <span className="font-semibold text-slate-700">{c.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${c.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/apply/${c.id}/${c.readiness_status === 'READY' ? 'report' : 'questionnaire'}`}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-semibold text-xs py-2.5 rounded-lg transition-colors"
              >
                {c.readiness_status === 'READY' ? 'View Readiness Report' : 'Continue Preparation'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
