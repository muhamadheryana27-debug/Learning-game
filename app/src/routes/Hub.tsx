import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStudentStore } from "../store/useStudentStore";
import { useProgressStore } from "../store/useProgressStore";
import { computeFinalScore } from "../engine/scoring/scoring";
import { gameApi } from "../services/api";
import { toast } from "sonner";

export default function Hub() {
  const nav = useNavigate();
  const student = useStudentStore((s) => s.student);
  const { modules, waterCorrect, reset } = useProgressStore();

  if (!student) {
    nav("/onboarding");
    return null;
  }

  const mod1Score = modules.mod1?.score ?? 0;
  const mod2Score = modules.mod2?.score ?? 0;
  const mod2IntroCompleted = modules.mod2?.introCompleted ?? false;
  const reasoning = modules.mod2?.reasoning ?? "";
  const hintsUsed = (modules.mod1?.hintsUsed ?? 0) + (modules.mod2?.hintsUsed ?? 0);
  const finalScore = computeFinalScore(mod1Score, mod2Score, hintsUsed);
  const progress = (mod1Score > 0 ? 50 : 0) + (mod2Score > 0 ? 50 : 0);
  const mod1Done = mod1Score > 0;
  const mod2Done = mod2Score > 0;
  const bothDone = mod1Done && mod2Done;
  const mod2Locked = !mod1Done;

  const handleSubmit = async () => {
    if (!bothDone) {
      toast.error("Selesaikan kedua zona dulu!", {
        description: "Pabrik Adonan + Lab Pupuk harus selesai sebelum kirim laporan.",
      });
      return;
    }

    const result = await gameApi.completeSession({
      sessionId: `session-${Date.now()}`,
      studentId: student.studentId,
      totalScore: finalScore,
      completedAt: new Date().toISOString(),
    });

    if (result.ok) {
      toast.success("📜 Laporan terkirim ke Guru!");
    } else {
      toast.success("📜 Laporan disimpan! Final Score: " + finalScore);
    }

    // Export CSV fallback
    const csv = `Timestamp,Student_Name,Class,Attendance_Num,Module_1_Score,Module_2_Matrix_Score,Water_Glass_Correct,Reasoning_Text,Status\n"${new Date().toISOString()}","${student.name}","${student.className}","${student.attendanceNumber}","${mod1Score}%","${mod2Score}%","${waterCorrect ? "YES" : "NO"}","${reasoning.replace(/\n/g, " ")}","COMPLETED"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${student.name}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, #FCEFC7 0 40px, #FDF6E3 40px 80px)" }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full max-w-5xl bg-white rounded-[1.75rem] md:rounded-[2rem] border-[3px] border-amber-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-4 sm:px-6 md:px-8 py-4 border-b-[3px] border-amber-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)", backgroundSize: "22px 22px" }} />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white border-[3px] border-amber-700 flex items-center justify-center text-xl sm:text-2xl shadow-lg shrink-0">🗺️</div>
            <div>
              <h1 className="text-sm sm:text-lg md:text-xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] tracking-tight">PETA MISI — COMMAND CENTER</h1>
              <p className="text-[10px] sm:text-xs font-bold text-amber-900/80 tracking-widest uppercase">Pabrik Kue & Lab Botani Pak Taro • Pilih Zona Misimu</p>
            </div>
            <div className="hidden sm:flex ml-auto items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border-2 border-amber-700 text-xs font-black text-amber-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> MISI AKTIF
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
          {/* Player Badge */}
          <div className="rounded-2xl sm:rounded-[1.5rem] border-[3px] border-slate-800 bg-slate-900 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-[3px] border-amber-400 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0">👨‍🔬</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-widest text-amber-400 uppercase">🪪 Kartu Detektif — Player ID</p>
              <p className="text-sm sm:text-base font-black text-white truncate">Detektif: <span className="text-amber-300">{student.name}</span></p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-white text-slate-900 px-2.5 py-1 rounded-full border-2 border-slate-200">🏫 Kelas: {student.className}</span>
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full border-2 border-amber-600">🔢 No. Absen: {student.attendanceNumber}</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Status</span>
              <span className={`text-xs font-black px-3 py-1 rounded-full border-2 ${bothDone ? "bg-emerald-500 text-white border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : progress > 0 ? "bg-amber-400 text-slate-900 border-amber-600" : "bg-white/10 text-white border-white/20"}`}>
                {bothDone ? "✅ SIAP LAPOR" : progress > 0 ? "🟡 MISI JALAN" : "🎮 MULAI"}
              </span>
            </div>
          </div>

          {/* Story Quest Log */}
          <div className="flex gap-3 sm:gap-4 items-start">
            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 items-center justify-center text-xl shrink-0 shadow-inner">👨‍🔬</div>
            <div className="flex-1 relative">
              <div className="hidden sm:block absolute -left-2 top-5 w-4 h-4 bg-amber-50 border-l-2 border-b-2 border-amber-200 rotate-45" />
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl sm:rounded-[1.25rem] p-3 sm:p-4 shadow-sm relative">
                <p className="text-[11px] font-black tracking-widest text-amber-700 uppercase mb-1">📍 Peta Misi Detektif — Pesan dari Pak Taro</p>
                <p className="text-sm sm:text-[15px] font-bold text-slate-800 leading-relaxed">
                  Selesaikan investigasi di <span className="bg-amber-200 px-1.5 py-0.5 rounded-lg border border-amber-300">🏬 Pabrik Adonan (Modul 1)</span> terlebih dahulu, lalu lanjut temukan rahasia di <span className="bg-emerald-100 px-1.5 py-0.5 rounded-lg border border-emerald-200">🧪 Lab Pupuk (Modul 2)</span> untuk membuka laporan akhir!
                </p>
                <div className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full -rotate-3 shadow">🗺️ QUEST LOG</div>
              </div>
            </div>
          </div>

          {/* XP / Progress Bar */}
          <div className="rounded-2xl border-2 border-slate-800 bg-slate-900 p-3 sm:p-4 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 opacity-60" />
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">⭐ Progres Investigasi: {progress}%</span>
              <span className="text-xs sm:text-sm font-black text-white">🏆 Prediksi Skor: <span className="text-amber-300">{finalScore}</span>/100</span>
            </div>
            <div className="relative w-full h-5 sm:h-6 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden p-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_12px_rgba(251,146,60,0.6)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" style={{ backgroundSize: "200% 100%" }} />
              </motion.div>
              <div className="absolute inset-0 flex">
                <div className="flex-1 border-r border-white/10" />
                <div className="flex-1" />
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5 tracking-widest uppercase">
              <span>0%</span><span>50% — Buka Lab</span><span>100% — Siap Lapor</span>
            </div>
          </div>

          {/* Game Zones */}
          <div>
            <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">🎮 Pilih Zona — Ketuk Kartu untuk Masuk</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Zona 1 */}
              <motion.button
                whileHover={{ scale: 1.015, y: -2 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => nav("/module/1")}
                className="text-left rounded-[1.25rem] border-[3px] border-slate-700 overflow-hidden shadow-xl bg-white hover:shadow-2xl transition-all group relative"
              >
                <div className="h-20 sm:h-24 bg-gradient-to-br from-slate-700 via-slate-600 to-amber-600 relative overflow-hidden flex items-center px-4 sm:px-5 gap-3">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-[3px] border-amber-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0 relative">🏬</div>
                  <div className="relative">
                    <p className="text-[10px] font-black tracking-widest text-amber-300 uppercase">Zona 1 — Factory</p>
                    <p className="text-sm sm:text-base font-black text-white leading-tight">Pabrik Adonan &<br />Mesin Cetak</p>
                  </div>
                  <div className="ml-auto hidden sm:block text-3xl opacity-20">⚙️</div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Atur pipa dan temukan pola alur adonan kue.</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border-2 shadow-sm ${mod1Done ? "bg-emerald-500 text-white border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-amber-400 text-slate-900 border-amber-600"}`}>
                      {mod1Done ? `✅ SELESAI ${mod1Score}%` : "▶️ MULAI MISI"}
                    </span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 transition">Masuk →</span>
                  </div>
                </div>
                {mod1Done && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow animate-pulse" />}
              </motion.button>

              {/* Zona 2 */}
              <motion.button
                whileHover={!mod2Locked ? { scale: 1.015, y: -2 } : undefined}
                whileTap={!mod2Locked ? { scale: 0.985 } : undefined}
                onClick={() => !mod2Locked && nav(mod2IntroCompleted ? "/module/2" : "/module/2/intro")}
                disabled={mod2Locked}
                className={`text-left rounded-[1.25rem] border-[3px] overflow-hidden shadow-xl transition-all group relative ${mod2Locked ? "border-slate-300 bg-slate-100 cursor-not-allowed opacity-80" : "border-emerald-700 bg-white hover:shadow-2xl border-[3px]"}`}
                title={mod2Locked ? "Selesaikan Pabrik Adonan dulu untuk membuka Lab Pupuk!" : "Masuk Lab Pupuk"}
              >
                <div className={`h-20 sm:h-24 relative overflow-hidden flex items-center px-4 sm:px-5 gap-3 ${mod2Locked ? "bg-gradient-to-br from-slate-300 to-slate-400" : "bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600"}`}>
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[3px] flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0 relative ${mod2Locked ? "bg-slate-200 border-slate-400" : "bg-white border-emerald-800"}`}>{mod2Locked ? "🔒" : "🧪"}</div>
                  <div className="relative">
                    <p className={`text-[10px] font-black tracking-widest uppercase ${mod2Locked ? "text-white/80" : "text-emerald-200"}`}>Zona 2 — Greenhouse Lab</p>
                    <p className="text-sm sm:text-base font-black text-white leading-tight">Rumah Kaca &<br />Lab Pupuk</p>
                  </div>
                  <div className="ml-auto hidden sm:block text-3xl opacity-20">{mod2Locked ? "🔒" : "🌿"}</div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Analisis 3 eksperimen dan temukan 2 gelas air rahasia.</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border-2 shadow-sm ${mod2Locked ? "bg-slate-300 text-slate-600 border-slate-400" : mod2Done ? "bg-emerald-500 text-white border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-emerald-500 text-white border-emerald-600"}`}>
                      {mod2Locked ? "🔒 TERKUNCI" : mod2Done ? `✅ SELESAI ${mod2Score}%` : "▶️ MASUK LAB"}
                    </span>
                    <span className={`text-xs font-bold transition ${mod2Locked ? "text-slate-400" : "text-slate-400 group-hover:text-emerald-600"}`}>{mod2Locked ? "Selesaikan Zona 1" : "Masuk →"}</span>
                  </div>
                </div>
                {mod2Locked && <div className="absolute inset-0 bg-white/0" />}
              </motion.button>
            </div>
            {mod2Locked && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3 text-center font-bold">🔒 Lab Pupuk terkunci — selesaikan <b>Pabrik Adonan</b> dulu untuk membuka zona ini!</p>}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="relative group">
              <motion.button
                whileHover={bothDone ? { scale: 1.01 } : undefined}
                whileTap={bothDone ? { scale: 0.99 } : undefined}
                onClick={handleSubmit}
                disabled={!bothDone}
                title={!bothDone ? "Selesaikan kedua zona dulu untuk membuka laporan!" : "Kirim laporan ke guru"}
                className={`w-full font-black text-sm sm:text-base tracking-wide py-3.5 sm:py-4 rounded-2xl border-[3px] min-h-[52px] flex items-center justify-center gap-2 transition-all ${bothDone ? "bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white border-amber-700 shadow-[0_6px_0_#92400E,0_8px_16px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_#92400E] active:translate-y-1" : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"}`}
              >
                <span className="text-lg">📜</span> KIRIM LAPORAN KE GURU
              </motion.button>
              {!bothDone && (
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-slate-700 z-10">
                  🔒 Selesaikan Zona 1 & 2 dulu!
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                </div>
              )}
            </div>
            <p className="text-center text-[11px] text-slate-500">{bothDone ? "✅ Semua zona selesai — siap kirim!" : `⏳ ${progress}% — selesaikan ${!mod1Done ? "Pabrik Adonan" : "Lab Pupuk"} untuk membuka laporan`}</p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => nav("/dashboard")} className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 underline underline-offset-4">📊 Lihat Dashboard Guru →</button>
            </div>
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (confirm("Yakin reset semua progres? Tidak bisa dibatalkan!")) {
                    reset();
                    toast.info("Progress direset — mulai lagi dari Pabrik Adonan!");
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-red-500 underline underline-offset-2 transition"
              >
                ↺ Reset Progress
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
