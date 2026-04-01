
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, ShieldCheck, Mail, Share2, MessageCircle, DownloadCloud } from 'lucide-react';
import ElectionBanner from '../components/ElectionBanner';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
/* eslint-disable @typescript-eslint/no-explicit-any */

function SuccessContent() {
  const searchParams = useSearchParams();
  const [refId, setRefId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = searchParams.get('refId') || 'DUR-REF-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    setTimestamp(new Date().toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
    // Use a microtask to avoid synchronous setState in effect
    queueMicrotask(() => setRefId(id));
  }, [searchParams]);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsExporting(true);
    try {
      const element = receiptRef.current;
      
      // Force standard colors and reveal hidden print elements
      const printOnlyElements = element.querySelectorAll('.hidden.print\\:block');
      printOnlyElements.forEach((el: any) => {
        el.style.setProperty('display', 'block', 'important');
      });

      // Use html-to-image which is much more robust with modern CSS (lab/oklch)
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0', // Flatten for PDF
        }
      });

      // Restore hidden print elements
      printOnlyElements.forEach((el: any) => {
        el.style.display = '';
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DUR-Election-Receipt-${refId}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const shareMessage = `DUR Welfare Election 2026: My vote has been cast successfully! Official Reference ID: ${refId}. Verified by DUR Election Portal.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center print:p-0 print:py-0 print:max-w-none">
      <div className="mb-10 relative inline-block print:hidden">
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative bg-white dark:bg-zinc-900 p-6 rounded-full shadow-2xl shadow-green-500/20 border-8 border-green-50 dark:border-green-900/20">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-6 tracking-tight print:hidden">
        Vote Cast Successfully
      </h1>
      
      <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-12 leading-relaxed max-w-lg mx-auto print:hidden">
        Your participation in the 2026 Welfare Election is confirmed. 
        Your selections have been encrypted and securely stored.
      </p>
      
      {/* Official Receipt Card - Enhanced for PDF Export */}
      <div 
        ref={receiptRef}
        id="receipt-card" 
        className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden mb-12 flex flex-col print:shadow-none print:border-zinc-300 print:rounded-none print:mb-0"
      >
        {refId ? (
          <>
            {/* Receipt Header - Revealed for PDF */}
            <div className="hidden print:block p-8 border-b-2 border-zinc-200 text-left bg-zinc-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter">Department of Urban Roads</h2>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Official Election Receipt</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase">2026 Welfare Committee Election</p>
                </div>
              </div>
            </div>

            <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 print:bg-white print:border-zinc-200">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 hidden print:block">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3">
                  Reference Identifier
                </p>
                <p className="text-3xl sm:text-4xl font-mono font-black text-zinc-900 dark:text-zinc-100 tracking-tighter break-all px-4">
                  {refId}
                </p>
                <div className="mt-6 flex flex-col items-center gap-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Submission Timestamp</p>
                  <p className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">{timestamp}</p>
                </div>
              </div>
            </div>
            
            <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2">
              <div className="flex items-center gap-4 text-left p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700 print:bg-white print:border-zinc-200">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 print:bg-blue-50">
                  <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Verified Secure</p>
                  <p className="text-xs text-zinc-500 font-medium">Recorded on the department&apos;s encrypted ledger.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700 print:bg-white print:border-zinc-200">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 print:bg-blue-50">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Email Confirmation</p>
                  <p className="text-xs text-zinc-500 font-medium">A digital copy has been sent to your official address.</p>
                </div>
              </div>
            </div>

            {/* Receipt Footer - Revealed for PDF */}
            <div className="hidden print:block p-8 bg-zinc-50 border-t-2 border-zinc-200 text-center">
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                This document serves as legal proof of vote submission for the 2026 DUR Welfare Committee Election. 
                Individual candidate selections are excluded to maintain voter anonymity as required by DUR Election Bye-laws.
              </p>
              <div className="mt-6 pt-6 border-t border-zinc-200 flex justify-between items-center px-10">
                <div className="text-left">
                  <div className="w-24 h-px bg-zinc-400 mb-2" />
                  <p className="text-[8px] font-black text-zinc-400 uppercase">Election Officer Signature</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">DUR-SECURE-VOTE-V1.0</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-20 text-zinc-400 font-bold animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
            Generating official receipt...
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden mb-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 py-4 px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto"
        >
          <Home className="w-5 h-5" />
          Exit Portal
        </Link>
        <button 
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className={`flex items-center justify-center gap-2 py-4 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isExporting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <DownloadCloud className="w-5 h-5" />
              Export to PDF
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-6 bg-[#25D366] text-white font-bold rounded-xl shadow-md hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Send to WhatsApp
        </a>
        <a 
          href={smsUrl}
          className="flex items-center justify-center gap-2 py-3 px-6 bg-zinc-600 text-white font-bold rounded-xl shadow-md hover:bg-zinc-700 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto text-sm"
        >
          <Share2 className="w-4 h-4" />
          Send via SMS
        </a>
      </div>

      <p className="mt-12 text-xs text-zinc-400 dark:text-zinc-500 max-w-md mx-auto print:hidden font-medium">
        Please retain your Reference ID for any future inquiries. 
        Your individual selections remain strictly confidential and are not listed on this receipt.
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 font-sans antialiased flex flex-col">
      <ElectionBanner />
      
      <main className="flex-1 flex flex-col justify-center">
        <Suspense fallback={<div className="text-center py-20 text-zinc-500">Finalizing receipt...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="w-full py-10 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-auto">
        <div className="max-w-4xl mx-auto px-6">
          <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Department of Urban Roads</p>
          <p>&copy; 2026 Election Committee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
