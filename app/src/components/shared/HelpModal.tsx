import { useState } from "react";

export function HelpModal({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-full hover:bg-slate-700">
        ❓ Panduan {title}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary">Panduan {title}</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">×</button>
            </div>
            <div className="prose prose-sm text-sm text-gray-700">{children}</div>
            <button onClick={() => setOpen(false)} className="mt-4 w-full bg-primary text-white py-2 rounded-lg">Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}
