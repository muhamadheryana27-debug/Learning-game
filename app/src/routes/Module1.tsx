import { useNavigate } from "react-router-dom";
import { DoughFactory } from "../components/shared/DoughFactory";
import { useProgressStore } from "../store/useProgressStore";
import { SecondaryButton, Button } from "../components/shared/Button";
import { Card } from "../components/shared/Card";
import { HelpModal } from "../components/shared/HelpModal";

export default function Module1() {
  const nav = useNavigate();
  const mod1Score = useProgressStore((s) => s.modules.mod1?.score ?? 0);

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-primary">🍪 Modul 1: Mesin Pembentuk Adonan</h1>
          <div className="flex gap-2">
            <HelpModal title="Level 1">
              <ol className="list-decimal ml-4 space-y-1">
                <li>
                  Pilih adonan di <b>Baki</b> — <b>Persegi 🟦</b>, <b>Segitiga 🔺</b>, atau <b>Lingkaran 🟡</b>.
                </li>
                <li>
                  Tap salah satu <b>PINTU 1 / 2 / 3</b> di atas pabrik — lihat adonan meluncur lewat pipa bercabang menuju <b>Oven K</b>.
                </li>
                <li>
                  Perhatikan sulapnya: jika adonan cocok dengan mesin, ia <b>berubah warna & bentuk</b> (gate menyala hijau) ✨ — jika tidak cocok, ia lewat saja.
                </li>
                <li>
                  Cek <b>Jejak Adonan</b> di bawah (mis. 🟦 ➔ 🔺 ➔ 🟦) lalu klik <b>Simpan & Kembali ke Hub</b>.
                </li>
              </ol>
              <p className="mt-2 text-xs">Tips: Pintu 2 paling panjang (5 mesin), Pintu 1 & 3 lebih pendek. Coba semua kombinasi!</p>
            </HelpModal>
            <SecondaryButton onClick={() => nav("/hub")}>← Hub</SecondaryButton>
          </div>
        </div>

        <DoughFactory />

        {mod1Score > 0 && (
          <Card>
            <div className="p-3 rounded-xl text-center bg-green-50 border border-green-200">
              <p className="font-bold text-success">Skor Modul 1: {mod1Score}% ✨</p>
              <p className="text-xs text-slate-500">Sudah tersimpan — bisa lanjut ke Modul 2 atau kirim laporan di Hub</p>
            </div>
            <Button onClick={() => nav("/hub")} className="w-full mt-3">
              Kembali ke Hub
            </Button>
          </Card>
        )}

        <p className="text-sm text-gray-500 text-center">Pabrik Kue Ceria — tap Pintu untuk melihat sulap bentuk!</p>
      </div>
    </div>
  );
}
