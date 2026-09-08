import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FEATURES, EXPERIMENTS, scoreModule2, isWaterCorrect } from "../engine/rules/fertilizerEngine";
import { useProgressStore } from "../store/useProgressStore";
import { useStudentStore } from "../store/useStudentStore";
import { sendModuleActivity } from "../engine/sync/syncModuleActivity";
import { Card } from "../components/shared/Card";
import { Button, SecondaryButton } from "../components/shared/Button";
import { FlowerSVG } from "../components/shared/FlowerSVG";
import { BeakerItem } from "../components/shared/BeakerItem";
import { HelpModal } from "../components/shared/HelpModal";
import { useLabStore, type FertilizerId } from "../store/useLabStore";
import { toast } from "sonner";
import { Module2DeductionBoard } from "../components/module2/Module2DeductionBoard";

// Blind Test Mode: neutral tint only — no botanical hint in color/label
const BEAKER_TINT = "#E0F2FE";

// Helper: mapping assignments -> FlowerProps untuk preview (revised: A=ganda, B=daun, C=putih, F=wavy, E=hitam, D=air)
function propsFromGlasses(glasses: string[], assignments: Record<string, string>) {
  const features = glasses.map((g) => assignments[g]).filter(Boolean);
  const hasLeaves = features.includes("Menumbuhkan Daun");
  const isWhite = features.includes("Kelopak Putih");
  const isWavy = features.includes("Tangkai Bergelombang");
  const isBlack = features.includes("Pusat Hitam");
  const hasLayer2 = features.includes("Kelopak Ganda");
  return {
    hasLeaves,
    petalColor: (isWhite ? "white" : "default") as "white" | "default",
    petalLayers: (hasLayer2 ? 2 : 1) as 1 | 2,
    stemType: (isWavy ? "wavy" : "normal") as "normal" | "wavy",
    centerColor: (isBlack ? "black" : "default") as "black" | "default",
  };
}

export default function Module2() {
  const nav = useNavigate();
  const student = useStudentStore((s) => s.student);
  const { modules, assignments: saved, setModuleScore, setModuleReasoning, setExperimentAnswer, setWaterCorrect, setAssignments, _hasHydrated } = useProgressStore();
  const { selectedBeakers, addBeaker, removeBeaker, clearBeakers, currentFlowerState, animationPhase, isAnalyzing, evaluateMixture, discoveredTraits } =
    useLabStore();
  const reasoning = modules.mod2?.reasoning ?? "";
  const mod2IntroCompleted = modules.mod2?.introCompleted ?? false;
  const [localAssignments, setLocalAssignments] = useState<Record<string, string>>(saved);
  const [reasoningLocal, setReasoningLocal] = useState(reasoning);
  const [, setExpChecks] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (_hasHydrated && !mod2IntroCompleted) nav("/module/2/intro", { replace: true });
  }, [_hasHydrated, mod2IntroCompleted, nav]);

  const handleCheck = (expId: number, feature: string, checked: boolean) => {
    setExpChecks((prev) => {
      const cur = prev[expId] ?? [];
      const next = checked ? [...cur, feature] : cur.filter((f) => f !== feature);
      setExperimentAnswer(expId, next);
      return { ...prev, [expId]: next };
    });
  };

  const save = () => {
    if (Object.keys(localAssignments).length < 6) { toast.error("Assign 6 gelas dulu (A–F)"); return; }
    if (reasoningLocal.trim().length < 20) { toast.error("Tulis penalaran minimal 20 karakter"); return; }
    const sc = scoreModule2(localAssignments);
    const water = isWaterCorrect(localAssignments);
    setModuleScore("mod2", sc);
    setWaterCorrect(water);
    setAssignments(localAssignments);
    setModuleReasoning("mod2", reasoningLocal);
    toast.success(`Jawaban disimpan! Skor M2: ${sc}% • Air benar: ${water ? "YES" : "NO"}`);
    nav("/hub");
  };

  const handleSaveActivity = async () => {
    if (!student) { toast.error("Data siswa tidak ditemukan"); return; }
    const sc = scoreModule2(localAssignments);
    const water = isWaterCorrect(localAssignments);
    const res = await sendModuleActivity({
      name: student.name,
      className: student.className,
      attendanceNumber: student.attendanceNumber,
      module: "mod2",
      score: sc,
      details: `Air: ${water ? "Benar" : "Salah"}, Gelas: ${Object.keys(localAssignments).length}/6`,
      status: Object.keys(localAssignments).length >= 6 ? "completed" : "in_progress",
    });
    toast.success(res.ok ? "Aktivitas Modul 2 tersimpan!" : "Gagal menyimpan — coba lagi");
  };

  const handleDeductionComplete = (deducedAssignments: Record<string, string>) => {
    setLocalAssignments(deducedAssignments);
    toast.success("Deduksi selesai! Sekarang verifikasi dan simpan jawabanmu.");
  };

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-primary">🌱 Modul 2: Pupuk Ajaib — Misi Detektif Pola</h1>
          <div className="flex gap-2">
            <HelpModal title="Level 2">
              <ol className="list-decimal ml-4 space-y-1">
                <li><b>Lab Interaktif:</b> klik/drag gelas A–F ke slot (maks 3) → <b>Analisis Campuran</b> → lihat bunga 3.2s (A=ganda, B=daun, C=putih, F=wavy, E=hitam, D=air).</li>
                <li><b>Eksperimen 1–3:</b> EXP1 A+B+C → Ganda+Putih+Daun · EXP2 A+D+E → Ganda+Hitam · EXP3 C+D+F → Putih+Bergelombang</li>
                <li><b>Deduksi 3 Fase:</b> Kartu Bukti → Panduan Irisan → Papan Drag & Drop A–F ke 6 ciri.</li>
                <li>Tulis <b>alasan min 20 karakter</b> → <b>Simpan</b>.</li>
              </ol>
              <p className="mt-2 text-xs text-slate-500">Tips: Perhatikan irisan — Gelas yang muncul di dua eksperimen membawa ciri yang sama!</p>
            </HelpModal>
            <SecondaryButton onClick={() => nav("/hub")}>← Hub</SecondaryButton>
          </div>
        </div>

        <Card>
          <h2 className="font-bold mb-2">🧪 Lab Interaktif — Pilih 3 gelas & lihat bunga tumbuh</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Klik atau drag gelas ke slot (maks 3). Slot support drop.</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(["A", "B", "C", "D", "E", "F"] as FertilizerId[]).map((id) => (
                  <BeakerItem
                    key={id}
                    id={id}
                    color={BEAKER_TINT}
                    disabled={selectedBeakers.includes(id) || isAnalyzing}
                    onClick={() => addBeaker(id)}
                  />
                ))}
              </div>
              <div
                className="border-2 border-dashed rounded-xl p-3 bg-slate-800/50 min-h-[88px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = e.dataTransfer.getData("text/plain") as FertilizerId;
                  if (id) addBeaker(id);
                }}
              >
                <p className="text-xs text-slate-400 mb-2">Slot dipilih ({selectedBeakers.length}/3) — klik × untuk hapus</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedBeakers.length === 0 && <span className="text-xs text-slate-500">Belum ada gelas dipilih</span>}
                  {selectedBeakers.map((id, idx) => (
                    <span key={`${id}-${idx}`} className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      🧴 {id}
                      <button onClick={() => removeBeaker(idx)} className="text-xs bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    disabled={selectedBeakers.length === 0 || isAnalyzing}
                    onClick={evaluateMixture}
                    className="flex-1"
                  >
                    {isAnalyzing ? `⏳ ${animationPhase}...` : "🧪 Analisis Campuran"}
                  </Button>
                  <SecondaryButton onClick={clearBeakers} disabled={isAnalyzing}>
                    Reset
                  </SecondaryButton>
                </div>
              </div>
              {!isAnalyzing && (discoveredTraits.size > 0 || animationPhase !== "idle") && (
                <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-black text-amber-800 tracking-wide flex items-center gap-1.5">🔎 Hasil Pengamatan Bunga:</p>
                  {(() => {
                    const active: string[] = [];
                    if (currentFlowerState.hasLeaves) active.push("🌿 Daunnya Tumbuh Lebat");
                    if (currentFlowerState.petalLayers === 2) active.push("🌸 Kelopak Jadi Berlapis (Ganda)");
                    if (currentFlowerState.petalColor === "white") active.push("⚪ Warna Kelopak Jadi Putih");
                    if (currentFlowerState.stemType === "wavy") active.push("〰️ Tangkai Batangnya Bergelombang");
                    if (currentFlowerState.centerColor === "black") active.push("⚫ Bagian Tengah Bunga Jadi Hitam");
                    return active.length > 0 ? (
                      <ul className="mt-1.5 space-y-1">
                        {active.map((t) => (
                          <li key={t} className="text-xs md:text-sm font-medium text-slate-700 bg-white border border-amber-100 rounded-full px-3 py-1.5">{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1.5 text-xs md:text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2">✨ Tanaman tumbuh normal tanpa perubahan khusus</p>
                    );
                  })()}
                  <p className="text-[11px] text-slate-500 mt-2 italic">Catat di buku detektifmu — pola apa yang kamu lihat?</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center border">
              <FlowerSVG {...currentFlowerState} className="w-40 h-60" animate={!isAnalyzing} />
              <p className="text-xs text-slate-500 mt-2 text-center">
                {isAnalyzing ? "⏳ Menganalisis campuran..." : "🌸 Hasil akan muncul setelah analisis"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold mb-2">🧪 Eksperimen — Centang fitur yang muncul</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {EXPERIMENTS.map((exp) => {
              const flowerProps =
                Object.keys(localAssignments).length >= 3
                  ? propsFromGlasses(exp.glasses, localAssignments)
                  : { hasLeaves: false, petalColor: "default" as const, petalLayers: 1 as const, stemType: "normal" as const, centerColor: "default" as const };
              return (
                <div key={exp.id} className="border rounded-card p-3 bg-white flex flex-col">
                  <p className="font-semibold">Eksperimen {exp.id}: {exp.glasses.join(" + ")}</p>
                  <div className="flex justify-center my-2 bg-muted/30 rounded-lg py-2">
                    <FlowerSVG {...flowerProps} className="w-24 h-36" animate={false} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Centang hasil yang kamu amati:</p>
                  <div className="space-y-1">
                    {FEATURES.filter((f) => !f.includes("Air")).map((f) => (
                      <label key={f} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" onChange={(e) => handleCheck(exp.id, f, e.target.checked)} /> {f}
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" onChange={(e) => handleCheck(exp.id, "Tidak ada perubahan", e.target.checked)} /> Tidak ada perubahan
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Module2DeductionBoard onComplete={handleDeductionComplete} />

        <Card>
          <label className="block font-medium mb-1">Tuliskan alasan / penalaran logika kamu (min 20 karakter) *</label>
          <textarea value={reasoningLocal} onChange={(e) => setReasoningLocal(e.target.value)} rows={4} className="w-full border-2 border-muted rounded-lg p-3 focus:border-accent outline-none" placeholder="Saya menemukan pola: gelas C=Putih muncul di EXP1 & EXP3, gelas A=Ganda muncul di EXP1 & EXP2, jadi gelas D=Air..." />
          <Button onClick={save} className="w-full mt-3">Simpan Jawaban Modul 2</Button>
          <button onClick={handleSaveActivity} className="w-full mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow active:scale-95 transition text-sm">
            💾 Simpan Aktivitas Modul 2
          </button>
        </Card>
      </div>
    </div>
  );
}
