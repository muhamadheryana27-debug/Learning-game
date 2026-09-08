import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStudentStore } from "../store/useStudentStore";
import { gameApi } from "../services/api";
import { enqueue } from "../engine/sync/syncEngine";
import { toast } from "sonner";

const CLASSES = ["VIII-A", "VIII-B", "VIII-C", "VIII-D", "VIII-E", "VIII-F", "VIII-G", "VIII-H"] as const;

export default function Briefing() {
  const nav = useNavigate();
  const setStudent = useStudentStore((s) => s.setStudent);
  const [name, setName] = useState("");
  const [kelas, setKelas] = useState<(typeof CLASSES)[number]>("VIII-A");
  const [absen, setAbsen] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMasuk = async () => {
    const trimmedName = name.trim();
    const absenNum = Number(absen);

    if (!trimmedName || trimmedName.length < 3) {
      toast.error("Isi nama dulu ya! Minimal 3 huruf 😊", { description: "Contoh: Budi Santoso" });
      return;
    }
    if (!/^[A-Za-z\s'.-]+$/.test(trimmedName)) {
      toast.error("Nama hanya huruf & spasi ya!");
      return;
    }
    if (!kelas) {
      toast.error("Pilih kelas dulu! (VIII-A s/d VIII-H)");
      return;
    }
    if (!absen || isNaN(absenNum) || absenNum < 1 || absenNum > 40) {
      toast.error("Isi No. Absen 1–40!", { description: "Cek daftar absen kelasmu" });
      return;
    }

    setLoading(true);
    setStudent({ name: trimmedName, className: kelas, attendanceNumber: absenNum });

    const studentId = `${kelas}-${String(absenNum).padStart(2, "0")}-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

    const result = await gameApi.registerStudent({
      studentId,
      name: trimmedName,
      className: kelas,
      attendanceNumber: absenNum,
    });

    if (result.ok) {
      toast.success("Kartu detektif jadi! 🚀");
    } else {
      await enqueue("register_student", "", studentId, { studentId, name: trimmedName, className: kelas, attendanceNumber: absenNum });
      toast.info("Offline — kartu disimpan lokal, akan sync nanti");
    }

    setLoading(false);
    nav("/hub");
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center p-2 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Warm wooden pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, #FCEFC7 0 40px, #FDF6E3 40px 80px)" }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-5xl bg-white rounded-[1.75rem] md:rounded-[2rem] border-[3px] border-amber-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Header Banner — tycoon */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-4 sm:px-6 md:px-8 py-4 md:py-5 border-b-[3px] border-amber-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)", backgroundSize: "22px 22px" }} />
          <div className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border-[3px] border-amber-700 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0">🏬</div>
            <div className="text-center sm:text-left">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] tracking-tight leading-tight">
                PABRIK KUE & LAB BOTANI PAK TARO
              </h1>
              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-amber-900/80 tracking-widest uppercase">🔬 Detektif Lab: Mission Briefing — SMP VIII</p>
            </div>
            <div className="hidden md:flex ml-auto items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border-2 border-amber-700 text-xs font-black text-amber-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> GAME READY
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
          {/* Pak Taro Speech Bubble */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            <div className="flex items-center gap-3 sm:flex-col sm:items-center shrink-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 border-[3px] border-amber-300 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">👨‍🔬</div>
              <div className="sm:text-center">
                <p className="text-xs sm:text-sm font-black text-slate-800">Pak Taro</p>
                <p className="text-[10px] sm:text-xs text-slate-500">Kepala Lab</p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="hidden sm:block absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-b-2 border-amber-200 rotate-45" />
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl sm:rounded-[1.25rem] p-3 sm:p-4 shadow-sm relative">
                <p className="text-sm sm:text-base font-bold text-amber-900 leading-relaxed">
                  Gawat! Akibat hujan abu vulkanik, catatan resep pabrik dan isi pupuk di gelas <b>A–F</b> hilang semua! <span className="hidden sm:inline">😱</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">Bisakah kamu membantuku menemukan solusinya? Jadilah detektif — pecahkan pipa adonan & ramuan pupuk!</p>
                <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full -rotate-3 shadow">🚨 URGENT</div>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-2 flex items-center gap-1.5">💡 <span>Tidak perlu jago coding — cukup teliti & suka puzzle!</span></p>
            </div>
          </div>

          {/* Quest Cards */}
          <div>
            <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-2 sm:mb-3">🗺️ Perjalanan Misi Kamu (45–60 menit)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-3 sm:p-4 flex gap-3 items-start shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500 border-2 border-indigo-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">🪪</div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-800">Bikin Kartu ID Detektif</p>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">Isi Nama, Kelas, No. Absen</p>
                  <span className="inline-block mt-1.5 text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full">LANGKAH 1</span>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-4 flex gap-3 items-start shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">🍪</div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-800">Modul 1: Atur Pipa Adonan</p>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">10 Menit — Jalankan mesin & cari pola</p>
                  <span className="inline-block mt-1.5 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">⏱ 10′</span>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-3 sm:p-4 flex gap-3 items-start shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500 border-2 border-emerald-600 flex items-center justify-center text-xl sm:text-2xl shrink-0">🌱</div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-800">Modul 2: Eksperimen Pupuk</p>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">25 Menit — Temukan 2 gelas air rahasia</p>
                  <span className="inline-block mt-1.5 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">⏱ 25′</span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Desk — form */}
          <div className="bg-slate-900 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 md:p-6 border-2 border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center text-sm">🪪</div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">Meja Registrasi — Kartu Detektif</h3>
                <p className="text-[11px] sm:text-xs text-slate-400">Isi dengan benar, nanti masuk rapor guru</p>
              </div>
              <span className="ml-auto hidden sm:inline text-[10px] font-black tracking-widest bg-white/10 text-white px-2 py-1 rounded-full border border-white/20">VIII-A → VIII-H</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5 tracking-wide">Nama Lengkapmu *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkapmu..."
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 sm:px-4 py-3 min-h-[48px] text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5 tracking-wide">Kelas *</label>
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value as (typeof CLASSES)[number])}
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 sm:px-4 py-3 min-h-[48px] text-sm font-bold text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition"
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5 tracking-wide">No. Absen (1–40) *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={40}
                  value={absen}
                  onChange={(e) => setAbsen(e.target.value)}
                  placeholder="12"
                  className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 sm:px-4 py-3 min-h-[48px] text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 outline-none transition"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMasuk}
              disabled={loading}
              className="w-full mt-4 sm:mt-5 bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base tracking-wide py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-[3px] border-amber-700 shadow-[0_6px_0_#92400E,0_8px_16px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0_#92400E] active:translate-y-1 transition-all min-h-[48px] flex items-center justify-center gap-2"
            >
              <span className="text-lg sm:text-xl">🚀</span> {loading ? "Menyiapkan pabrik..." : "MASUK PABRIK & MULAI MISI"}
            </motion.button>
            <p className="text-[11px] sm:text-xs text-slate-400 text-center mt-2">Dengan masuk, kamu setuju jadi detektif sains Pak Taro 🔬</p>
          </div>

          <p className="text-center text-[11px] sm:text-xs text-slate-500">Sudah punya kartu? Langsung lanjut — progress tersimpan otomatis. <span className="hidden sm:inline">Offline tetap bisa main!</span></p>
        </div>
      </motion.div>
    </div>
  );
}
