'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, FileText, CheckCircle, ArrowRight, Sparkles, AlertCircle,
  Clock, Award, HelpCircle, Layers, UserCheck, ShieldAlert
} from 'lucide-react';
import { createCase, seedSyntheticDocuments, updateCaseAnswers } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleStartApplication = async () => {
    setLoading(true);
    try {
      const newCase = await createCase({
        service_type: 'SRI_LANKAN_PASSPORT',
        route: 'FIRST_TIME',
        regional_office: 'Kandy'
      });
      router.push(`/apply/${newCase.id}/questionnaire`);
    } catch (err) {
      alert('Could not connect to backend server. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchScenarioA = async () => {
    setDemoLoading('A');
    try {
      const newCase = await createCase({
        service_type: 'SRI_LANKAN_PASSPORT',
        route: 'FIRST_TIME',
        regional_office: 'Kandy'
      });
      await updateCaseAnswers(newCase.id, [
        { question_key: 'first_time', question_text: 'Is this your first application?', answer_value: 'yes' },
        { question_key: 'previous_passport_holder', question_text: 'Have you previously held a passport?', answer_value: 'no' },
        { question_key: 'regional_office', question_text: 'Preferred regional office?', answer_value: 'Kandy' },
        { question_key: 'applicant_name', question_text: 'Full legal name?', answer_value: 'Kamal Mohan de Silva' }
      ]);
      await seedSyntheticDocuments(newCase.id, 'SCENARIO_A');
      router.push(`/apply/${newCase.id}/documents`);
    } catch (err) {
      alert('Failed to initialize demo scenario A. Ensure backend is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  const handleLaunchScenarioB = async () => {
    setDemoLoading('B');
    try {
      const newCase = await createCase({
        service_type: 'SRI_LANKAN_PASSPORT',
        route: 'PREVIOUS_HOLDER_RENEWAL',
        regional_office: 'Colombo Head Office'
      });
      await updateCaseAnswers(newCase.id, [
        { question_key: 'first_time', question_text: 'Is this your first application?', answer_value: 'no' },
        { question_key: 'previous_passport_holder', question_text: 'Have you previously held a passport?', answer_value: 'yes' },
        { question_key: 'regional_office', question_text: 'Preferred regional office?', answer_value: 'Colombo Head Office' },
        { question_key: 'applicant_name', question_text: 'Full legal name?', answer_value: 'Priyani Nimalka Fernando' }
      ]);
      await seedSyntheticDocuments(newCase.id, 'SCENARIO_B');
      router.push(`/apply/${newCase.id}/documents`);
    } catch (err) {
      alert('Failed to initialize demo scenario B. Ensure backend is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#123B70] via-[#0E2F59] to-[#0B2447] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            InnovaX 1.0 Hackathon • Agentic Civic AI MVP
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            OneVisit
          </h1>

          <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-6">
            Prepare once. Visit with confidence.
          </p>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            An AI-powered assistant that helps you check government application requirements, verify documents with OCR, and prepare thoroughly before visiting a government office.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartApplication}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 transition-all text-base disabled:opacity-50"
            >
              Start Application
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white px-6 py-3.5 rounded-xl font-semibold backdrop-blur border border-white/20 transition-all text-base"
            >
              How It Works
            </a>
          </div>

          {/* Quick Demo Launchers */}
          <div className="mt-12 pt-8 border-t border-blue-900/60 max-w-xl mx-auto">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
              1-Click Hackathon Scenarios
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleLaunchScenarioA}
                disabled={demoLoading !== null}
                className="bg-white/5 hover:bg-white/10 border border-blue-400/20 rounded-lg p-3 text-left transition-all"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Scenario A: First-Time (Kandy)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Tests cross-document name mismatch & AI clarification loop.
                </div>
              </button>

              <button
                onClick={handleLaunchScenarioB}
                disabled={demoLoading !== null}
                className="bg-white/5 hover:bg-white/10 border border-blue-400/20 rounded-lg p-3 text-left transition-all"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Scenario B: Renewal (Colombo)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Tests previous passport holder route & missing book detection.
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Three Steps to Guaranteed Readiness
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
              Eliminate multiple trips to Battaramulla or regional branches caused by missing photocopies, mismatched names, or outdated rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Questionnaire</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Answer route-specific questions. We determine whether you require a first-time All-Countries passport or an alteration/renewal.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Document OCR Extraction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload your NIC, Birth Certificate, and Photo receipt. Our OCR engine extracts fields with automated prompt-injection guards.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Agent Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                LangGraph agent inspects verified Department of Immigration rules, flags cross-document discrepancies, and generates your readiness report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Civic Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Supported Government Services</h2>
            <p className="text-slate-600 text-sm">Targeted civic preparation modules for Sri Lankan citizens.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-2 border-blue-600 rounded-xl p-5 shadow-sm">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mb-2">
                ACTIVE MVP
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-1">Sri Lankan Passport</h3>
              <p className="text-xs text-slate-600 mb-4">
                Ordinary All-Countries & renewal preparation for Colombo and Regional branches.
              </p>
              <button
                onClick={handleStartApplication}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Prepare Passport Now →
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 opacity-60">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 mb-2">
                COMING SOON
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-1">National Identity Card</h3>
              <p className="text-xs text-slate-500">
                DRP first-time e-NIC and replacement preparation.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 opacity-60">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 mb-2">
                COMING SOON
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-1">Birth Registration</h3>
              <p className="text-xs text-slate-500">
                Registrar General's Department consular and local birth records.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 opacity-60">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 mb-2">
                COMING SOON
              </span>
              <h3 className="font-bold text-slate-900 text-base mb-1">Driving License Renewal</h3>
              <p className="text-xs text-slate-500">
                DMT medical certificate & biometric queue preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Disclaimers & Ethics */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <ShieldAlert className="w-12 h-12 text-blue-300 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-blue-100 space-y-2">
            <h4 className="font-bold text-white text-base">Civic Preparation Assistant Disclaimer</h4>
            <p>
              OneVisit is an independent preparatory tool engineered to help citizens organize their documents according to publicly verified regulations. OneVisit is <strong>not</strong> an official government authority and has no legal power to approve or issue passports.
            </p>
            <p className="text-blue-300 text-xs">
              All rules are versioned and audited against the Sri Lanka Department of Immigration & Emigration guidelines.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
