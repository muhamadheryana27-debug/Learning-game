import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GLASS_PROPERTIES, FEATURES, EXPERIMENTS, verifyAll, scoreModule2, isWaterCorrect } from "../engine/rules/fertilizerEngine";
import { HINTS, type HintLevel } from "../engine/hints/hintEngine";
import { useProgressStore } from "../store/useProgressStore";
import { Card } from "../components/shared/Card";
import { Button, SecondaryButton } from "../components/shared/Button";
import { FlowerSVG } from "../components/shared/FlowerSVG";
import { BeakerItem } from "../components/shared/BeakerItem";
import { HelpModal } from "../components/shared/HelpModal";
import { useLabStore, type FertilizerId } from "../store/useLabStore";
import { toast } from "sonner";

// Blind Test Mode: neutral tint only — no botanical hint in color/label
const BEAKER_TINT = "#E0F2FE";

// Helper: mapping assignments -> FlowerProps untuk preview
function propsFromGlasses(glasses: string[], assignments: Record<string, string>) {
  const features = glasses.map((g) => assignments[g]).filter(Boolean);
  const hasLeaves = features.includes("Menumbuhkan Daun");
  const isWhite = features.includes("Kelopak Berlapis & Putih");
  const isWavy = features.includes("Tangkai Bergelombang");
  const isBlack = features.includes("Tengah Bunga Hitam");
  const hasLayer2 = features.includes("Kelopak Berlapis & Putih");
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
  const { setMod2, setReasoning, addHint, hintsUsed, addDebuggingAttempt, setExperimentAnswer, reasoning, assignments: saved } = useProgressStore();
  const { selectedBeakers, addBeaker, removeBeaker, clearBeakers, currentFlowerState, animationPhase, isAnalyzing, evaluateMixture, discoveredTraits } =
    useLabStore();
  const [assignments, setAssignments] = useState<Record<string, string>>(saved);
  const [reasoningLocal, setReasoningLocal] = useState(reasoning);
  const [, setExpChecks] = useState<Record<number, string[]>>({});
  const [hintOpen, setHintOpen] = useState(false);
  const [verified, setVerified] = useState<ReturnType<typeof verifyAll> | null>(null);

  const handleAssign = (glass: string, feature: string) => {
    setAssignments((prev) => ({ ...prev, [glass]: feature }));
  };

  const handleCheck = (expId: number, feature: string, checked: boolean) => {
    setExpChecks((prev) => {
      const cur = prev[expId] ?? [];
      const next = checked ? [...cur, feature] : cur.filter((f) => f !== feature);
      setExperimentAnswer(expId, next);
      return { ...prev, [expId]: next };
    });
  };

  const requestHint = (lvl: HintLevel) => {
    if (hintsUsed >= 3) { toast.error("Hint maksimal 3x"); return; }
    addHint();
    toast.info(`${HINTS[lvl].title}: ${HINTS[lvl].text} (-10%)`);
    setHintOpen(false);
  };

  const save = () => {
    if (Object.keys(assignments).length < 6) { toast.error("Assign 6 gelas dulu (A–F)"); return; }
    if (reasoningLocal.trim().length < 20) { toast.error("Tulis penalaran minimal 20 karakter"); return; }
    const sc = scoreModule2(assignments);
    const water = isWaterCorrect(assignments);
    setMod2(assignments, sc, water);
    setReasoning(reasoningLocal);
    toast.success(`Jawaban disimpan! Skor M2: ${sc}% • Air benar: ${water ? "YES" : "NO"}`);
    nav("/hub");
  };

  const verify = () => {
    if (Object.keys(assignments).length < 6) { toast.error("Lengkapi assignment dulu"); return; }
    const res = verifyAll(assignments);
    setVerified(res);
    const allMatch = res.every((r) => r.match);
    if (!allMatch) addDebuggingAttempt();
    toast[allMatch ? "success" : "warning"](allMatch ? "🏆 Semua MATCH ✓ — CASE SOLVED!" : "🔍 Ada yang belum cocok, cek hint");
  };

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-primary">🌱 Modul 2: Pupuk Ajaib — Misi Detektif Pola</h1>
          <div className="flex gap-2">
            <HelpModal title="Level 2">
              <ol className="list-decimal ml-4 space-y-1">
                <li><b>Lab Interaktif:</b> klik/drag gelas A–F ke slot (maks 3) → <b>Analisis Campuran</b> → lihat bunga animasi 3.2s (B=daun, C=putih 2-layer, D=wavy, E=hitam).</li>
                <li><b>Eksperimen 1–3:</b> EXP1 A+B+C, EXP2 A+D+E, EXP3 C+D+F → centang fitur yang muncul.</li>
                <li><b>Sort Evidence:</b> isi dropdown A–F → pilih fitur (✨=benar). Butuh bantuan? <b>Hint Lv1-3</b> (-10% each).</li>
                <li>Klik <b>UJI SEMUA HIPOTESIS</b> → 3 bunga verifikasi. Semua `MATCH ✓` = <b>CASE SOLVED</b>.</li>
                <li>Tulis <b>alasan min 20 karakter</b> → <b>Simpan</b>.</li>
              </ol>
              <p className="mt-2 text-xs text-slate-500">Tips: Catat setiap hasil di panel checklist — pola akan terlihat setelah 2–3 percobaan.</p>
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
                Object.keys(assignments).length >= 3
                  ? propsFromGlasses(exp.glasses, assignments)
                  : { hasLeaves: false, petalColor: "default" as const, petalLayers: 1 as const, stemType: "normal" as const, centerColor: "default" as const };
              return (
                <div key={exp.id} className="border rounded-card p-3 bg-white flex flex-col">
                  <p className="font-semibold">Eksperimen {exp.id}: {exp.glasses.join(" + ")}</p>
                  <div className="flex justify-center my-2 bg-muted/30 rounded-lg py-2">
                    <FlowerSVG {...flowerProps} className="w-24 h-36" animate={false} />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Centang hasil yang kamu amati:</p>
                  <div className="space-y-1">
                    {FEATURES.slice(0, 4).map((f) => (
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

        <Card>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">🧩 Drag & Drop — Sort the Evidence (klik pilih)</h2>
            <button onClick={() => setHintOpen(!hintOpen)} className="bg-warning text-white px-4 py-2 rounded-pill text-sm">💡 Hint ({hintsUsed}/3)</button>
          </div>
          {hintOpen && (
            <div className="grid md:grid-cols-3 gap-2 mb-3">
              {([1, 2, 3] as HintLevel[]).map((lvl) => (
                <button key={lvl} onClick={() => requestHint(lvl)} className="border p-3 rounded text-left hover:bg-amber-50">
                  <div className="font-semibold text-sm">{HINTS[lvl].title}</div>
                  <div className="text-xs text-gray-600">{HINTS[lvl].text.slice(0, 60)}...</div>
                </button>
              ))}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Gelas A–F → Pilih fitur:</p>
              <div className="space-y-2">
                {(["A", "B", "C", "D", "E", "F"] as const).map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <span className="w-12 font-bold">🧴 {g}</span>
                    <select value={assignments[g] ?? ""} onChange={(e) => handleAssign(g, e.target.value)} className="flex-1 border rounded px-2 py-1">
                      <option value="">— pilih fitur —</option>
                      {FEATURES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {assignments[g] && <span className="text-sm">{assignments[g] === GLASS_PROPERTIES[g] ? "✨" : "🔍"}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border rounded-card p-3">
              <p className="text-sm font-medium">Preview bunga dari hipotesis kamu</p>
              <div className="flex justify-center gap-2 py-3 bg-muted/20 rounded-lg my-2">
                {(["A", "B", "C"] as const).map((g) => {
                  const p = assignments[g] ? propsFromGlasses([g], assignments) : null;
                  return p ? (
                    <div key={g} className="text-center">
                      <FlowerSVG {...p} className="w-16 h-24" animate={false} />
                      <div className="text-[10px]">Gelas {g}</div>
                    </div>
                  ) : null;
                })}
                {Object.keys(assignments).length === 0 && <span className="text-xs text-gray-400">Pilih gelas A–F untuk melihat preview</span>}
              </div>
              <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                {Object.entries(GLASS_PROPERTIES).map(([k, v]) => <li key={k}>{k}: {v}</li>)}
              </ul>
              <Button onClick={verify} className="w-full mt-3">🔬 UJI SEMUA HIPOTESIS</Button>
              {verified && (
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex gap-2 justify-center">
                    {verified.map((r) => {
                      const p = propsFromGlasses(r.glasses as string[], assignments);
                      return (
                        <div key={r.expId} className="text-center">
                          <FlowerSVG {...p} className="w-14 h-20" animate />
                          <div className={r.match ? "text-success text-xs" : "text-danger text-xs"}>EXP {r.expId} {r.match ? "✓" : "✗"}</div>
                        </div>
                      );
                    })}
                  </div>
                  {verified.map((r) => (
                    <div key={r.expId} className={r.match ? "text-success" : "text-danger"}>
                      EXP {r.expId}: {r.match ? "MATCH ✓" : `✗ predicted [${r.predicted.join(", ") || "-"}]`} • expected [{r.expected.join(", ")}]
                    </div>
                  ))}
                  {verified.every((r) => r.match) && <div className="font-bold text-success">🏆 CASE SOLVED!</div>}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <label className="block font-medium mb-1">Tuliskan alasan / penalaran logika kamu (min 20 karakter) *</label>
          <textarea value={reasoningLocal} onChange={(e) => setReasoningLocal(e.target.value)} rows={4} className="w-full border-2 border-muted rounded-lg p-3 focus:border-accent outline-none" placeholder="Saya menemukan pola: gelas C muncul di EXP1 & EXP3 dengan kelopak berlapis..." />
          <Button onClick={save} className="w-full mt-3">Simpan Jawaban Modul 2</Button>
        </Card>
      </div>
    </div>
  );
}
