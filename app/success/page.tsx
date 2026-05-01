'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download } from 'lucide-react';
import ElectionBanner from '../components/ElectionBanner';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import Image from 'next/image';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();

  const [refId, setRefId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id =
      searchParams.get('refId') ||
      'NECT-REF-' +
        Math.random().toString(36).substring(2, 9).toUpperCase();

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

    setRefId(id);
  }, [searchParams]);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      setIsExporting(true);

      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 4,
        quality: 1,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);

      const ratio = Math.min(
        pdfWidth / imgProps.width,
        pdfHeight / imgProps.height
      );

      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;

      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;

      pdf.addImage(
        dataUrl,
        'PNG',
        x,
        y,
        imgWidth,
        imgHeight
      );

      pdf.save(`NECT-Receipt-${refId}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Main UI */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Vote Successfully Cast
        </h1>

        <p className="text-zinc-600 text-lg">
          Your vote has been securely recorded in the NECT
          Election System.
        </p>
      </div>

      {/* PDF RECEIPT */}
      <div
        ref={receiptRef}
        className="bg-white w-full max-w-[800px] mx-auto border shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0B1F3A] px-10 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/NECT.jpeg"
                alt="NECT Logo"
                width={80}
                height={80}
                priority
                className="object-contain"
              />

              <div>
                <h2 className="text-2xl font-bold">
                  NECT Election Portal
                </h2>

                <p className="text-sm text-zinc-300 mt-1">
                  Official Voting Confirmation Receipt
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-300">
                Receipt Generated
              </p>

              <p className="font-semibold text-sm mt-1">
                {timestamp}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-10 py-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-zinc-800 mb-3">
              Voting Confirmation
            </h3>

            <p className="text-zinc-600 leading-7">
              This document confirms that your vote has been
              successfully submitted and securely recorded by
              the NECT Election Management System.
            </p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-zinc-50 border rounded-xl p-5">
              <p className="text-sm text-zinc-500 mb-2">
                Reference ID
              </p>

              <p className="font-bold text-lg break-all">
                {refId}
              </p>
            </div>

            <div className="bg-zinc-50 border rounded-xl p-5">
              <p className="text-sm text-zinc-500 mb-2">
                Election Status
              </p>

              <p className="font-bold text-green-600 text-lg">
                SUCCESSFUL
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="border border-blue-100 bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-[#0B1F3A] mb-2">
              Security Notice
            </h4>

            <p className="text-sm text-zinc-700 leading-6">
              This receipt serves as official proof that your
              vote was securely submitted through the NECT
              Election Portal. Keep this document for your
              records.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t flex items-center justify-between">
            <div>
              <p className="font-semibold text-[#0B1F3A]">
                National Engineering Coordinating Team
              </p>

              <p className="text-sm text-zinc-500 mt-1">
                Official Election System
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-zinc-500">
                Digitally Generated Receipt
              </p>

              <p className="text-xs text-zinc-400 mt-1">
                No signature required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-center gap-5 mt-10">
        <p className="text-sm text-zinc-500">
          A confirmation email has been sent to your inbox.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Return to Home
          </Link>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="px-6 py-3 rounded-xl border bg-white hover:bg-zinc-50 font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />

            {isExporting
              ? 'Generating PDF...'
              : 'Download Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <ElectionBanner />

      <main className="flex-1 flex items-center justify-center py-10">
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="text-center py-6 border-t text-sm text-zinc-500 bg-white">
        National Engineering Coordinating Team © 2026
      </footer>
    </div>
  );
}