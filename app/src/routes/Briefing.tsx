import { useNavigate } from "react-router-dom";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";

export default function Briefing() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-3xl font-bold text-primary mb-2">DATA HILANG!</h1>
        <p className="text-lg text-gray-700 mb-4">Laboratorium Pak Taro dalam keadaan kacau akibat hujan abu vulkanik.</p>
        <div className="bg-muted rounded-card p-4 mb-6 text-left">
          <p className="font-semibold">👨‍🔬 Pak Taro berkata:</p>
          <p className="italic">“Aku lupa mencatat pupuk apa di setiap gelas A–F. Untungnya, hasil 3 eksperimen masih tersisa. Bisakah kamu menemukan polanya?”</p>
        </div>
        <p className="font-semibold mb-4">Misi kamu: Temukan pola → Tentukan isi gelas A–F → Buktikan jawabanmu benar.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left text-sm mb-4">
          <p className="font-bold">📖 Cara Memulai (30 detik):</p>
          <ol className="list-decimal ml-4 space-y-0.5">
            <li>Isi <b>Nama/Kelas/Absen</b> → masuk Hub.</li>
            <li>Mulai <b>Modul 1 (10 menit)</b> dulu → lalu <b>Modul 2 (25 menit)</b>.</li>
            <li>Selesai keduanya → <b>Refleksi 3 soal</b> → <b>Kirim ke Guru</b>.</li>
          </ol>
        </div>
        <Button onClick={() => nav("/onboarding")} className="w-full">MULAI INVESTIGASI →</Button>
        <p className="text-sm text-gray-500 mt-3">CT LAB — Pattern Lab • Algorithm Lab • SMP VIII • <a href="/PANDUAN_BERMAIN.md" target="_blank" className="underline">Panduan Lengkap</a></p>
      </Card>
    </div>
  );
}
