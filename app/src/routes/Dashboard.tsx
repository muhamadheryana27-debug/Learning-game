import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Card } from "../components/shared/Card";
import { SecondaryButton } from "../components/shared/Button";

export default function Dashboard() {
  const nav = useNavigate();
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    supabase.from("sessions").select("*, students(name,class,absen)").order("start_time", { ascending: false }).limit(50)
      .then(({ data }) => { setRows(data ?? []); setLoading(false); });
  }, []);

  const exportCSV = () => {
    const header = "Timestamp,Student_Name,Class,Attendance_Num,Module_1_Score,Module_2_Matrix_Score,Water_Glass_Correct,Reasoning_Text,Status";
    const csvRows = (rows as unknown as { students: { name: string; class: string; absen: number }, mod1_score: number, mod2_score: number, water_correct: boolean, reasoning: string, status: string, start_time: string }[])
      .map((r) => `"${r.start_time}","${r.students?.name}","${r.students?.class}","${r.students?.absen}","${r.mod1_score}%","${r.mod2_score}%","${r.water_correct ? "YES" : "NO"}","${(r.reasoning ?? "").replace(/\n/g, " ")}","${r.status?.toUpperCase()}"`)
      .join("\n");
    const blob = new Blob([header + "\n" + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dashboard-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">📊 Teacher Dashboard</h1>
          <SecondaryButton onClick={() => nav("/hub")}>← Hub</SecondaryButton>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Card><div className="text-sm text-gray-500">Total Sesi</div><div className="text-2xl font-bold">{rows.length}</div></Card>
          <Card><div className="text-sm text-gray-500">Supabase</div><div className="text-lg font-bold">{isSupabaseConfigured ? "Connected" : "Not configured"}</div></Card>
          <Card><button onClick={exportCSV} className="w-full bg-success text-white rounded px-4 py-2">⬇ Export CSV (V4-compatible)</button></Card>
        </div>

        <Card>
          <h2 className="font-bold mb-2">Sesi Terbaru</h2>
          {loading ? <p>Memuat...</p> : !isSupabaseConfigured ? (
            <div className="text-sm text-gray-600">
              <p>Supabase belum dikonfigurasi — set <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di <code>.env</code>.</p>
              <p className="mt-1">Lihat <code>.env.example</code> dan jalankan migrasi SQL dari PRD V5 §9.2 di Supabase Dashboard → SQL Editor.</p>
              <p className="mt-2">Data lokal tetap tersimpan di IndexedDB & localStorage (Zustand persist).</p>
            </div>
          ) : rows.length === 0 ? <p className="text-gray-500">Belum ada sesi.</p> : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b"><th>Nama</th><th>Kelas</th><th>Absen</th><th>M1</th><th>M2</th><th>Air</th><th>Status</th></tr></thead>
                <tbody>
                  {(rows as unknown as { students: { name: string; class: string; absen: number }, mod1_score: number, mod2_score: number, water_correct: boolean, status: string }[]).map((r, i) => (
                    <tr key={i} className="border-b"><td>{r.students?.name}</td><td>{r.students?.class}</td><td>{r.students?.absen}</td><td>{r.mod1_score}%</td><td>{r.mod2_score}%</td><td>{r.water_correct ? "YES" : "NO"}</td><td>{r.status}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
