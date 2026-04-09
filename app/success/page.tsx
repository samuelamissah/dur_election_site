
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Home, ShieldCheck, Mail, DownloadCloud } from 'lucide-react';
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

    // Automatically redirect to WhatsApp after a short delay
    const timer = setTimeout(() => {
      const name = searchParams.get('name') || 'Staff';
      const shareMsg = `DUR Welfare Election 2026: My vote (${name}) has been cast successfully! Official Reference ID: ${id}. Verified by DUR Election Portal.`;
      const waUrl = `https://wa.me/233249711190?text=${encodeURIComponent(shareMsg)}`;
      window.open(waUrl, '_blank');
    }, 3000);

    return () => clearTimeout(timer);
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
