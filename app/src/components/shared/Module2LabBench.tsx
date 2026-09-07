import { BeakerItem } from "./BeakerItem";
import { FlowerSVG } from "./FlowerSVG";
import { useLabStore, type FertilizerId } from "../../store/useLabStore";
import { Button, SecondaryButton } from "./Button";
import { Card } from "./Card";

// Blind Test Mode — no spoilers under beakers
const NEUTRAL_TINT = "#E0F2FE";

export const Module2LabBench: React.FC = () => {
  const { selectedBeakers, addBeaker, removeBeaker, clearBeakers, currentFlowerState, isAnalyzing, evaluateMixture, discoveredTraits, animationPhase } = useLabStore();

  // Dynamic active traits — only what is currently visible on the flower (detective notebook)
  const activeTraits: string[] = [];
  if (currentFlowerState.hasLeaves) activeTraits.push("🌿 Daunnya Tumbuh Lebat");
  if (currentFlowerState.petalLayers === 2) activeTraits.push("🌸 Kelopak Jadi Berlapis (Ganda)");
  if (currentFlowerState.petalColor === "white") activeTraits.push("⚪ Warna Kelopak Jadi Putih");
  if (currentFlowerState.stemType === "wavy") activeTraits.push("〰️ Tangkai Batangnya Bergelombang");
  if (currentFlowerState.centerColor === "black") activeTraits.push("⚫ Bagian Tengah Bunga Jadi Hitam");
  const hasAnalyzed = animationPhase !== "idle" || discoveredTraits.size > 0;

  return (
    <Card>
      <h2 className="font-bold mb-2">🧪 Lab Interaktif — Pilih 3 gelas & lihat bunga tumbuh</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Klik atau drag gelas ke slot (maks 3). Slot support drop.</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(["A", "B", "C", "D", "E", "F"] as FertilizerId[]).map((id) => (
              <BeakerItem key={id} id={id} color={NEUTRAL_TINT} disabled={selectedBeakers.includes(id) || isAnalyzing} onClick={() => addBeaker(id)} />
            ))}
          </div>
          <div className="border-2 border-dashed rounded-xl p-3 bg-slate-800/50 min-h-[88px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData("text/plain") as FertilizerId; if (id) addBeaker(id); }}>
            <p className="text-xs text-slate-400 mb-2">Slot dipilih ({selectedBeakers.length}/3) — klik × untuk hapus</p>
            <div className="flex gap-2 flex-wrap">
              {selectedBeakers.length === 0 && <span className="text-xs text-slate-500">Belum ada gelas dipilih</span>}
              {selectedBeakers.map((id, idx) => (
                <span key={`${id}-${idx}`} className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  🧴 {id}
                  <button onClick={() => removeBeaker(idx)} className="text-xs bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button disabled={selectedBeakers.length === 0 || isAnalyzing} onClick={evaluateMixture} className="flex-1">
                {isAnalyzing ? "⏳ Menganalisis..." : "🧪 Analisis Campuran"}
              </Button>
              <SecondaryButton onClick={clearBeakers} disabled={isAnalyzing}>Reset</SecondaryButton>
            </div>
          </div>
          {hasAnalyzed && !isAnalyzing && (
            <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 shadow-sm">
              <p className="text-xs font-black text-amber-800 tracking-wide flex items-center gap-1.5">🔎 Hasil Pengamatan Bunga:</p>
              {activeTraits.length > 0 ? (
                <ul className="mt-1.5 space-y-1">
                  {activeTraits.map((t) => (
                    <li key={t} className="text-xs md:text-sm font-medium text-slate-700 bg-white border border-amber-100 rounded-full px-3 py-1.5 flex items-center gap-2">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-xs md:text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2">✨ Tanaman tumbuh normal tanpa perubahan khusus</p>
              )}
              <p className="text-[11px] text-slate-500 mt-2 italic">Catat di buku detektifmu — pola apa yang kamu lihat?</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center border">
          <FlowerSVG {...currentFlowerState} className="w-40 h-60" animate={!isAnalyzing} />
          <p className="text-xs text-slate-500 mt-2 text-center">{isAnalyzing ? "⏳ Menganalisis campuran..." : "🌸 Hasil akan muncul setelah analisis"}</p>
        </div>
      </div>
    </Card>
  );
};
export default Module2LabBench;
