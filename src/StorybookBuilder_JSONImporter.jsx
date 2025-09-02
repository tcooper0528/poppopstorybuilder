import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { jsPDF } from "jspdf";

export default function StorybookBuilder_JSONImporter() {
  const [raw, setRaw] = useState("");
  const [pack, setPack] = useState({ title: "", pages: [] });
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleUploadJSON = async (e) => {
    setError("");
    const file = e?.target?.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!Array.isArray(json.pages)) throw new Error("Missing pages[]");
      setPack(json);
      setRaw(text);
    } catch (err) {
      setError("Invalid JSON file.");
    }
  };

  const handleUsePasted = () => {
    setError("");
    try {
      const json = JSON.parse(raw);
      if (!Array.isArray(json.pages)) throw new Error("Missing pages[]");
      setPack(json);
    } catch {
      setError("Invalid JSON text.");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    doc.setFontSize(18);
    doc.text(pack.title || "Storybook", 40, 60);
    pack.pages.forEach((p, i) => {
      if (i !== 0) doc.addPage();
      doc.setFontSize(14);
      doc.text(`Page ${p.page}`, 40, 100);
      doc.setFontSize(12);
      doc.text(doc.splitTextToSize(p.script || "", 720), 40, 130);
    });
    doc.save((pack.title || "storybook") + ".pdf");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>JSON Importer (fast/API-ready)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input type="file" accept="application/json" ref={fileRef} onChange={handleUploadJSON} />
            <Button variant="secondary" onClick={() => fileRef.current?.click?.()}>Choose File</Button>
            <Button onClick={handleUsePasted}>Use Pasted Text</Button>
          </div>
          <Textarea className="min-h-[120px] font-mono text-xs" placeholder="{ ...JSON... }" value={raw} onChange={e => setRaw(e.target.value)} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="text-sm opacity-80">Loaded pages: <b>{pack.pages.length}</b></div>
          <Button onClick={exportPDF}>Export PDF</Button>
        </CardContent>
      </Card>

      {pack.pages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pack.pages.map((p) => (
            <Card key={p.page}>
              <CardHeader><CardTitle>Page {p.page}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm"><b>Script:</b> {p.script}</div>
                <div className="text-xs opacity-70"><b>Prompt:</b> {p.prompt}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
