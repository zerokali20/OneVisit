'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchRules } from '@/lib/api';
import { ServiceRule } from '@/lib/types';

export default function RulesPage() {
  const [rules, setRules] = useState<ServiceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRules();
        setRules(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-3 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          Verified Sri Lankan Passport Service Rules
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Every rule enforced by OneVisit is strictly verified against published Department of Immigration & Emigration (DIE) guidelines.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading verified rules...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {rule.rule_code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rule.review_status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rule.review_status} (v{rule.version})
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{rule.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Verified: {new Date(rule.verification_date).toLocaleDateString()}
                </span>
                <a
                  href={rule.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                >
                  Source Link
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
