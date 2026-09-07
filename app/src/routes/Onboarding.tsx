import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { onboardingSchema, type OnboardingData } from "../lib/validation";
import { useStudentStore } from "../store/useStudentStore";
import { Card } from "../components/shared/Card";
import { Button } from "../components/shared/Button";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { enqueue } from "../engine/sync/offlineQueue";
import { toast } from "sonner";

export default function Onboarding() {
  const nav = useNavigate();
  const setStudent = useStudentStore((s) => s.setStudent);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { class: "VIII-A" as const },
  });

  const onSubmit = async (data: unknown) => {
    const parsed = data as OnboardingData;
    setStudent(parsed);
    // Simpan ke Supabase jika tersedia, else queue
    if (isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase.from("students").select("id").eq("name", parsed.name).eq("class", parsed.class).eq("absen", parsed.absen).maybeSingle();
        if (!existing) {
          const { error } = await supabase.from("students").insert({ name: parsed.name, class: parsed.class, absen: parsed.absen });
          if (error) throw error;
        }
        toast.success("Identitas tersimpan di Supabase");
      } catch {
        await enqueue("students", parsed);
        toast.info("Offline — identitas disimpan lokal, akan sync nanti");
      }
    } else {
      toast.success("Identitas tersimpan lokal (Supabase belum dikonfigurasi)");
    }
    nav("/hub");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-primary text-center">SELAMAT DATANG DI VECT GAME</h1>
        <p className="text-center text-gray-600 mb-6">Identitas Siswa (Pembelajaran Daring)</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
            <input {...register("name")} className="w-full border-2 border-muted rounded-lg px-3 py-2 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none" placeholder="Budi Santoso" />
            {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kelas *</label>
            <select {...register("class")} className="w-full border-2 border-muted rounded-lg px-3 py-2 focus:border-accent outline-none">
              <option>VIII-A</option><option>VIII-B</option><option>VIII-C</option><option>VIII-D</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">No. Presensi / Absen *</label>
            <input type="number" {...register("absen")} className="w-full border-2 border-muted rounded-lg px-3 py-2 focus:border-accent outline-none" placeholder="12" />
            {errors.absen && <p className="text-danger text-sm mt-1">{errors.absen.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Menyimpan..." : "Masuk Lab →"}</Button>
        </form>
      </Card>
    </div>
  );
}
