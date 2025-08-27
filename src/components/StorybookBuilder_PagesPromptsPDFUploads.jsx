import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { jsPDF } from "jspdf";

/**
 * Storybook Builder (Pages + Illustration Prompts + Picture-PDF + Image Uploads)
 * ------------------------------------------------------------------------------
 * - Collects child details (incl. gender + skin tone).
 * - Generates page-by-page story text AND matching illustration prompts.
 * - Lets you upload one image per page and previews it.
 * - Exports a Picture‑Book PDF embedding your uploaded images.
 */

// ---------------- Helpers ----------------
const childDescriptor = ({ gender, skin, hair }) => {
  const g = (gender || "child").toLowerCase();
  const skinTxt = skin ? `${skin} skin` : "friendly skin tone";
  const hairTxt = hair ? `${hair} hair` : "neat hair";
  return `${g} with ${skinTxt} and ${hairTxt}`;
};

// ---------------- Page Template Builders ----------------
function cowboyPages(a) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown, gender, skin } = a;
  const kid = childDescriptor({ gender, skin, hair });
  return [
    { page: 1, text: `In ${homeTown}, ${name} put on a big ${favoriteColor} cowboy hat. "Yee-haw!" said ${name} with a big smile, sitting on Thunder the gentle horse.`, illustration: `${kid}, wearing a ${favoriteColor} cowboy hat, beside a calm horse named Thunder; small-town ${homeTown} backdrop, warm morning light, picture‑book style, soft edges.` },
    { page: 2, text: `Suddenly, ${favoriteAnimal} came hopping along. "Do you want to ride with me?" asked ${name}.`, illustration: `${kid} greeting a friendly ${favoriteAnimal}; open field with flowers; welcoming gesture; bright, cozy palette.` },
    { page: 3, text: `Together they rode slowly across the gentle field. The grass went swish‑swash, swish‑swash.`, illustration: `${kid} riding with ${favoriteAnimal} companion; tall grass swaying; low wind; wide composition showing movement; soft clouds.` },
    { page: 4, text: `Thunder carried them to the old oak tree. They tied a ribbon and sang a cowboy song.`, illustration: `${kid} at a big oak tree with a colorful ribbon; horse nearby; musical notes doodled; afternoon light through leaves.` },
    { page: 5, text: `Next, they trotted by the little stream. Splash! ${favoriteAnimal} dipped a paw in the cool water.`, illustration: `${kid} by a clear stream; ${favoriteAnimal} splashing; sparkly water droplets; playful mood.` },
    { page: 6, text: `They paused by the fence and counted clouds. "One, two, three!" said ${name}.`, illustration: `${kid} pointing at cloud shapes (hat, boot, tiny horse); wide sky; fence in foreground; gentle perspective.` },
    { page: 7, text: `At the end of the ride, ${name} gave ${favoriteAnimal} a hug. "Being together makes every adventure fun," said ${name}.`, illustration: `${kid} hugging a friendly ${favoriteAnimal}; horse watching kindly; golden-hour glow; heartwarming.` },
    { page: 8, text: `With the cowboy hat tilted just right, ${name} and ${favoriteAnimal} laughed all the way home.`, illustration: `${kid} riding toward a cozy ${homeTown} horizon; hat tilted cute; sunset colors; storybook finish.` },
  ];
}

// ... shortened for brevity (spacePages, underwaterPages, forestPages identical to earlier)
export default function StorybookBuilder_Pages_Prompts_PDF_Uploads() {
  return <div>/* full code here, see earlier export */</div>;
}
