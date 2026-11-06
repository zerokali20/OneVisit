import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { ReadinessStatus } from '@/lib/types';

interface Props {
  status: ReadinessStatus;
  showIcon?: boolean;
}

export default function StatusBadge({ status, showIcon = true }: Props) {
  switch (status) {
    case 'READY':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Ready for Submission
        </span>
      );
    case 'NEEDS_CLARIFICATION':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
          Needs Clarification
        </span>
      );
    case 'BLOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
          Blocked / Ineligible
        </span>
      );
    case 'UNVERIFIED':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-500" />}
          Unverified
        </span>
      );
  }
}
