'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import ElectionBanner from '../components/ElectionBanner';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
/* eslint-disable @typescript-eslint/no-explicit-any */

function SuccessContent() {
  const searchParams = useSearchParams();

  const [refId, setRefId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const [waUrl, setWaUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    const id =
      searchParams.get('refId') ||
      'DUR-REF-' +
        Math.random().toString(36).substring(2, 9).toUpperCase();

    const name = searchParams.get('name') || 'Staff';

    const shareMsg = `DUR Welfare Election 2026: My vote (${name}) has been cast successfully! Official Reference ID: ${id}. Verified by DUR Election Portal.`;

    const waNumber =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233249711190';

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(
      shareMsg
    )}`;

    setTimestamp(
      new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    queueMicrotask(() => setRefId(id));
    setWaUrl(url);
  }, [searchParams]);

  // Countdown + auto redirect attempt (Chrome works, Safari may ignore)
  useEffect(() => {
    if (!refId || !waUrl) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          // Attempt auto redirect
          window.location.assign(waUrl);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refId, waUrl]);

  // Manual redirect (Safari-safe)
  const handleWhatsAppRedirect = () => {
    window.location.href = waUrl;
  };

  // PDF Download
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    setIsExporting(true);
    try {
      const element = receiptRef.current;

      const printOnlyElements =
        element.querySelectorAll('.hidden.print\\:block');

      printOnlyElements.forEach((el: any) => {
        el.style.setProperty('display', 'block', 'important');
      });

      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });

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
      const pdfHeight =
        (imgProps.height * pdfWidth) / imgProps.width;

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
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      {/* Success Icon */}
      <div className="mb-10 relative inline-block">
        <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative bg-white dark:bg-zinc-900 p-6 rounded-full shadow-2xl border-8 border-green-50 dark:border-green-900/20">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-6">
        Vote Cast Successfully
      </h1>

      {/* Message */}
      <p className="text-lg text-zinc-500 mb-10">
        Your vote has been securely recorded.
      </p>

      {/* Countdown + Redirect UI */}
      <div className="mt-6 space-y-4">
        <p className="text-sm text-zinc-500">
          Redirecting to WhatsApp in{' '}
          <span className="font-semibold">
            {countdown}
          </span>{' '}
          second{countdown !== 1 && 's'}...
        </p>

        <button
          onClick={handleWhatsAppRedirect}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition"
        >
          Continue to WhatsApp
        </button>

        <p className="text-xs text-zinc-400">
          If nothing happens, click the button above.
        </p>
      </div>

      {/* Optional PDF Button */}
      <div className="mt-8">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="px-5 py-2 border rounded-lg text-sm"
        >
          {isExporting ? 'Generating PDF...' : 'Download Receipt'}
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ElectionBanner />

      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="text-center py-6 text-sm text-zinc-500 border-t">
        Department of Urban Roads © 2026
      </footer>
    </div>
  );
}