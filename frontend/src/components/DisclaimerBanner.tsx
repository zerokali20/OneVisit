import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-center gap-2">
      <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
      <span>
        <strong>Official Notice:</strong> OneVisit is an independent civic preparation assistant and is <u>not</u> affiliated with the Department of Immigration and Emigration Sri Lanka. It does not grant, approve, or guarantee passport applications.
      </span>
    </div>
  );
}
