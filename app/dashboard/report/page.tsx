"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Images, MapPin, Loader2, Sparkles, CheckCircle2, RefreshCw, Trash2, Map as MapIcon, LocateFixed } from "lucide-react";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { formatFileSize } from "@/lib/format";
import type { ImageAnalysis } from "@/lib/ai";

const LocationPicker = dynamic(() => import("@/components/map/LocationPicker").then((m) => m.LocationPicker), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />,
});

type Step = 1 | 2 | 3 | 4;
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.209;

export default function ReportProblemPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ complaint_number: string; priority_score: number; duplicate_count: number } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const STAGES = [
    t("report.stageUploading"), t("report.stageAnalyzing"), t("report.stageDetecting"),
    t("report.stageLocationCheck"), t("report.stagePriority"), t("report.stagePreparing"),
  ];

  const handleFile = useCallback((f: File | null) => {
    setError(null);
    setFile(f);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f ? URL.createObjectURL(f) : null;
    });
  }, []);

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setAddress(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setAddress(data?.display_name ?? null))
        .catch(() => setAddress(null));
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [latitude, longitude]);

  function useCurrentLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError(t("report.permissionDenied"));
        setLatitude(DEFAULT_LAT);
        setLongitude(DEFAULT_LNG);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function selectOnMap() {
    setError(null);
    if (latitude === null || longitude === null) {
      setLatitude(DEFAULT_LAT);
      setLongitude(DEFAULT_LNG);
    }
  }

  async function runAnalysis() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    setError(null);
    setAnalyzing(true);
    setStageIndex(1);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("note", note);
      const res = await fetch("/api/ai/analyze", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "AI analysis failed. Please try again.");
        setAnalyzing(false);
        return;
      }
      setStageIndex(2);
      await new Promise((r) => setTimeout(r, 400));
      setAnalysis(body as ImageAnalysis);
      setAnalyzing(false);
    } catch {
      setError(t("errors.network"));
      setAnalyzing(false);
    }
  }

  async function submitComplaint() {
    if (!file || latitude === null || longitude === null) return;
    setSubmitting(true);
    setError(null);
    setStageIndex(3);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("latitude", String(latitude));
      form.append("longitude", String(longitude));
      form.append("note", note);
      if (address) form.append("address", address);
      setStageIndex(4);
      const res = await fetch("/api/complaints", { method: "POST", body: form });
      setStageIndex(5);
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "Could not submit your complaint. Please try again.");
        setSubmitting(false);
        return;
      }
      setResult(body);
      setSubmitting(false);
    } catch {
      setError(t("errors.network"));
      setSubmitting(false);
    }
  }

  const stepLabels = [t("report.stepPhoto"), t("report.stepDetails"), t("report.stepLocation"), t("report.stepAnalysis"), t("report.stepSubmit")];
  const progressSegment = submitting || result ? 5 : step;

  if (result) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="rounded-full bg-emerald-100 p-4 text-emerald-600">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">{t("report.submittedTitle")}</h1>
        <p className="mt-2 text-slate-500">{t("report.submittedSubtitle")}</p>
        <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
          <p className="text-sm text-slate-500">{t("report.complaintId")}</p>
          <p className="text-xl font-semibold text-slate-900">{result.complaint_number}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">{t("report.priorityScore")}</p>
              <p className="font-medium text-slate-800">{result.priority_score}/100</p>
            </div>
            <div>
              <p className="text-slate-500">{t("report.similarReports")}</p>
              <p className="font-medium text-slate-800">{result.duplicate_count}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => router.push("/dashboard/complaints")} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700">
            {t("report.viewMyComplaints")}
          </button>
          <button onClick={() => router.push("/dashboard")} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            {t("report.backToDashboard")}
          </button>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6 sm:py-24">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="mt-6 text-center text-lg font-medium text-slate-800">{STAGES[stageIndex]}...</p>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-slate-900">{t("report.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("report.subtitle")}</p>

      <div className="mt-6 flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${progressSegment >= s ? "bg-emerald-600" : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="mt-1.5 hidden justify-between text-[11px] font-medium text-slate-400 sm:flex">
        {stepLabels.map((l) => <span key={l}>{l}</span>)}
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      {step === 1 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Camera size={18} className="text-emerald-600" /> {t("report.addEvidence")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("report.supportedFormats")}</p>

          {preview ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              <img src={preview} alt="Preview" className="h-56 w-full object-cover sm:h-72" />
              <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{file?.name}</p>
                  <p className="text-xs text-slate-400">{file ? formatFileSize(file.size) : ""}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <RefreshCw size={14} /> {t("report.replace")}
                  </button>
                  <button
                    onClick={() => handleFile(null)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> {t("report.remove")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Camera size={26} />
                <span className="text-sm font-medium">{t("report.takePhoto")}</span>
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Images size={26} />
                <span className="text-sm font-medium">{t("report.chooseGallery")}</span>
              </button>
            </div>
          )}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <button
            disabled={!file}
            onClick={() => setStep(2)}
            className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {t("common.continue_")}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">{t("report.descriptionTitle")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("report.descriptionSubtitle")}</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={1000}
            className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder={t("report.descriptionPlaceholder")}
          />
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(1)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              {t("common.back")}
            </button>
            <button onClick={() => setStep(3)} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700">
              {t("common.continue_")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><MapPin size={18} className="text-emerald-600" /> {t("report.locationTitle")}</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-60"
            >
              {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
              {locating ? t("report.locating") : t("report.useLiveLocation")}
            </button>
            <button
              onClick={selectOnMap}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <MapIcon size={16} /> {t("report.selectOnMap")}
            </button>
          </div>

          {latitude !== null && longitude !== null && (
            <div className="mt-4">
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-700">{t("report.selectedLocation")}</p>
                <p className="mt-1 text-xs text-slate-500">{t("report.latitude")}: {latitude.toFixed(5)} · {t("report.longitude")}: {longitude.toFixed(5)}</p>
                {address && <p className="mt-1 truncate text-xs text-slate-500">{t("report.address")}: {address}</p>}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(2)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              {t("common.back")}
            </button>
            <button
              disabled={latitude === null || longitude === null}
              onClick={() => setStep(4)}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {t("report.confirmLocation")}
            </button>
          </div>
        </div>
      )}

      {step === 4 && !analysis && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Sparkles size={18} className="text-emerald-600" /> {t("report.stepAnalysis")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("report.subtitle")}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(3)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              {t("common.back")}
            </button>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {analyzing ? STAGES[stageIndex] + "..." : t("report.analyzeWithAI")}
            </button>
          </div>
        </div>
      )}

      {step === 4 && analysis && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Sparkles size={18} className="text-emerald-600" /> {t("report.previewTitle")}</h2>
          {!analysis.analyzed && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{t("report.aiUnavailable")}</p>
          )}
          {analysis.confidence < 0.4 && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{t("report.lowConfidence")}</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldTitle")}</p>
              <p className="mt-1 font-medium text-slate-900">{analysis.title}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldCategory")}</p>
              <p className="mt-1 font-medium text-slate-900">{analysis.category}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldSeverity")}</p>
              <p className="mt-1 font-medium text-slate-900">{t(`severity.${analysis.severity}`)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldPriority")}</p>
              <p className="mt-1 font-medium text-slate-900">{analysis.priority_score}/100</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldDepartment")}</p>
              <p className="mt-1 font-medium text-slate-900">{analysis.department}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldConfidence")}</p>
              <p className="mt-1 font-medium text-slate-900">{Math.round(analysis.confidence * 100)}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldDescription")}</p>
              <p className="mt-1 text-slate-700">{analysis.description}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-400">{t("report.fieldImpact")}</p>
              <p className="mt-1 text-slate-700">{analysis.impact}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setAnalysis(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              {t("common.back")}
            </button>
            <button onClick={submitComplaint} className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700">
              {t("report.submitComplaint")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
