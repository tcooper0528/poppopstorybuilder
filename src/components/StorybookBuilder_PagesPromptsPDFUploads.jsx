import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";

/**
 * UnifiedStorybookBuilder.jsx
 * --------------------------------------------------------------
 * ONE SCREEN to: (1) define the SAFE generic character, (2) generate story pages & prompts,
 * (3) render or upload images per page, and (4) export a final PDF.
 *
 * Notes:
 * - Never uses real photos. Character is a generic archetype (BoyBase/GirlBase) with parameters.
 * - Exposes a single `apiPayload` that backends can use to render images consistently.
 * - If you don't have a renderer yet, you can upload images per page and still export a PDF.
 */

// ---------------- Character Options ----------------
const SKIN_PRESETS = [
  { id: "fair", label: "Fair", hex: "#f4dccb" },
  { id: "light", label: "Light", hex: "#eac3a4" },
  { id: "tan", label: "Tan", hex: "#c99774" },
  { id: "brown", label: "Brown", hex: "#8a5a3b" },
  { id: "dark", label: "Dark", hex: "#5a3928" },
];

const HAIR_COLORS = [
  { id: "black", label: "Black", hex: "#2a2a2a" },
  { id: "brown", label: "Brown", hex: "#5a3a22" },
  { id: "blonde", label: "Blonde", hex: "#e2c36a" },
  { id: "red", label: "Red", hex: "#b44b2d" },
  { id: "gray", label: "Gray", hex: "#9aa0a6" },
];

const EYE_COLORS = [
  { id: "brown", label: "Brown" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "hazel", label: "Hazel" },
];

const OUTFIT_SWATCHES = [
  { id: "red", label: "Red", hex: "#e74c3c" },
  { id: "blue", label: "Blue", hex: "#3498db" },
  { id: "green", label: "Green", hex: "#2ecc71" },
  { id: "purple", label: "Purple", hex: "#8e44ad" },
  { id: "yellow", label: "Yellow", hex: "#f1c40f" },
  { id: "pink", label: "Pink", hex: "#ff6fb1" },
];

const DEFAULT_POSE_PLAN = {
  cowboy: ["hat_on_horse", "ride_meadow", "wave_friend", "counting_gesture", "campfire_smile", "high_five", "treasure_glint", "home_hug"],
  space: ["helmet_on", "rocket_window", "zero_g_float", "button_point", "asteroid_dodge", "moon_wave", "comet_hi", "landing_pose"],
  underwater: ["goggles_on", "wave_glide", "fish_friend", "treasure_peek", "bubble_count", "dolphin_wave", "kelp_hide", "sunny_surface"],
  forest: ["hat_adjust", "trail_walk", "animal_meet", "mushroom_log_count", "bridge_cross", "bird_listen", "camp_set", "home_return"],
};
const DEFAULT_SEEDS = [18733, 22119, 33007, 44011, 55001, 66013, 77021, 88031];

function Swatch({ hex }) {
  return <div className="w-5 h-5 rounded-full border" style={{ background: hex }} />;
}

// ---------------- Story Templates (8–10 pages, 3–5yo tone) ----------------
function buildStoryPages(story, a) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown } = a;
  const base = {
    cowboy: [
      `In ${homeTown}, ${name} put on a big ${favoriteColor} cowboy hat. "Yee-haw!" said ${name} as they sat on Thunder, the gentle horse.`,
      `Suddenly, ${favoriteAnimal} came hopping along. "Want to ride?" asked ${name}.`,
      `They trotted across the gentle field. Swish-swash went the grass.`,
      `They stopped at the old oak tree and sang a cowboy song.`,
      `By the little stream—splash! ${favoriteAnimal} dipped a paw.`,
      `They counted cloud shapes: hats, boots, a tiny horse.`,
      `A warm hug: "Being together makes adventures fun," said ${name}.`,
      `With the hat tilted just right, they laughed all the way home.`,
    ],
    space: [
      `The countdown echoed in ${homeTown}. ${name} held a shiny ${favoriteColor} helmet.`,
      `"Ready for launch!" ${name} said. ${favoriteAnimal} took the co‑pilot seat.`,
      `Puff, puff… smoke curled from the engines.`,
      `3…2…1… Whoooosh! Up into the stars!`,
      `Twinkly stars danced. "Hello, galaxy!"`,
      `Space dust swirled. "It’s too thick!" said ${favoriteAnimal}.`,
      `${name} pressed the glowing button—Zzzap! A rainbow trail appeared.`,
      `They planted a flag on the Moon: "Friends Forever".`,
    ],
    underwater: [
      `In ${homeTown}, ${name} put on a ${favoriteColor} diving mask.`,
      `"Ready to explore?" asked ${name}. ${favoriteAnimal} wiggled beside them.`,
      `Down, down, down they went. Bubbles followed.`,
      `Colorful fish peeked from coral caves.`,
      `Seaweed blocked the path. "Too twisty!"`,
      `${name} hummed a tune. The seaweed swayed aside.`,
      `A half‑buried treasure chest! "Next time," they whispered.`,
      `They waved to starfish guards at a coral castle.`,
    ],
    forest: [
      `Morning in ${homeTown}. ${name} tied their ${favoriteColor} jacket snug.`,
      `"Ready to hike?" ${favoriteAnimal} hopped along.`,
      `Step, step—into the woods. Tall trees waved hello.`,
      `Birds sang a cheery tune.`,
      `A log with mushrooms. "One, two, three!"`,
      `Soft breeze. "Shh… listen," whispered ${name}.`,
      `They found a little bridge. Tap, tap across!`,
      `Sunny clearing. Snacks and giggles.`,
    ],
  };

  return base[story].map((text, i) => ({ page: i + 1, text }));
}

function buildPromptTemplate(story, spec) {
  const base = `Children’s picture-book Pixar-style CGI — stylized 3D, rounded shapes, soft textures, warm cozy colors, gentle cinematic lighting (key + soft rim), subtle depth of field, expressive eyes, friendly smiles, consistent character design. Character: ${spec.archetype} kid, ${spec.attributes.skin.id} skin, ${spec.attributes.hair.color} ${spec.attributes.hair.style} hair, ${spec.attributes.eyes} eyes, outfit with ${spec.attributes.outfit.accent.id} accents${spec.attributes.hat ? ", wearing " + spec.attributes.hat.replace("_"," ") : ""}.`;
  const sceneBits = {
    cowboy: "wide, gentle countryside; small-town far background; soft morning light; friendly horse recurring;",
    space: "spaceship interior/exterior; twinkly stars; soft glow; recurring rocket elements;",
    underwater: "clear shallow sea; corals and friendly fish; sunbeams through water; recurring bubbles motif;",
    forest: "sun-dappled woods; cozy trail and friendly animals; soft mist; recurring backpack/cap;",
  };
  return `${base}\nSetting: ${sceneBits[story]}\nFraming: medium-wide composition with room for text; friendly, warm tone.\nConsistency: keep same face, hairstyle, outfit accents, proportions, accessory positions across pages; same animal companion if present.\nNegative: off-model face, extra fingers, harsh contrast, text artifacts.`;
}

export default function UnifiedStorybookBuilder() {
  // 1) CHARACTER (safe archetype)
  const [archetype, setArchetype] = useState("BoyBase");
  const [name, setName] = useState("");
  const [skin, setSkin] = useState("tan");
  const [hairColor, setHairColor] = useState("brown");
  const [hairStyle, setHairStyle] = useState("short");
  const [eyes, setEyes] = useState("brown");
  const [accentColor, setAccentColor] = useState("blue");
  const [favoriteAnimal, setFavoriteAnimal] = useState("");
  const [homeTown, setHomeTown] = useState("");
  const [includeHat, setIncludeHat] = useState(true);
  const [hatName, setHatName] = useState("cowboy");
  const [styleStrength, setStyleStrength] = useState(0.85);

  // 2) STORY choice + page texts
  const [story, setStory] = useState("cowboy");
  const pages = useMemo(() => buildStoryPages(story, { name: name || (archetype === "BoyBase" ? "Buddy" : "Sunny"), hair: hairColor, favoriteColor: accentColor, favoriteAnimal: favoriteAnimal || "bunny", homeTown: homeTown || "the park" }), [story, name, archetype, hairColor, accentColor, favoriteAnimal, homeTown]);

  // 3) RENDER plan (pose + seed) & prompt template
  const skinHex = SKIN_PRESETS.find(s => s.id === skin)?.hex || "#c99774";
  const outfitHex = OUTFIT_SWATCHES.find(s => s.id === accentColor)?.hex || "#3498db";
  const characterSpec = useMemo(() => ({
    archetype,
    name: name || (archetype === "BoyBase" ? "Buddy" : "Sunny"),
    attributes: {
      skin: { id: skin, hex: skinHex },
      hair: { color: hairColor, style: hairStyle },
      eyes,
      outfit: { accent: { id: accentColor, hex: outfitHex } },
      hat: includeHat ? hatName : null,
      favoriteAnimal: favoriteAnimal || null,
      homeTown: homeTown || null,
    },
    style: { lora: "lora://storybook_pixarish", weight: styleStrength },
    safety: { usesRealPhotos: false, description: "Generic non-photographic archetype." },
  }), [archetype, name, skin, skinHex, hairColor, hairStyle, eyes, accentColor, outfitHex, includeHat, hatName, favoriteAnimal, homeTown, styleStrength]);

  const renderPlan = useMemo(() => DEFAULT_POSE_PLAN[story].map((pose, i) => ({ page: i + 1, pose, seed: DEFAULT_SEEDS[i] })), [story]);
  const promptTemplate = useMemo(() => buildPromptTemplate(story, characterSpec), [story, characterSpec]);

  // 4) Images per page (upload or render)
  const [images, setImages] = useState({}); // { [page]: dataUrl }

  async function handleUpload(e, page) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImages(prev => ({ ...prev, [page]: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleRender(pageIdx) {
    // Minimal example: call your backend renderer
    const { seed, pose } = renderPlan[pageIdx];
    const body = {
      characterSpec, story, pageIndex: pageIdx, sceneText: pages[pageIdx].text, renderPlan, promptTemplate,
    };
    try {
      const r = await fetch("/render-page", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const out = await r.json();
      if (out?.imageUrl) setImages(prev => ({ ...prev, [pageIdx + 1]: out.imageUrl }));
    } catch (e) {
      console.error(e);
      alert("Render failed. You can upload a placeholder image while we debug the renderer.");
    }
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    pages.forEach((p, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(14);
      doc.text(`Page ${p.page}`, 40, 50);
      doc.setFontSize(12);
      doc.text(p.text, 40, 80, { maxWidth: 520 });
      const img = images[p.page];
      if (img) {
        // Fit image within a nice rectangle
        const x = 40, y = 140, w = 520, h = 360;
        doc.addImage(img, "PNG", x, y, w, h, undefined, "FAST");
      }
    });
    doc.save(`${characterSpec.name}_${story}_storybook.pdf`);
  }

  const apiPayload = useMemo(() => ({ characterSpec, story, renderPlan, promptTemplate, pages, workflow: { baseModel: "flux.1-schnell", styleLoRA: characterSpec.style.lora, characterLoRA: archetype === "BoyBase" ? "lora://kid_boy_base" : "lora://kid_girl_base", controlNet: "openpose" } }), [characterSpec, story, renderPlan, promptTemplate, pages, archetype]);

  const json = useMemo(() => JSON.stringify(apiPayload, null, 2), [apiPayload]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Unified Storybook Builder (Character → Pages → Images → PDF)</h1>

      <Tabs defaultValue="character" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="character">Character</TabsTrigger>
          <TabsTrigger value="story">Story Pages</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* CHARACTER TAB */}
        <TabsContent value="character">
          <Card className="shadow-md">
            <CardHeader><CardTitle>Safe Generic Character</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Archetype</Label>
                <Select value={archetype} onValueChange={setArchetype}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BoyBase">BoyBase (generic)</SelectItem>
                    <SelectItem value="GirlBase">GirlBase (generic)</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Display Name (for prompts)</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Child name (optional)" />

                <Label>Skin Tone</Label>
                <div className="grid grid-cols-5 gap-2">
                  {SKIN_PRESETS.map((s) => (
                    <Button key={s.id} variant={s.id === skin ? "default" : "outline"} onClick={() => setSkin(s.id)} className="flex items-center gap-2"><Swatch hex={s.hex} /> {s.label}</Button>
                  ))}
                </div>

                <Label>Hair Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {HAIR_COLORS.map((c) => (
                    <Button key={c.id} variant={c.id === hairColor ? "default" : "outline"} onClick={() => setHairColor(c.id)} className="flex items-center gap-2"><Swatch hex={c.hex} /> {c.label}</Button>
                  ))}
                </div>

                <Label>Hair Style</Label>
                <Select value={hairStyle} onValueChange={setHairStyle}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="curly">Curly</SelectItem>
                    <SelectItem value="braids">Braids</SelectItem>
                  </SelectContent>
                </Select>

                <Label>Eye Color</Label>
                <Select value={eyes} onValueChange={setEyes}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EYE_COLORS.map((e) => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Hat / Headgear</Label>
                    <p className="text-sm opacity-70">Story-themed: cowboy hat, space helmet, goggles, explorer cap</p>
                  </div>
                  <Switch checked={includeHat} onCheckedChange={setIncludeHat} />
                </div>

                {includeHat && (
                  <>
                    <Label>Headgear Type</Label>
                    <Select value={hatName} onValueChange={setHatName}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cowboy">Cowboy Hat</SelectItem>
                        <SelectItem value="space_helmet">Space Helmet</SelectItem>
                        <SelectItem value="swim_goggles">Swim Goggles</SelectItem>
                        <SelectItem value="explorer_cap">Explorer Cap</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}

                <Label>Outfit Accent Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {OUTFIT_SWATCHES.map((c) => (
                    <Button key={c.id} variant={c.id === accentColor ? "default" : "outline"} onClick={() => setAccentColor(c.id)} className="flex items-center gap-2"><Swatch hex={c.hex} /> {c.label}</Button>
                  ))}
                </div>

                <Label>Style Strength</Label>
                <Slider value={[Math.round(styleStrength * 100)]} onValueChange={(v) => setStyleStrength(v[0]/100)} max={100} step={1} />
                <p className="text-sm opacity-70">How strongly to apply your house Style LoRA (recommended 0.75–0.9).</p>
              </div>

              <div className="space-y-3">
                <Label>Favorite Animal (optional)</Label>
                <Input value={favoriteAnimal} onChange={(e) => setFavoriteAnimal(e.target.value)} placeholder="e.g., bunny, chicken, dolphin" />

                <Label>Favorite Place / Hometown (optional)</Label>
                <Input value={homeTown} onChange={(e) => setHomeTown(e.target.value)} placeholder="e.g., Opelika, the park, the beach" />

                <Label>Notes for Illustrator Prompt (optional)</Label>
                <Textarea placeholder="Extra cozy details, lighting vibe, or props to include." />

                <Card className="mt-4">
                  <CardHeader><CardTitle className="text-base">Live Preview</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p><strong>Name:</strong> {characterSpec.name}</p>
                        <p><strong>Archetype:</strong> {characterSpec.archetype}</p>
                        <p><strong>Skin:</strong> {skin}</p>
                        <p><strong>Hair:</strong> {hairColor} / {hairStyle}</p>
                        <p><strong>Eyes:</strong> {eyes}</p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>Accent:</strong> {accentColor}</p>
                        <p><strong>Headgear:</strong> {includeHat ? hatName : "none"}</p>
                        <p><strong>Animal:</strong> {favoriteAnimal || "—"}</p>
                        <p><strong>Place:</strong> {homeTown || "—"}</p>
                        <p><strong>Style LoRA:</strong> {characterSpec.style.lora} ({characterSpec.style.weight})</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STORY PAGES TAB */}
        <TabsContent value="story">
          <Card className="shadow-md">
            <CardHeader><CardTitle>Story Pages (auto from child + story)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Story</Label>
                  <Select value={story} onValueChange={setStory}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cowboy">🐎 Cowboy Adventure</SelectItem>
                      <SelectItem value="space">🚀 Space Ranger Saga</SelectItem>
                      <SelectItem value="underwater">🌊 Underwater Voyage</SelectItem>
                      <SelectItem value="forest">🌲 Forest Explorer</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-sm opacity-70">Each page also has a deterministic seed and a pose label for consistent composition.</p>

                  <div className="space-y-2">
                    {renderPlan.map(({ page, pose, seed }) => (
                      <div key={page} className="flex items-center justify-between rounded-lg border p-2">
                        <div className="text-sm"><strong>Page {page}:</strong> {pose}</div>
                        <div className="text-xs opacity-70">Seed {seed}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {pages.map((p) => (
                    <div key={p.page} className="border rounded-lg p-2">
                      <div className="text-sm font-semibold mb-1">Page {p.page}</div>
                      <Textarea value={p.text} readOnly className="h-24" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMAGES TAB */}
        <TabsContent value="images">
          <Card className="shadow-md">
            <CardHeader><CardTitle>Images (upload or render)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm opacity-70">You can upload finished illustrations or click Render to call your backend (expects a /render-page endpoint).</p>
              <div className="grid md:grid-cols-2 gap-4">
                {pages.map((p, idx) => (
                  <div key={p.page} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Page {p.page}</div>
                      <div className="text-xs opacity-70">Pose: {renderPlan[idx].pose} · Seed: {renderPlan[idx].seed}</div>
                    </div>

                    {images[p.page] ? (
                      <img src={images[p.page]} alt={`Page ${p.page}`} className="w-full aspect-video object-cover rounded" />
                    ) : (
                      <div className="w-full aspect-video bg-neutral-200/30 rounded grid place-items-center text-xs opacity-70">No image yet</div>
                    )}

                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => handleUpload(e, p.page)} />
                      <Button type="button" onClick={() => handleRender(idx)}>Render</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPORT TAB */}
        <TabsContent value="export">
          <Card className="shadow-md">
            <CardHeader><CardTitle>Export & Developer JSON</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button onClick={exportPDF}>Export Picture‑Book PDF</Button>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(json)}>Copy API Payload JSON</Button>
              </div>
              <pre className="text-xs bg-neutral-950 text-neutral-200 p-3 rounded-lg overflow-auto max-h-[340px]">{json}</pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

