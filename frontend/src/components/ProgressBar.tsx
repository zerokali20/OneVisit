import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

interface Props {
  caseId: string;
  currentStep: 'questionnaire' | 'documents' | 'verify' | 'report';
  progressPercentage?: number;
}

const STEPS = [
  { id: 'questionnaire', label: '1. Questionnaire' },
  { id: 'documents', label: '2. Documents & OCR' },
  { id: 'verify', label: '3. AI Verification' },
  { id: 'report', label: '4. Readiness Report' },
];

export default function ProgressBar({ caseId, currentStep, progressPercentage = 25 }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <Link
                key={step.id}
                href={`/apply/${caseId}/${step.id === 'report' ? 'report' : step.id}`}
                className={`flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'text-brand-blue font-bold'
                    : isCompleted
                    ? 'text-emerald-700'
                    : 'text-slate-400 pointer-events-none'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-blue text-white ring-2 ring-blue-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(10, progressPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
