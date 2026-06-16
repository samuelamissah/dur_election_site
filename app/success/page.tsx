'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  Clock3,
  FileCheck2,
} from 'lucide-react';
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

      pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`NECT-Receipt-${refId}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      {/* Success Header */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-lg shadow-green-200/60">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          <ShieldCheck className="h-4 w-4" />
          Vote Successfully Recorded
        </div>

        <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Your Vote Has Been Securely Submitted
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Your vote has been authenticated, verified and recorded in the NECT
          Election Management System.
        </p>

        <div className="mt-6 inline-flex max-w-full items-center rounded-full border border-blue-100 bg-white/80 px-5 py-3 text-sm font-bold text-[#0B1F3A] shadow-sm backdrop-blur">
          <span className="mr-2 text-slate-500">Reference ID:</span>
          <span className="break-all">{refId || 'Generating...'}</span>
        </div>
      </section>

      {/* Main Content */}
      <section className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Status Panel */}
        <aside className="lg:col-span-4">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
            <h3 className="mb-6 text-lg font-bold text-slate-950">
              Verification Status
            </h3>

            <div className="space-y-4">
              {[
                'Vote Submitted',
                'Identity Verified',
                'Vote Encrypted',
                'Vote Recorded',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">
              <p className="font-bold text-green-700">
                Election Verification Complete
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your vote has been successfully processed by the NECT Election
                Portal.
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 text-[#0B1F3A]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Time Recorded
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {timestamp || 'Generating...'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCheck2 className="mt-0.5 h-5 w-5 text-[#0B1F3A]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Receipt Status
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Available for download
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Receipt */}
        <div className="lg:col-span-8">
          <div
            ref={receiptRef}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B1F3A] via-[#12345F] to-[#163B6E] px-6 py-7 text-white sm:px-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
                    <Image
                      src="/NECT.jpeg"
                      alt="NECT Logo"
                      width={72}
                      height={72}
                      priority
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">
                      NECT Election Portal
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                      Official Voting Confirmation Receipt
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-blue-100">
                    Receipt Generated
                  </p>
                  <p className="mt-1 text-sm font-semibold">{timestamp}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-8 sm:px-10 sm:py-10">
              <div className="mb-8">
                <div className="mb-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                  Successful
                </div>

                <h3 className="text-2xl font-bold text-slate-950">
                  Voting Confirmation
                </h3>

                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  This document confirms that your vote has been successfully
                  submitted and securely recorded by the NECT Election
                  Management System.
                </p>
              </div>

              <div className="mb-8 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-2 text-sm font-medium text-slate-500">
                    Reference ID
                  </p>
                  <p className="break-all text-lg font-bold text-slate-950">
                    {refId}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                  <p className="mb-2 text-sm font-medium text-green-700">
                    Election Status
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    SUCCESSFUL
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h4 className="mb-2 font-bold text-[#0B1F3A]">
                  Security Notice
                </h4>
                <p className="text-sm leading-6 text-slate-700">
                  This receipt serves as official proof that your vote was
                  securely submitted through the NECT Election Portal. Keep this
                  document for your records.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-[#0B1F3A]">
                    National Engineering Coordinating Team
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Official Election System
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-medium text-slate-500">
                    Digitally Generated Receipt
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    No signature required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="mt-10 flex flex-col items-center gap-5">
        <p className="text-center text-sm text-slate-500">
          A confirmation email has been sent to your inbox.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-xl bg-[#0B1F3A] px-8 py-4 font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Return to Home
          </Link>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Generating PDF...' : 'Download Receipt'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-[420px] w-[420px] rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-300/15 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(#0B1F3A 1px, transparent 1px),
              linear-gradient(90deg, #0B1F3A 1px, transparent 1px)
            `,
            backgroundSize: '42px 42px',
          }}
        />
      </div>

      <ElectionBanner />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center text-slate-600">
              Loading confirmation...
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-6 text-center text-sm text-slate-500 backdrop-blur">
        National Engineering Coordinating Team © 2026
      </footer>
    </div>
  );
}