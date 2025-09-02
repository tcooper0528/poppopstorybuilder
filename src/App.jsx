import React, { useState } from "react";
import StorybookBuilder_Pages_Prompts_PDF_Uploads from "./StorybookBuilder_PagesPromptsPDFUploads";
import StorybookBuilder_JSONImporter from "./StorybookBuilder_JSONImporter";

export default function App() {
  const [mode, setMode] = useState("form"); // "form" | "importer"

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">📚 PopPop Storybot — Production Builder</h1>

      <div className="flex gap-4 items-center">
        <label className="text-sm">
          <input
            type="radio"
            name="mode"
            value="form"
            checked={mode === "form"}
            onChange={(e) => setMode(e.target.value)}
          />
          <span className="ml-1">Form Builder (manual entry)</span>
        </label>

        <label className="text-sm">
          <input
            type="radio"
            name="mode"
            value="importer"
            checked={mode === "importer"}
            onChange={(e) => setMode(e.target.value)}
          />
          <span className="ml-1">JSON Importer (fast/API)</span>
        </label>
      </div>

      <div className="border rounded-lg p-4 shadow-sm">
        {mode === "form" ? (
          <StorybookBuilder_Pages_Prompts_PDF_Uploads />
        ) : (
          <StorybookBuilder_JSONImporter />
        )}
      </div>
    </div>
  );
}
