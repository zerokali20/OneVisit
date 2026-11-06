'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  Sparkles, RefreshCw, Eye, Edit3, ShieldCheck, Check
} from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import { fetchCase, fetchDocuments, seedSyntheticDocuments, confirmExtractedField } from '@/lib/api';
import { ApplicationCase, DocumentItem } from '@/lib/types';

export default function DocumentUploadPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [caseData, setCaseData] = useState<ApplicationCase | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const loadData = async () => {
    try {
      const [c, docs] = await Promise.all([fetchCase(caseId), fetchDocuments(caseId)]);
      setCaseData(c);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleSeedSynthetic = async (scenario: 'SCENARIO_A' | 'SCENARIO_B') => {
    setSeeding(true);
    try {
      const seeded = await seedSyntheticDocuments(caseId, scenario);
      setDocuments(seeded);
    } catch (err) {
      alert('Failed to seed synthetic documents. Make sure backend is running.');
    } finally {
      setSeeding(false);
    }
  };

  const handleConfirmField = async (fieldId: string, correctedValue?: string) => {
    try {
      await confirmExtractedField(caseId, fieldId, true, correctedValue);
      setEditingFieldId(null);
      await loadData();
    } catch (err) {
      alert('Failed to confirm field');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-400">
        Loading document repository...
      </div>
    );
  }

  const isRenewal = caseData?.route === 'PREVIOUS_HOLDER_RENEWAL';

  return (
    <div className="flex flex-col flex-1">
      <ProgressBar caseId={caseId} currentStep="documents" progressPercentage={60} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Case {caseData?.case_number}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Document Upload & Field Extraction</h1>
            <p className="text-sm text-slate-600 mt-1">
              Upload required civic evidence. Review extracted OCR fields and confirm legal values.
            </p>
          </div>

          {/* Hackathon Quick-Seed Bar */}
          <div className="flex items-center gap-2 bg-blue-50/80 p-2 rounded-xl border border-blue-200">
            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Demo Quick-Load:
            </span>
            <button
              onClick={() => handleSeedSynthetic('SCENARIO_A')}
              disabled={seeding}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-600 hover:text-white text-blue-800 rounded-lg border border-blue-300 transition-colors shadow-sm disabled:opacity-50"
            >
              Scenario A (Silva)
            </button>
            <button
              onClick={() => handleSeedSynthetic('SCENARIO_B')}
              disabled={seeding}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-600 hover:text-white text-blue-800 rounded-lg border border-blue-300 transition-colors shadow-sm disabled:opacity-50"
            >
              Scenario B (Fernando)
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center mb-8 hover:border-blue-400 transition-colors">
          <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Drag and drop supporting documents or click to browse
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Supports PDF, JPG, PNG up to 10MB. (Original NIC, Birth Certificate, Studio Photo Receipt)
          </p>
          <div className="inline-flex gap-3">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
              Upload File
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
            </label>
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg border border-slate-300">
              Take Photo
              <input type="file" capture="environment" accept="image/*" className="hidden" />
            </label>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
            <span>Uploaded Documents ({documents.length})</span>
            {documents.length > 0 && (
              <span className="text-xs font-normal text-slate-500">
                All uploaded files are safeguarded by prompt-injection sanitization.
              </span>
            )}
          </h2>

          {documents.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              No documents uploaded yet. Use the quick-load buttons above or upload your documents.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.file_name}</h4>
                      <p className="text-xs text-slate-500">
                        Type: <span className="font-semibold text-slate-700">{doc.doc_type}</span> • Size: {Math.round(doc.file_size / 1024)} KB
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    OCR Processed
                  </span>
                </div>

                {/* Extracted Fields */}
                <div>
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Extracted Fields (Confirm Accuracy)
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {doc.extracted_fields.map((field) => (
                      <div
                        key={field.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">
                            {field.field_name.replace(/_/g, ' ')}
                          </span>
                          {editingFieldId === field.id ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-2 py-1 text-xs border border-blue-400 rounded bg-white w-full"
                              />
                              <button
                                onClick={() => handleConfirmField(field.id, editValue)}
                                className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"
                                title="Save"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-800 truncate block">
                              {field.user_corrected_value || field.field_value}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {field.user_confirmed ? (
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                              Confirmed
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingFieldId(field.id);
                                setEditValue(field.user_corrected_value || field.field_value);
                              }}
                              className="text-slate-400 hover:text-blue-600 p-1"
                              title="Edit Field"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <button
            onClick={() => router.push(`/apply/${caseId}/questionnaire`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Questionnaire
          </button>

          <button
            onClick={() => router.push(`/apply/${caseId}/verify`)}
            disabled={documents.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            Launch AI Verification Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
