import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { jsPDF } from "jspdf";

/* ------------------------ Simple Cowboy-Approved Helpers ------------------------ */

const DEFAULT_GLOBAL_PROMPT =
  "Children’s picture-book Pixar-style CGI — stylized 3D, rounded shapes, soft textures, warm cozy colors, gentle cinematic lighting (key + soft rim), subtle depth of field, expressive eyes, friendly smiles. Framing: medium-wide composition with room for text. Keep the same face/hairstyle/outfit accents across pages.";
const DEFAULT_NEGATIVE =
  "off-model face, extra or missing fingers, harsh contrast, photo-realism, scary expressions, gore, glitch, watermark, signature, text artifacts";

const SEEDS = [18733, 22119, 33007, 44011, 55001, 66013, 77021, 88031];

const STORY_CHOICES = [
  { id: "cowboy", label: "🐎 Cowboy Adventure" },
  { id: "space", label: "🚀 Space Ranger Saga" },
  { id: "underwater", label: "🌊 Underwater Voyage" },
  { id: "forest", label: "🌲 Exploring the Forest" },
];

const POSES = {
  cowboy: [
    "hat_on_horse",
    "ride_meadow",
    "wave_friend",
    "counting_gesture",
    "campfire_smile",
    "high_five",
    "town_wave",
    "home_sunset",
  ],
  space: [
    "helmet_on",
    "rocket_window",
    "zero_g_float",
    "button_point",
    "asteroid_dodge",
    "moon_wave",
    "comet_hi",
    "landing_pose",
  ],
  underwater: [
    "mask_on",
    "dive_entry",
    "coral_peek",
    "seaweed_tangle",
    "hum_tune",
    "treasure_glint",
    "starfish_wave",
    "surface_sunset",
  ],
  forest: [
    "jacket_tie",
    "trail_steps",
    "bird_listen",
    "mushroom_log_count",
    "wooden_bridge",
    "sunny_clearing",
    "snack_share",
    "goodnight_trees",
  ],
};

// tiny clipboard helper
async function copy(text, setMsg) {
  try {
    await navigator.clipboard.writeText(text);
    setMsg("Copied!");
  } catch {
    setMsg("Copy failed");
  } finally {
    setTimeout(() => setMsg(""), 1200);
  }
}

/* ------------------------ Build story pages (scripts) ------------------------ */

function buildPages(choice, a) {
  const name = a.name || "Buddy";
  const animal = a.favoriteAnimal || "bunny";
  const color = a.favoriteColor || "blue";
  const town = a.homeTown || "the park";
  const hair = a.hair || "brown";

  const byChoice = {
    cowboy: [
      `In the park, ${name} put on a big ${color} cowboy hat. "Yee-haw!" said ${name} as they sat on Thunder, the gentle horse.`,
      `Suddenly, ${animal} came hopping along. "Want to ride?" asked ${name}.`,
      `They trotted across the gentle field. Swish-swash went the grass.`,
      `They pointed up at clouds. "One, two, three!" Hat, boot, and a tiny horse!`,
      `Later, a cozy campfire glowed. Thunder snorted happily.`,
      `${name} and ${animal} shared a high-five with big grins.`,
      `They waved to the little town near ${town}.`,
      `With the hat tilted just right, they clip-clopped home, laughing.`,
    ],
    space: [
      `The countdown echoed in ${town}. ${name} held a shiny ${color} helmet.`,
      `"Ready for launch!" ${name} said. ${animal} took the co-pilot seat.`,
      `Puff, puff… smoke curled from the engines.`,
      `3…2…1… Whoooosh! Up into the stars!`,
      `Twinkly stars danced. "Hello, galaxy!"`,
      `Space dust swirled. "It’s too thick!" said ${animal}.`,
      `${name} pressed the glowing button—Zzzap! A rainbow trail appeared.`,
      `They planted a flag on the Moon: "Friends Forever".`,
    ],
    underwater: [
      `In ${town}, ${name} snugged a ${color} diving mask. Their ${hair} hair tucked under the strap.`,
      `"Ready to explore?" asked ${name}. ${animal} splashed beside them.`,
      `Down, down, down… bubbles giggled all around.`,
      `Colorful fish peeked from coral caves. One blew a bubble kiss!`,
      `Seaweed blocked the path. "Too twisty!" said ${animal}.`,
      `${name} hummed a gentle tune. The seaweed swayed aside.`,
      `A treasure chest glinted in the sand. "Next time!" whispered ${name}.`,
      `They waved to starfish guards and floated up at sunset, smiling.`,
    ],
    forest: [
      `Early in ${town}, the trees whispered hello. ${name} tied a snug ${color} jacket.`,
      `"Ready to hike?" asked ${name}. ${animal} bounced along.`,
      `Step, step, step—into the friendly woods.`,
      `Birds sang bright songs. ${name} listened with a smile.`,
      `They counted mushrooms on a log. "One, two, three!"`,
      `Tap, tap over a wooden bridge—stream giggling below.`,
      `In a sunny clearing, they shared snacks. ${animal} curled up.`,
      `The trees said goodnight in a cozy hush.`,
    ],
  };

  const texts = byChoice[choice] || byChoice.cowboy;
  const poses = POSES[choice] || POSES.cowboy;

  return texts.map((t, i) => ({
    page: i + 1,
    text: t,
    seed: SEEDS[i],
    pose: poses[i],
  }));
}

/* -------------- Build illustration prompt from answers + pose -------------- */

function buildIllustrationPrompt(p, a, storyChoice) {
  const kid = `child with ${a.skin || "friendly"} skin, ${a.hair || "neat"} hair, outfit with ${a.favoriteColor || "bright"} accents`;
  const animal = a.favoriteAnimal || "animal";
  const town = a.homeTown || "town";

  const S = {
    cowboy: {
      setting: `wide, gentle countryside near ${town}`,
      hat_on_horse: `wearing a big ${a.favoriteColor} cowboy hat, sitting on gentle horse Thunder`,
      ride_meadow: `riding slowly across a soft meadow with ${animal} nearby`,
      wave_friend: `waving happily to ${animal} by a fence`,
      counting_gesture: `pointing at cloud shapes (hat, boot, tiny horse)`,
      campfire_smile: `cozy campfire glow with ${animal}`,
      high_five: `giving ${animal} a happy high-five`,
      town_wave: `waving toward a tiny town in the distance`,
      home_sunset: `heading home at sunset, hat tilted cute`,
    },
    space: {
      setting: `cozy rocket / starry space near ${town}`,
      helmet_on: `holding/wearing shiny ${a.favoriteColor} space helmet`,
      rocket_window: `in cockpit window with stars; ${animal} in co-pilot seat`,
      zero_g_float: `floating gently in zero-g with ${animal}`,
      button_point: `pointing at a glowing control button`,
      asteroid_dodge: `safe playful motion; stars/asteroids outside`,
      moon_wave: `waving from the Moon; small flag`,
      comet_hi: `friendly comet waves outside the window`,
      landing_pose: `soft landing; flag reads 'Friends Forever'`,
    },
    underwater: {
      setting: `clear water near ${town}; coral, bubbles`,
      mask_on: `shiny ${a.favoriteColor} diving mask`,
      dive_entry: `splash entry with ${animal}`,
      coral_peek: `peeking at colorful coral fish`,
      seaweed_tangle: `soft seaweed across path`,
      hum_tune: `humming gently; seaweed parts`,
      treasure_glint: `half-buried chest glinting`,
      starfish_wave: `starfish waving hello`,
      surface_sunset: `surfacing at sunset, sparkly water`,
    },
    forest: {
      setting: `friendly woods near ${town}`,
      jacket_tie: `tying a ${a.favoriteColor} jacket`,
      trail_steps: `walking the trail with ${animal}`,
      bird_listen: `listening to birds in trees`,
      mushroom_log_count: `counting mushrooms on a log`,
      wooden_bridge: `crossing a small wooden bridge`,
      sunny_clearing: `resting in a sunny clearing`,
      snack_share: `sharing snacks; ${animal} curled up`,
      goodnight_trees: `trees whispering goodnight`,
    },
  };

  const table = S[storyChoice] || S.cowboy;
  const setting = table.setting || "";
  const hint = (table[p.pose] || "friendly pose").trim();

  return `${kid}; ${hint}; ${setting}. Warm, cozy colors; medium-wide; room for text. ${
    a.name ? `Include ${a.name} and a cute ${animal}.` : ""
  }`.trim();
}

/* ------------------------ Main Component ------------------------ */

export default function UnifiedStorybookBuilder() {
  const [tab, setTab] = useState("character");
  const [answers, setAnswers] = useState({
    name: "",
    hair: "",
    skin: "",
    favoriteColor: "",
    favoriteAnimal: "",
    homeTown: "",
  });
  const [storyChoice, setStoryChoice] = useState("cowboy");
  const [globalPrompt, setGlobalPrompt] = useState(DEFAULT_GLOBAL_PROMPT);
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE);
  const [copiedMsg, setCopiedMsg] = useState("");
  const [images, setImages] = useState({}); // {pageNumber: dataURL}

  const pages = useMemo(() => buildPages(storyChoice, answers), [storyChoice, answers]);

  const setAnswer = (key, val) => setAnswers((s) => ({ ...s, [key]: val }));

  const handleImage = async (page, file) => {
    if (!file) return;
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    setImages((s) => ({ ...s, [page]: dataUrl }));
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 28;
    const imgBoxH = pageH * 0.6;
    const textTop = margin + imgBoxH + 14;

    const title =
      (answers.name ? `${answers.name} — ` : "") +
      (STORY_CHOICES.find((s) => s.id === storyChoice)?.label.replace(/^[^ ]+ /, "") || "Storybook");

    // cover
    doc.setFontSize(20);
    doc.text(title, margin, 72);
    doc.setFontSize(12);
    doc.text(`Pages: ${pages.length}`, margin, 96);

    pages.forEach((p, idx) => {
      if (idx !== 0) doc.addPage();

      if (images[p.page]) {
        const boxW = pageW - margin * 2;
        doc.addImage(images[p.page], "JPEG", margin, margin, boxW, imgBoxH, undefined, "FAST");
      } else {
        // placeholder box
        doc.setDrawColor(180);
        doc.setLineDash([5]);
        doc.rect(margin, margin, pageW - margin * 2, imgBoxH);
        doc.setLineDash([]);
        doc.setFontSize(11);
        doc.text("(Drop illustration here)", margin + 12, margin + 22);
      }

      doc.setFontSize(14);
      const lines = doc.splitTextToSize(p.text, pageW - margin * 2);
      doc.text(lines, margin, textTop);

      doc.setFontSize(9);
      doc.text(
        `Page ${p.page} • Seed ${p.seed} • Pose ${p.pose}`,
        margin,
        pageH - margin
      );
    });

    doc.save((title.replace(/\s+/g, "_") || "storybook") + ".pdf");
  };

  /* ------------------------ UI ------------------------ */

  const TabBtn = ({ id, children }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-6 py-3 rounded-lg border ${
        tab === id ? "bg-black text-white" : "bg-white"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Unified Storybook Builder (Character → Pages → Images → PDF)</h1>

      <div className="flex gap-3">
        <TabBtn id="character">Character</TabBtn>
        <TabBtn id="pages">Story Pages</TabBtn>
        <TabBtn id="images">Images</TabBtn>
        <TabBtn id="export">Export</TabBtn>
      </div>

      {/* Character */}
      {tab === "character" && (
        <Card>
          <CardHeader>
            <CardTitle>Child & Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Child's name" value={answers.name} onChange={(e) => setAnswer("name", e.target.value)} />
              <Input placeholder="Hair (e.g., brown curly)" value={answers.hair} onChange={(e) => setAnswer("hair", e.target.value)} />
              <Input placeholder="Skin (e.g., fair / tan / dark)" value={answers.skin} onChange={(e) => setAnswer("skin", e.target.value)} />
              <Input placeholder="Favorite color" value={answers.favoriteColor} onChange={(e) => setAnswer("favoriteColor", e.target.value)} />
              <Input placeholder="Favorite animal" value={answers.favoriteAnimal} onChange={(e) => setAnswer("favoriteAnimal", e.target.value)} />
              <Input placeholder="Hometown / place" value={answers.homeTown} onChange={(e) => setAnswer("homeTown", e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {STORY_CHOICES.map((opt) => (
                <label key={opt.id} className="text-sm flex items-center gap-2">
                  <input
                    type="radio"
                    name="storyChoice"
                    value={opt.id}
                    checked={storyChoice === opt.id}
                    onChange={(e) => setStoryChoice(e.target.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="text-sm opacity-70">Your answers automatically fill the pages on the next tab.</div>
            <div>
              <Button onClick={() => setTab("pages")}>Go to Story Pages →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Pages */}
      {tab === "pages" && (
        <Card>
          <CardHeader>
            <CardTitle>Story Pages (auto from child + story)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm opacity-75">
              Each page also has a deterministic seed and a pose label for consistent composition.
            </div>

            {/* Global & Negative editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
              <div>
                <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Global Style Prompt</div>
                <Textarea className="min-h-[90px] text-xs" value={globalPrompt} onChange={(e) => setGlobalPrompt(e.target.value)} />
                <div className="mt-2">
                  <Button variant="outline" onClick={() => copy(globalPrompt, setCopiedMsg)}>Copy Global</Button>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Negative Prompt</div>
                <Textarea className="min-h-[90px] text-xs" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
                <div className="mt-2">
                  <Button variant="outline" onClick={() => copy(negativePrompt, setCopiedMsg)}>Copy Negative</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {/* left: page list with seed/pose */}
                {pages.map((p) => (
                  <div key={p.page} className="flex justify-between items-center border rounded-lg px-3 py-2 mb-2">
                    <div><b>Page {p.page}</b>: {p.pose}</div>
                    <div className="text-xs opacity-70">Seed {p.seed}</div>
                  </div>
                ))}
              </div>

              <div>
                {/* right: editable script + generated prompt for the selected-ish page(s) */}
                {pages.map((p) => {
                  const fullPrompt = `${globalPrompt}\n${buildIllustrationPrompt(p, answers, storyChoice)}\n\nNEGATIVE: ${negativePrompt}`;
                  return (
                    <div key={p.page} className="mb-6">
                      <div className="font-semibold mb-2">Page {p.page}</div>

                      <div className="mb-2">
                        <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Script (book text)</div>
                        <Textarea className="min-h-[90px]" value={p.text} readOnly />
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Illustration Prompt</div>
                        <Textarea className="min-h-[110px] font-mono text-xs" value={fullPrompt} readOnly />
                        <div className="flex gap-2 mt-2">
                          <Button variant="secondary" onClick={() => copy(fullPrompt, setCopiedMsg)}>
                            Copy Full Prompt (Page {p.page})
                          </Button>
                          <Button variant="outline" onClick={() => copy(String(p.seed), setCopiedMsg)}>
                            Copy Seed
                          </Button>
                          <div className="text-xs self-center opacity-70">{copiedMsg}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Button onClick={() => setTab("images")}>Go to Images →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {tab === "images" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload one image per page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pages.map((p) => (
                <div key={p.page} className="border rounded-lg p-3">
                  <div className="font-semibold mb-2">Page {p.page}</div>
                  <label className="block border-2 border-dashed rounded-xl p-3 text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImage(p.page, e.target.files?.[0])}
                    />
                    {images[p.page] ? (
                      <img src={images[p.page]} alt={`Page ${p.page}`} className="w-full h-48 object-cover rounded-lg" />
                    ) : (
                      <div className="text-sm opacity-70">Drop or click to add illustration</div>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <Button onClick={() => setTab("export")}>Go to Export →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export */}
      {tab === "export" && (
        <Card>
          <CardHeader>
            <CardTitle>Export Picture-Book PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm opacity-75">
              Make sure each page has its image. Then click Export to create your PDF.
            </div>
            <Button onClick={exportPDF}>Export PDF</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
