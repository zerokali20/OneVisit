import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ExternalLink, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              OneVisit
            </div>
            <p className="text-slate-400 leading-relaxed">
              Agentic AI for verified Sri Lankan government application readiness. InnovaX 1.0 Hackathon Project.
            </p>
          </div>

          {/* Supported Services */}
          <div>
            <h4 className="text-white font-semibold mb-3">Supported Services</h4>
            <ul className="space-y-2">
              <li className="text-blue-400 font-medium">Sri Lankan Passport (Ordinary / Renewal)</li>
              <li className="text-slate-500 cursor-not-allowed">National Identity Card (Upcoming)</li>
              <li className="text-slate-500 cursor-not-allowed">Birth Registration (Upcoming)</li>
              <li className="text-slate-500 cursor-not-allowed">Driving License Renewal (Upcoming)</li>
            </ul>
          </div>

          {/* Official Resources */}
          <div>
            <h4 className="text-white font-semibold mb-3">Official References</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="http://www.immigration.gov.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  Dept. of Immigration & Emigration
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://drp.gov.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  Dept. for Registration of Persons
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Guardrails */}
          <div>
            <h4 className="text-white font-semibold mb-3">Security & Privacy</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                Zero-Retention Document Vault
              </p>
              <p>Uploaded applicant documents are processed locally and synthetic test records are used for demonstrations.</p>
            </div>
          </div>
        </div>

        {/* Bottom Legal Notice */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 OneVisit Civic Technologies. InnovaX 1.0 Submission.</p>
          <p className="text-[11px] text-slate-500 text-center md:text-right">
            Independent preparation platform. Not an official agency of the Government of Sri Lanka.
          </p>
        </div>
      </div>
    </footer>
  );
}
