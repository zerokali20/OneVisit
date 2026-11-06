'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, PlusCircle, LayoutDashboard, BookOpen, Globe, Menu, X } from 'lucide-react';
import { createCase } from '@/lib/api';

export default function Navbar() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'si' | 'ta'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleStartNew = async () => {
    setCreating(true);
    try {
      const newCase = await createCase({
        service_type: 'SRI_LANKAN_PASSPORT',
        route: 'FIRST_TIME',
        regional_office: 'Kandy',
      });
      router.push(`/apply/${newCase.id}/questionnaire`);
    } catch (err) {
      console.error(err);
      alert('Unable to initiate application. Ensure backend server is running on port 8000.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#123B70] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Civic Branding */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner group-hover:bg-blue-500 transition-colors">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block">OneVisit</span>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest block font-medium">
                Sri Lanka Citizen Readiness
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/rules" className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
              Official Rules
            </Link>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-[#0B2447] px-2.5 py-1 rounded-full border border-blue-900 text-xs">
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded ${lang === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-1.5 py-0.5 rounded ${lang === 'si' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:text-white'}`}
              >
                සිං
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-1.5 py-0.5 rounded ${lang === 'ta' ? 'bg-blue-600 text-white font-bold' : 'text-blue-300 hover:text-white'}`}
              >
                த
              </button>
            </div>

            {/* CTA */}
            <button
              onClick={handleStartNew}
              disabled={creating}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all text-sm disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              {creating ? 'Creating...' : 'New Application'}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B2447] border-t border-blue-900 px-4 pt-3 pb-5 space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-blue-100 hover:text-white py-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/rules"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-blue-100 hover:text-white py-2"
          >
            <BookOpen className="w-4 h-4" />
            Official Verified Rules
          </Link>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleStartNew();
              }}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {creating ? 'Creating...' : 'Start New Application'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
