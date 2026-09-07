import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStudentStore } from "../store/useStudentStore";
import { useProgressStore } from "../store/useProgressStore";
import { computeFinalScore } from "../engine/scoring/scoring";
import { Card } from "../components/shared/Card";
import { Button, SecondaryButton } from "../components/shared/Button";
import {
  buildGoogleReportPayload,
  submitReport,
  isReportSent,
  initGoogleSheetAutoSync,
  syncPendingReports,
} from "../engine/sync/googleSheetSync";

export default function Result() {
  const nav = useNavigate();
  const student = useStudentStore((s) => s.student);
  const { mod1Score, mod2Score, waterCorrect, hintsUsed, debuggingAttempts, reasoning } = useProgressStore();
  const finalScore = computeFinalScore(mod1Score, mod2Score, hintsUsed);
  const reflectionRaw = localStorage.getItem("vect-reflection");
  const reflection: { essay?: string; correct?: number } | null = reflectionRaw ? JSON.parse(reflectionRaw) : null;

  // UI feedback states for Google Sheets sync
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(() => isReportSent());
  const [showCelebration, setShowCelebration] = useState(false);

  // Offline retry queue: auto-sync pending reports when internet returns
  useEffect(() => {
    const cleanup = initGoogleSheetAutoSync((count) => {
      toast.success(`🎉 ${count} laporan tertunda berhasil terkirim!`);
      setSent(true);
    });
    // Also attempt immediate flush if online and has pending
    if (navigator.onLine) {
      void syncPendingReports().then((count) => {
        if (count > 0) {
          toast.success(`🎉 ${count} laporan tertunda berhasil terkirim!`);
          setSent(true);
        }
      });
    }
    return cleanup;
  }, []);

  if (!student) { nav("/onboarding"); return null; }

  const handleSendReport = async () => {
    if (sending || sent) return;
    setSending(true);
    toast.loading("Mengirim laporan ke Google Sheets...");

    // Construct payload per spec
    const reasoningText = reasoning || reflection?.essay || "";
    const payload = buildGoogleReportPayload(
      {
        name: student.name,
        class: student.class,
        absen: student.absen,
        reasoningText,
      },
      {
        mod1: mod1Score,
        mod2: mod2Score,
        water_correct: waterCorrect,
      },
    );

    const result = await submitReport(payload);
    toast.dismiss();

    if (result.queued) {
      // Offline — saved to pending_google_reports
      toast.info("Kamu sedang offline — laporan disimpan dan akan otomatis terkirim saat online kembali.");
      setSending(false);
      return;
    }

    // Success — mark sent, show celebration
    setSent(true);
    setSending(false);
    setShowCelebration(true);
    toast.success("🎉 Laporan Berhasil Terkirim!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full text-center">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-3xl font-bold text-primary">CASE SOLVED!</h1>
        <p className="text-gray-600 mb-4">Kamu berhasil menemukan pola dari data tidak lengkap — {student.name}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-left">
          <div className="bg-muted rounded p-3"><div className="text-sm text-gray-500">M1 Adonan</div><div className="text-xl font-bold">{mod1Score}%</div></div>
          <div className="bg-muted rounded p-3"><div className="text-sm text-gray-500">M2 Pupuk</div><div className="text-xl font-bold">{mod2Score}%</div></div>
          <div className="bg-muted rounded p-3"><div className="text-sm text-gray-500">Air Benar</div><div className="text-xl font-bold">{waterCorrect ? "YES" : "NO"}</div></div>
          <div className="bg-primary text-white rounded p-3"><div className="text-sm opacity-80">Final</div><div className="text-xl font-bold">{finalScore}</div></div>
        </div>

        <div className="text-left bg-white border rounded-card p-3 mb-4">
          <p className="font-semibold mb-1">🧠 CT Skill Breakdown</p>
          <ul className="text-sm space-y-0.5">
            <li>Pattern Recognition: {mod2Score === 100 ? "90+" : mod2Score}%</li>
            <li>Algorithmic Thinking: {mod1Score}%</li>
            <li>Debugging: {Math.max(0, 100 - hintsUsed * 20)} (hints {hintsUsed}, debug {debuggingAttempts})</li>
            <li>Reflection: {reflection ? `${reflection.correct}/3 benar` : "—"}</li>
          </ul>
          {reasoning && <p className="text-xs text-gray-500 mt-2">Reasoning: “{reasoning.slice(0, 120)}”</p>}
        </div>

        <div className="grid gap-2">
          {/* Spec step 4: Kirim Laporan ke Guru — loading, disable, success */}
          <Button
            onClick={handleSendReport}
            disabled={sending || sent}
            aria-busy={sending}
            title={sent ? "Laporan sudah terkirim" : "Kirim laporan ke Google Sheets"}
          >
            {sending ? "Mengirim laporan ke Google Sheets..." : sent ? "✓ Laporan Terkirim" : "Kirim Laporan ke Guru"}
          </Button>
          {!sent && !sending && !navigator.onLine && (
            <p className="text-xs text-amber-600 text-center">Offline — laporan akan diantrikan dan terkirim otomatis saat online</p>
          )}
          <Button onClick={() => nav("/hub")}>Kembali ke Hub</Button>
          <SecondaryButton onClick={() => nav("/reflection")}>Ulangi Refleksi</SecondaryButton>
          <button onClick={() => nav("/dashboard")} className="text-sm text-accent underline">Lihat Dashboard Guru →</button>
        </div>
      </Card>

      {/* Celebration modal / toast complement */}
      {showCelebration && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Laporan berhasil"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCelebration(false)}
        >
          <div
            className="bg-white rounded-card p-6 max-w-sm w-full text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-primary mb-1">Laporan Berhasil Terkirim!</h2>
            <p className="text-sm text-gray-600 mb-4">Data kamu sudah tercatat di Google Sheets guru.</p>
            <Button onClick={() => setShowCelebration(false)} className="w-full">Tutup</Button>
          </div>
        </div>
      )}
    </div>
  );
}
