import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { jsPDF } from "jspdf";

export default function StorybookBuilder_Pages_Prompts_PDF_Uploads() {
  const [name, setName] = useState("");
  const [favoriteAnimal, setFavoriteAnimal] = useState("");
  const [pages, setPages] = useState([
    { page: 1, text: "Page 1 text…", prompt: "Page 1 illustration prompt…" },
    { page: 2, text: "Page 2 text…", prompt: "Page 2 illustration prompt…" },
  ]);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    doc.setFontSize(18);
    doc.text(`Storybook — ${name || "Child"}`, 40, 60);
    pages.forEach((p, i) => {
      if (i !== 0) doc.addPage();
      doc.setFontSize(14);
      doc.text(`Page ${p.page}`, 40, 100);
      doc.setFontSize(12);
      doc.text(doc.splitTextToSize(p.text, 720), 40, 130);
    });
    doc.save("storybook.pdf");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Form Builder (manual)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Child's name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Favorite animal" value={favoriteAnimal} onChange={e => setFavoriteAnimal(e.target.value)} />
          <Button onClick={exportPDF}>Export PDF</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pages.map((p, idx) => (
          <Card key={p.page}>
            <CardHeader><CardTitle>Page {p.page}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Textarea value={p.text} onChange={e => {
                const copy = [...pages]; copy[idx].text = e.target.value; setPages(copy);
              }} />
              <Textarea className="font-mono text-xs" value={p.prompt} onChange={e => {
                const copy = [...pages]; copy[idx].prompt = e.target.value; setPages(copy);
              }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
