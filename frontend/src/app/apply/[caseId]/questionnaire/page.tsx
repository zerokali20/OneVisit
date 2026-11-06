'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Save, HelpCircle, CheckCircle2 } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { fetchCase, updateCaseAnswers } from '@/lib/api';
import { ApplicationCase } from '@/lib/types';

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [caseData, setCaseData] = useState<ApplicationCase | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    applicant_name: '',
    nic_number: '',
    date_of_birth: '',
    first_time: 'yes',
    previous_passport_holder: 'no',
    previous_passport_reason: 'RENEWAL_EXPIRY',
    regional_office: 'Kandy',
    service_urgency: 'NORMAL',
    evidence_nic_available: 'yes',
    evidence_bc_available: 'yes',
    evidence_photo_available: 'yes',
    evidence_previous_passport_available: 'no',
  });

  useEffect(() => {
    async function load() {
      try {
        const c = await fetchCase(caseId);
        setCaseData(c);
        if (c.answers && c.answers.length > 0) {
          const map: Record<string, string> = {};
          c.answers.forEach((a) => (map[a.question_key] = a.answer_value));
          setFormData((prev) => ({
            ...prev,
            ...map,
            regional_office: c.regional_office || prev.regional_office,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'first_time') {
        if (value === 'yes') {
          updated.previous_passport_holder = 'no';
          updated.evidence_previous_passport_available = 'no';
        } else {
          updated.previous_passport_holder = 'yes';
          updated.evidence_previous_passport_available = 'yes';
        }
      }
      return updated;
    });
  };

  const handleSaveAndContinue = async (redirectNext: boolean = true) => {
    setSaving(true);
    try {
      const answersPayload = Object.entries(formData).map(([k, v]) => ({
        question_key: k,
        question_text: k.replace(/_/g, ' ').toUpperCase(),
        answer_value: v,
      }));

      await updateCaseAnswers(caseId, answersPayload);
      if (redirectNext) {
        router.push(`/apply/${caseId}/documents`);
      } else {
        alert('Progress saved successfully.');
      }
    } catch (err) {
      alert('Failed to save questionnaire. Check backend connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        Loading smart questionnaire...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <ProgressBar caseId={caseId} currentStep="questionnaire" progressPercentage={35} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Case {caseData?.case_number}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Smart Application Questionnaire</h1>
          <p className="text-sm text-slate-600 mt-1">
            Answer the following questions to identify your applicable Sri Lankan passport service route and checklist.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          {/* Section 1: Basic Identity */}
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
              Applicant Identity Declaration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name (as per Birth Certificate) *
                </label>
                <input
                  type="text"
                  value={formData.applicant_name}
                  onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                  placeholder="e.g. KAMAL MOHAN DE SILVA"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  National Identity Card (NIC) Number *
                </label>
                <input
                  type="text"
                  value={formData.nic_number}
                  onChange={(e) => handleInputChange('nic_number', e.target.value)}
                  placeholder="e.g. 199413502910 or 941350291V"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Passport Route Selection */}
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
              Passport Service Route Identification
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Is this your first Sri Lankan passport application? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('first_time', 'yes')}
                    className={`py-2.5 px-4 text-sm font-semibold rounded-lg border text-center transition-all ${
                      formData.first_time === 'yes'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Yes (First-Time Applicant)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('first_time', 'no')}
                    className={`py-2.5 px-4 text-sm font-semibold rounded-lg border text-center transition-all ${
                      formData.first_time === 'no'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    No (Previous Passport Holder)
                  </button>
                </div>
              </div>

              {formData.first_time === 'no' && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-amber-900">
                    Previous Passport Status / Reason for Renewal *
                  </label>
                  <select
                    value={formData.previous_passport_reason}
                    onChange={(e) => handleInputChange('previous_passport_reason', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="RENEWAL_EXPIRY">Expired or Expiring Passport (Renewal)</option>
                    <option value="PAGES_EXHAUSTED">Visa Pages Fully Exhausted</option>
                    <option value="LOST_STOLEN">Lost or Stolen Passport (Police Report Required)</option>
                    <option value="DAMAGED">Physically Damaged Passport</option>
                  </select>
                  <p className="text-[11px] text-amber-800">
                    <strong>Rule LK-PASS-004:</strong> Current or previous passport must be produced for physical cancellation at the Department of Immigration.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Office Jurisdiction */}
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
              Regional Office Lodgement
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Lodgement Branch *
                </label>
                <select
                  value={formData.regional_office}
                  onChange={(e) => handleInputChange('regional_office', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Kandy">Kandy Regional Branch</option>
                  <option value="Matara">Matara Regional Branch</option>
                  <option value="Vavuniya">Vavuniya Regional Branch</option>
                  <option value="Kurunegala">Kurunegala Regional Branch</option>
                  <option value="Colombo Head Office">Colombo Head Office (Battaramulla)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Urgency *
                </label>
                <select
                  value={formData.service_urgency}
                  onChange={(e) => handleInputChange('service_urgency', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="NORMAL">Normal Service (Standard delivery)</option>
                  <option value="ONE_DAY">One-Day Urgent Service</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Available Evidence */}
          <div>
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
              Evidence Readiness Checklist
            </h2>
            <div className="space-y-2.5 text-sm">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evidence_nic_available === 'yes'}
                  onChange={(e) => handleInputChange('evidence_nic_available', e.target.checked ? 'yes' : 'no')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-slate-800 font-medium">Original National Identity Card (Smart Card or Paper NIC)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evidence_bc_available === 'yes'}
                  onChange={(e) => handleInputChange('evidence_bc_available', e.target.checked ? 'yes' : 'no')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-slate-800 font-medium">Original Certified Birth Certificate (Registrar General's Dept)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evidence_photo_available === 'yes'}
                  onChange={(e) => handleInputChange('evidence_photo_available', e.target.checked ? 'yes' : 'no')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-slate-800 font-medium">Biometric Studio Photo Receipt with ICAO Barcode</span>
              </label>

              {formData.first_time === 'no' && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/40 hover:bg-amber-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.evidence_previous_passport_available === 'yes'}
                    onChange={(e) => handleInputChange('evidence_previous_passport_available', e.target.checked ? 'yes' : 'no')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-amber-900 font-medium">Previous Passport Book in possession for cancellation</span>
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSaveAndContinue(false)}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>

              <button
                type="button"
                onClick={() => handleSaveAndContinue(true)}
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all disabled:opacity-50"
              >
                Continue to Documents
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
