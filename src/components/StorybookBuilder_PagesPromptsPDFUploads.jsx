import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { jsPDF } from "jspdf";

/**
 * Storybook Builder WITH Global Consistency Prompt
 * ------------------------------------------------
 * - Collects child details (incl. gender + skin tone).
 * - Lets you choose 1 of 4 adventures.
 * - Generates page-by-page STORY TEXT + ILLUSTRATION PROMPTS.
 * - Every illustration prompt is automatically prefixed with a Global Style
 *   block to enforce one consistent Pixar-style look across all pages.
 * - Optional: Upload one image per page (kept in-memory previews) and export a PDF
 *   that lays out each page as [Image (if any)] + [Story text] + [Illustration prompt].
 */

// ---------------- Global, Editable Style Block ----------------
const DEFAULT_GLOBAL_STYLE = `Children’s picture-book Pixar-style CGI illustration — stylized 3D, rounded shapes, soft painted textures, warm cozy colors, gentle cinematic lighting (key + soft rim), subtle depth of field, expressive eyes, friendly smiles, consistent character design across all pages.`;

// Build a single consistency blurb that gets prepended to every page prompt.
function consistencyBlock({ name, gender, skin, hair, favoriteColor, favoriteAnimal, homeTown }) {
  const g = (gender || "child").toLowerCase();
  const skinTxt = skin ? `${skin} skin` : "friendly skin tone";
  const hairTxt = hair ? `${hair} hair` : "neat hair";
  return (
    `Consistency: ${name} is a ${g} with ${skinTxt} and ${hairTxt}. ` +
    `Keep the same outfit/accent color (${favoriteColor}) every page. ` +
    `Favorite animal (${favoriteAnimal}) appears with the same design each page. ` +
    `Setting references ${homeTown}. Framing: medium-wide composition with room for text; friendly, cozy tone.`
  );
}

function prefixPrompt(globalStyle, consistency, specific) {
  return `${globalStyle}\n${consistency}\n\nScene: ${specific}`;
}

// ---------------- Page Template Builders ----------------
function cowboyPages(a, globalStyle) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown } = a;
  const cb = consistencyBlock(a);
  return [
    {
      page: 1,
      text: `In ${homeTown}, ${name} put on a big ${favoriteColor} cowboy hat. "Yee-haw!" said ${name} with a big smile, sitting on Thunder the gentle horse.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} (with ${hair} hair) wearing a big ${favoriteColor} cowboy hat, sitting gently on Thunder (kind horse). ${favoriteAnimal} nearby; cozy small-town ${homeTown} backdrop; warm morning light.`),
    },
    {
      page: 2,
      text: `Suddenly, ${favoriteAnimal} came hopping along. "Do you want to ride with me?" asked ${name}.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} greeting a friendly ${favoriteAnimal}; open flowered field; welcoming gesture.`),
    },
    {
      page: 3,
      text: `Together they rode slowly across the gentle field. The grass went swish‑swash, swish‑swash.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} riding Thunder with ${favoriteAnimal} companion; tall grass swaying; wide view showing calm movement; soft clouds.`),
    },
    {
      page: 4,
      text: `Thunder carried them to the old oak tree. They tied a ribbon and sang a cowboy song.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} under a big oak; colorful ribbon tied; horse beside; whimsical musical notes; dappled afternoon light.`),
    },
    {
      page: 5,
      text: `Next, they trotted by the little stream. Splash! ${favoriteAnimal} dipped a paw in the cool water.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} at a clear stream; ${favoriteAnimal} splashing playfully; sparkly droplets.`),
    },
    {
      page: 6,
      text: `They paused by the fence and counted clouds. "One, two, three!" said ${name}.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} pointing at cloud shapes (hat, boot, tiny horse); fence in foreground; big sky.`),
    },
    {
      page: 7,
      text: `At the end of the ride, ${name} gave ${favoriteAnimal} a hug. "Being together makes every adventure fun," said ${name}.`,
      illustration: prefixPrompt(globalStyle, cb, `Heartwarming hug between ${name} and ${favoriteAnimal}; Thunder watching kindly; golden-hour glow.`),
    },
    {
      page: 8,
      text: `With the cowboy hat tilted just right, ${name} and ${favoriteAnimal} laughed all the way home.`,
      illustration: prefixPrompt(globalStyle, cb, `${name} riding toward a cozy ${homeTown} horizon; hat tilted cute; sunset colors.`),
    },
  ];
}

function spacePages(a, globalStyle) {
  const { name, favoriteColor, favoriteAnimal, homeTown } = a;
  const cb = consistencyBlock(a);
  return [
    { page: 1, text: `The countdown echoed in ${homeTown}’s backyard. ${name} held tight to the shiny ${favoriteColor} helmet.`, illustration: prefixPrompt(globalStyle, cb, `${name} in launch prep beside a small backyard rocket; helmet ${favoriteColor}; friendly ${favoriteAnimal} ready as co‑pilot.`) },
    { page: 2, text: `"Ready for launch!" shouted ${name}. ${favoriteAnimal} wiggled into the co‑pilot seat.`, illustration: prefixPrompt(globalStyle, cb, `Cockpit close‑up; ${name} smiling; ${favoriteAnimal} strapped in adorably.`) },
    { page: 3, text: `Puff, puff… white smoke curled from the rocket engines. Rumble‑rumble… the ground shook with excitement.`, illustration: prefixPrompt(globalStyle, cb, `Backyard launch pad; gentle smoke plumes; neighbors’ fences; safe, kid‑friendly vibe.`) },
    { page: 4, text: `3…2…1… Whoooosh! The rocket zoom‑zoomed into the starry sky.`, illustration: prefixPrompt(globalStyle, cb, `Rocket lifting off; soft streaks; early evening sky with first stars.`) },
    { page: 5, text: `Twinkly stars danced outside the window. "Hello, galaxy!" said ${name} with a laugh.`, illustration: prefixPrompt(globalStyle, cb, `Interior cockpit; round window; playful star field; cozy instrument lights.`) },
    { page: 6, text: `Suddenly, space dust swirled across the path. "Oh no, it’s too thick!" said ${favoriteAnimal}.`, illustration: prefixPrompt(globalStyle, cb, `Soft, glittery dust cloud obscuring path; mild stakes; friendly faces.`) },
    { page: 7, text: `${name} pressed a big glowing button. Zzzap! A rainbow trail cleared the way.`, illustration: prefixPrompt(globalStyle, cb, `Rainbow clearing beam from the rocket; dust parts gently; whimsical effect.`) },
    { page: 8, text: `Past the rings of Saturn they zoomed. ${favoriteAnimal} tapped the glass. "Look! Shooting stars!"`, illustration: prefixPrompt(globalStyle, cb, `Exterior pass by Saturn’s rings; cockpit silhouettes of ${name} and ${favoriteAnimal}.`) },
    { page: 9, text: `Together they zipped to the Moon. They planted a flag that read, "Friends Forever."`, illustration: prefixPrompt(globalStyle, cb, `Moon surface; small flag with friendly lettering; Earth glowing above.`) },
    { page: 10, text: `At the end of the adventure, ${name} and ${favoriteAnimal} steered home, hearts full of starlight and big smiles.`, illustration: prefixPrompt(globalStyle, cb, `Return flight toward cozy ${homeTown}; stars trailing like confetti.`) },
  ];
}

function underwaterPages(a, globalStyle) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown } = a;
  const cb = consistencyBlock(a);
  return [
    { page: 1, text: `In ${homeTown}, ${name} put on a shiny ${favoriteColor} diving mask. Their ${hair} hair was tucked safely under the strap.`, illustration: prefixPrompt(globalStyle, cb, `${name} adjusting a bright ${favoriteColor} mask at shore; ${favoriteAnimal} splashing beside; gentle waves.`) },
    { page: 2, text: `"Ready to explore?" asked ${name}. ${favoriteAnimal} splashed with a happy wiggle.`, illustration: prefixPrompt(globalStyle, cb, `Shallow water entry; playful splash; sunlight ripples on water.`) },
    { page: 3, text: `Down, down, down they went. Bubbles floated all around.`, illustration: prefixPrompt(globalStyle, cb, `Underwater descent; bubbly trail; curious faces.`) },
    { page: 4, text: `Colorful fish peeked out from coral caves. One fish blew a bubble kiss that made ${name} laugh.`, illustration: prefixPrompt(globalStyle, cb, `Coral garden; cute fish interaction; soft caustics.`) },
    { page: 5, text: `Suddenly, the path was blocked by seaweed. "Oh no, it’s too twisty!" said ${favoriteAnimal}.`, illustration: prefixPrompt(globalStyle, cb, `Drifty seaweed forming a gentle maze; mild challenge.`) },
    { page: 6, text: `${name} hummed a gentle tune. The seaweed swayed and slowly moved aside.`, illustration: prefixPrompt(globalStyle, cb, `Musical hum represented with soft notes; seaweed parting.`) },
    { page: 7, text: `Deeper they swam, past a treasure chest half buried in sand. "Let’s open it next time!" whispered ${name}.`, illustration: prefixPrompt(globalStyle, cb, `Half‑buried chest catching light beams; promise of future fun.`) },
    { page: 8, text: `At last they reached a tall coral castle. Together they waved to the starfish guards.`, illustration: prefixPrompt(globalStyle, cb, `Coral castle silhouette; cute starfish like sentries; wide view.`) },
    { page: 9, text: `When the sun set through the water, ${name} and ${favoriteAnimal} floated back up, hearts full of giggles and sea‑sparkles.`, illustration: prefixPrompt(globalStyle, cb, `Ascend toward warm evening surface glow; content smiles.`) },
  ];
}

function forestPages(a, globalStyle) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown } = a;
  const cb = consistencyBlock(a);
  return [
    { page: 1, text: `Early in ${homeTown}, the trees whispered hello. ${name} brushed their ${hair} hair and tied the ${favoriteColor} jacket snug.`, illustration: prefixPrompt(globalStyle, cb, `Trailhead under tall trees; ${name} adjusting ${favoriteColor} jacket; ${favoriteAnimal} ready to go.`) },
    { page: 2, text: `"Ready to hike?" asked ${name}. ${favoriteAnimal} wagged, chirped, or hopped along happily.`, illustration: prefixPrompt(globalStyle, cb, `Sunny path; happy movement; playful leaves.`) },
    { page: 3, text: `Step, step, step — into the forest they went. Tall trees reached high like giants waving hello.`, illustration: prefixPrompt(globalStyle, cb, `Grand vertical trees; tiny travelers; welcoming vibe.`) },
    { page: 4, text: `Birds sang a cheery tune. ${name} whistled back, and ${favoriteAnimal} clapped its paws.`, illustration: prefixPrompt(globalStyle, cb, `Birds on branches; musical notes; joyful faces.`) },
    { page: 5, text: `Soon they found a log covered in mushrooms. "One, two, three!" counted ${name}. ${favoriteAnimal} sniffed and made a silly face.`, illustration: prefixPrompt(globalStyle, cb, `Mushroom log close‑up; gentle humor; soft dappled light.`) },
    { page: 6, text: `A soft breeze rustled the leaves. "Shh… listen," whispered ${name}. The forest told tiny secrets in the wind.`, illustration: prefixPrompt(globalStyle, cb, `Leaves shimmering; quiet moment; listening pose.`) },
    { page: 7, text: `Deeper in, they discovered a little wooden bridge. Tap, tap went their feet across. Beneath, the stream gurgled happily.`, illustration: prefixPrompt(globalStyle, cb, `Small wooden bridge; brook beneath; footsteps “tap tap.”`) },
    { page: 8, text: `At last, they reached a sunny clearing. Together they sat in the grass, sharing snacks. ${favoriteAnimal} curled up beside ${name}.`, illustration: prefixPrompt(globalStyle, cb, `Sunny meadow; picnic vibe; cozy companionship.`) },
    { page: 9, text: `"Exploring is more fun with friends," said ${name}. The forest agreed with a gentle hush, as the trees whispered one more goodnight.`, illustration: prefixPrompt(globalStyle, cb, `Warm golden finish; trees framing; peaceful farewell.`) },
  ];
}

const STORY_FNS = {
  cowboy: cowboyPages,
  space: spacePages,
  underwater: underwaterPages,
  forest: forestPages,
};

// ---------------- UI ----------------
export default function StorybookBuilderWithGlobalPrompt() {
  const [choice, setChoice] = useState("cowboy");
  const [answers, setAnswers] = useState({
    name: "",
    gender: "child",
    skin: "tan",
    hair: "brown",
    favoriteColor: "green",
    favoriteAnimal: "dog",
    homeTown: "Columbia",
  });
  const [globalStyle, setGlobalStyle] = useState(DEFAULT_GLOBAL_STYLE);
  const [pages, setPages] = useState([]);
  const fileInputsRef = useRef({}); // per‑page file inputs
  const [images, setImages] = useState({}); // { pageNumber: dataURL }

  const handleGenerate = () => {
    const builder = STORY_FNS[choice];
    if (!builder) return;
    const pg = builder(answers, globalStyle);
    setPages(pg);
  };

  const handleImageChange = async (page, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImages((prev) => ({ ...prev, [page]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const exportPDF = async () => {
    if (!pages.length) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    pages.forEach((p, idx) => {
      if (idx > 0) doc.addPage();

      const margin = 48;
      let y = margin;

      // Image block (optional)
      const dataURL = images[p.page];
      if (dataURL) {
        try {
          // fit width to page minus margins, keep aspect by providing width only
          const pageW = doc.internal.pageSize.getWidth();
          const imgW = pageW - margin * 2;
          const imgH = (imgW * 9) / 16; // safe default aspect box
          doc.addImage(dataURL, "JPEG", margin, y, imgW, imgH, undefined, "FAST");
          y += imgH + 16;
        } catch (e) {
          // ignore image errors and continue with text
        }
      }

      doc.setFont("Times", "bold");
      doc.setFontSize(14);
      doc.text(`Page ${p.page}`, margin, y);
      y += 18;

      doc.setFont("Times", "normal");
      doc.setFontSize(12);

      // Story text
      const storyLines = doc.splitTextToSize(p.text, 540);
      doc.text(storyLines, margin, y);
      y += storyLines.length * 14 + 12;

      // Illustration prompt (smaller)
      doc.setFontSize(10);
      doc.setTextColor(80);
      const promptLines = doc.splitTextToSize(`Illustration Prompt:\n${p.illustration}`, 540);
      doc.text(promptLines, margin, y);
      doc.setTextColor(0);
    });

    const filename = `${answers.name || "Story"}_${choice}_storybook.pdf`;
    doc.save(filename);
  };

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Story Time with Tim — Builder (Global Consistency Prompt)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Child's Name" value={answers.name} onChange={(e) => setAnswers({ ...answers, name: e.target.value })} />
            <Input placeholder="Gender (boy/girl/child)" value={answers.gender} onChange={(e) => setAnswers({ ...answers, gender: e.target.value })} />
            <Input placeholder="Skin (light/tan/dark)" value={answers.skin} onChange={(e) => setAnswers({ ...answers, skin: e.target.value })} />
            <Input placeholder="Hair (e.g., brown)" value={answers.hair} onChange={(e) => setAnswers({ ...answers, hair: e.target.value })} />
            <Input placeholder="Favorite Color" value={answers.favoriteColor} onChange={(e) => setAnswers({ ...answers, favoriteColor: e.target.value })} />
            <Input placeholder="Favorite Animal" value={answers.favoriteAnimal} onChange={(e) => setAnswers({ ...answers, favoriteAnimal: e.target.value })} />
            <Input placeholder="Home Town / Place" value={answers.homeTown} onChange={(e) => setAnswers({ ...answers, homeTown: e.target.value })} />

            <div className="col-span-1 md:col-span-3">
              <label className="text-sm font-medium block mb-1">Story Choice</label>
              <Select value={choice} onValueChange={setChoice}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choose a story" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cowboy">🐎 Cowboy Adventure</SelectItem>
                  <SelectItem value="space">🚀 Space Ranger Saga</SelectItem>
                  <SelectItem value="underwater">🌊 Underwater Voyage</SelectItem>
                  <SelectItem value="forest">🌲 Exploring the Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Global Consistency Prompt (editable)</label>
            <Textarea value={globalStyle} onChange={(e) => setGlobalStyle(e.target.value)} className="min-h-[110px]" />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleGenerate}>Generate Pages</Button>
            <Button variant="secondary" onClick={exportPDF} disabled={!pages.length}>Export PDF</Button>
          </div>
        </CardContent>
      </Card>

      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pages & Illustration Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {pages.map((p) => (
              <div key={p.page} className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <div className="text-sm font-semibold">Page {p.page} — Upload Image (optional)</div>
                  <input
                    ref={(el) => (fileInputsRef.current[p.page] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(p.page, e.target.files?.[0])}
                    className="block w-full text-sm"
                  />
                  {images[p.page] && (
                    <img src={images[p.page]} alt={`Page ${p.page}`} className="w-full rounded-xl shadow" />
                  )}
                </div>
                <div className="md:col-span-3 space-y-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Story Text</div>
                    <div className="text-sm whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{p.text}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Illustration Prompt (auto‑prefixed with Global Style)</div>
                    <Textarea value={p.illustration} readOnly className="min-h-[120px]" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
