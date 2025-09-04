import React, { useMemo, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

/* ===== seeds, choices, poses ===== */
const SEEDS = [18733, 22119, 33007, 44011, 55001, 66013, 77021, 88031];
const STORY_CHOICES = [
  { id: "cowboy", label: "🐎 Cowboy Adventure" },
  { id: "space", label: "🚀 Space Ranger Saga" },
  { id: "underwater", label: "🌊 Underwater Voyage" },
  { id: "forest", label: "🌲 Exploring the Forest" },
];
const POSES = {
  cowboy: [
    "hat_on_horse","ride_meadow","wave_friend","counting_gesture",
    "campfire_smile","high_five","town_wave","home_sunset",
  ],
  space: [
    "helmet_on","rocket_window","zero_g_float","button_point",
    "asteroid_dodge","moon_wave","comet_hi","landing_pose",
  ],
  underwater: [
    "mask_on","dive_entry","coral_peek","seaweed_tangle",
    "hum_tune","treasure_glint","starfish_wave","surface_sunset",
  ],
  forest: [
    "jacket_tie","trail_steps","bird_listen","mushroom_log_count",
    "wooden_bridge","sunny_clearing","snack_share","goodnight_trees",
  ],
};

/* ===== story text (PDF captions) per adventure ===== */
function buildPages(choice, a) {
  const name = a.name || "Buddy";
  const animal = a.favoriteAnimal || "bunny";
  const color = a.favoriteColor || "blue";
  const town = a.homeTown || "the park";
  const hair = a.hair || "brown";

  const byChoice = {
    cowboy: [
      `In ${town}, ${name} put on a big ${color} cowboy hat.`,
      `“Ready to ride?” asked ${name}. ${animal} hopped along.`,
      `They waved hello to a friendly ${animal} by the fence.`,
      `${name} pointed at clouds. “One, two, three!”`,
      `A cozy campfire glowed. The pony snorted happily.`,
      `${name} and ${animal} shared a high-five with big grins.`,
      `They waved to the little town near ${town}.`,
      `Hat tilted just right, they clip-clopped home at sunset.`,
    ],
    space: [
      `The countdown echoed in ${town}. ${name} held a shiny ${color} helmet.`,
      `“Ready for launch!” ${name} said. ${animal} took the co-pilot seat.`,
      `Puff, puff… smoke curled from the engines.`,
      `3…2…1… Whoooosh! Up into the stars!`,
      `Twinkly stars danced. “Hello, galaxy!”`,
      `Space dust swirled. “It’s too thick!” said ${animal}.`,
      `${name} pressed the glowing button—Zzzap! A rainbow trail appeared.`,
      `They planted a flag on the Moon: “Friends Forever”.`,
    ],
    underwater: [
      `At ${town}, ${name} snugged a ${color} diving mask. ${hair} hair tucked under the strap.`,
      `“Ready to explore?” asked ${name}. ${animal} splashed beside.`,
      `Down, down—bubbles giggled all around.`,
      `Colorful fish peeked from coral caves.`,
      `Seaweed blocked the path. “Too twisty!” said ${animal}.`,
      `${name} hummed a gentle tune. The seaweed swayed aside.`,
      `A treasure chest glinted in the sand. “Next time!”`,
      `They waved to a starfish and floated up at sunset, smiling.`,
    ],
    forest: [
      `Early in ${town}, the trees whispered hello. ${name} tied a snug ${color} jacket.`,
      `“Ready to hike?” asked ${name}. ${animal} bounced along.`,
      `Step, step—into the friendly woods.`,
      `Birds sang bright songs. ${name} listened with a smile.`,
      `They counted mushrooms on a log. “One, two, three!”`,
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

/* ===== SORA prompt pack (single-box prompts) ===== */
const CLEAR_AREAS = [
  "CLEAR LOWER AREA","CLEAR UPPER-LEFT","CLEAR UPPER-RIGHT","LARGE CLEAR SKY AT TOP",
  "CLEAR UPPER-LEFT","CLEAR RIGHT SIDE","CLEAR UPPER-RIGHT","CLEAR UPPER-LEFT",
];
const STYLE_HEADER = (clearArea) =>
  `Pixar-like kids’ picture-book still; stylized 3D; rounded features; warm, cozy lighting (soft key + gentle rim); subtle background bokeh; portrait 1080×1920; medium-wide framing with a ${clearArea} for text later. No on-image words.`;
const AVOID =
  "Avoid: photorealism, harsh/contrasty light, scary/angry faces, extra fingers, deformed hands, odd eyes, logos, watermarks, on-image text, posterization, blown highlights, gore.";

const LOCKS = {
  cowboy: [
    "CONSISTENCY — DO NOT CHANGE DESIGN:",
    "• SAME child every page: {Child} (identical face, hair, skin tone, proportions).",
    "• OUTFIT LOCK: {Color} cowboy hat (same color/shape), red bandana, denim vest, light checkered shirt, blue jeans, brown boots, brown belt.",
    "• PONY LOCK: same gentle brown pony with a white blaze and simple saddle — do not change markings or tack.",
    "• COMPANION: same cute {Animal} throughout (kid-safe, rounded).",
  ].join("\n"),
  space: [
    "CONSISTENCY — DO NOT CHANGE DESIGN:",
    "• SAME child every page: {Child} (identical face, hair, skin tone, proportions).",
    "• OUTFIT LOCK: shiny {Color} space helmet (same color/shape) and {Color}-accent flight suit with simple gloves/boots (keep accents {Color}).",
    "• SHIP LOCK: same cozy rocket cockpit/interior and round window/panel layout across pages.",
    "• COMPANION: same cute {Animal} co-pilot throughout.",
  ].join("\n"),
  underwater: [
    "CONSISTENCY — DO NOT CHANGE DESIGN:",
    "• SAME child every page: {Child} (identical face, hair, skin tone, proportions).",
    "• GEAR LOCK: shiny {Color} diving mask + snorkel (same color/shape), {Color}-trim fins, simple short-sleeve swim top.",
    "• WATER/REEF LOCK: same clear, gently blue water and cheerful reef style.",
    "• COMPANION: same cute {Animal} swimmer (kid-safe look).",
  ].join("\n"),
  forest: [
    "CONSISTENCY — DO NOT CHANGE DESIGN:",
    "• SAME child every page: {Child} (identical face, hair, skin tone, proportions).",
    "• OUTFIT LOCK: {Color} jacket (same color/shape) with simple zipper, comfy pants, small daypack — keep these exact items and colors.",
    "• WOODS LOCK: same friendly trees, footpath, small creek style across pages.",
    "• COMPANION: same cute {Animal} throughout.",
  ].join("\n"),
};

const ENV = {
  cowboy:
    "Ranch near “{Town}”: wooden fence, a few trees, soft dusty path; warm afternoon light; eye-level camera; keep heads/hat/ears fully in frame.",
  space:
    "Cozy rocket scenes near “{Town}” launch; soft sci-fi glow; cockpit with round window and panels; keep instruments consistent; eye-level camera.",
  underwater:
    "Shallow friendly reef near “{Town}”: clear water, sunbeams, soft caustics; bright coral; kid-safe marine life; eye-level camera.",
  forest:
    "Friendly woods near “{Town}”: dappled sunlight, soft footpath, ferns; occasional small creek or stump; eye-level camera.",
};

const SCENES = {
  cowboy: [
    "Page 1 — HAT ON HORSE|{Child} tips the {Color} hat and sits proudly on the gentle brown pony; reins relaxed; {Animal} at ground level near the fence. Subject slightly left-of-center.",
    "Page 2 — RIDE MEADOW|Cheerful clip-clop through a soft meadow; {Animal} trots alongside looking up at {Child}. Subject slightly right-of-center.",
    "Page 3 — WAVE FRIEND|{Child} waves toward the friendly {Animal} by a wooden fence; hint of a tiny town in the distance. Subject centered-right.",
    "Page 4 — COUNTING CLOUDS|{Child} points up at cloud shapes like a hat, a boot, and a tiny horse; pony calm; {Animal} looks up. Subject slightly right-of-center.",
    "Page 5 — CAMPFIRE SMILE|Evening campfire near a fence; warm orange rim light; pony nearby; {Animal} warms paws. Keep upper-left uncluttered.",
    "Page 6 — HIGH-FIVE|{Child} leans slightly from the saddle to high-five the {Animal}; pony attentive and friendly. Subject left-of-center; open space on right.",
    "Page 7 — TOWN WAVE|On a low hill, {Child} and {Animal} wave toward a faraway town; pony looks the same direction. Subject left-of-center; open sky upper-right.",
    "Page 8 — HOME SUNSET|Riding home at golden sunset; long soft shadows; peaceful mood. {Child} tips the {Color} hat; {Animal} rides along.",
  ],
  space: [
    "Page 1 — HELMET ON|{Child} holds/wears the shiny {Color} helmet, smiling toward camera; {Animal} peeks from the co-pilot seat in the cockpit.",
    "Page 2 — COCKPIT WINDOW|“Ready for launch!” {Animal} sits in the co-pilot seat while {Child} looks out the round window at gentle stars.",
    "Page 3 — ZERO-G FLOAT|Inside the cabin, {Child} and {Animal} float gently; straps and small tools drift; playful, safe moment.",
    "Page 4 — BUTTON POINT|{Child} points to a single glowing {Color} button on the panel; rocket begins to lift; smoke visible far below through window.",
    "Page 5 — ASTEROID DODGE|Outside the window: soft, cartoony asteroids and twinkly stars; {Child} steers calmly; {Animal} leans in, excited.",
    "Page 6 — MOON WAVE|On the Moon surface, {Child} waves; {Animal} stands beside; Earth small in the sky; flag stand ready.",
    "Page 7 — COMET HI|From the cockpit, {Child} and {Animal} wave to a friendly comet with a sparkly tail swooshing by.",
    "Page 8 — LANDING|Soft landing site near “{Town}”; rocket on skids; gentle dust; {Child} plants a small ‘Friends Forever’ flag (drawn graphic, not typed text).",
  ],
  underwater: [
    "Page 1 — MASK ON|At the shoreline, {Child} snugging the shiny {Color} mask; {Animal} splashes beside; entry rocks/sand visible.",
    "Page 2 — DIVE ENTRY|{Child} slides into water with a small splash; {Animal} paddles happily; gentle bubbles and surface light.",
    "Page 3 — CORAL PEEK|Underwater: {Child} peeks at cheerful reef fish near coral; {Animal} peers from below; friendly colors.",
    "Page 4 — SEAWEED TANGLE|Soft strands of seaweed across the path; {Child} and {Animal} pause with smiles; sunbeams reach down.",
    "Page 5 — HUM TUNE|{Child} hums gently; seaweed sways aside to open the path; {Animal} claps fins; tiny bubbles rise.",
    "Page 6 — TREASURE GLINT|Sandy patch with a half-buried chest glinting; {Child} notices with a ‘next time!’ gesture; {Animal} points.",
    "Page 7 — STARFISH WAVE|A cute starfish on a rock raises a tiny arm; {Child} and {Animal} wave back; rays of light through water.",
    "Page 8 — SURFACE SUNSET|Breaking the surface at sunset; orange-pink sky; droplets sparkle; both smiling.",
  ],
  forest: [
    "Page 1 — JACKET TIE|Trailhead near “{Town}”; {Child} ties the {Color} jacket snug; {Animal} waits by a wooden post with trail marker.",
    "Page 2 — TRAIL STEPS|{Child} and {Animal} take cheerful steps along a soft forest path; ferns and dappled light.",
    "Page 3 — BIRD LISTEN|{Child} cups an ear, listening to songbirds in branches; {Animal} looks up; sunbeams through leaves.",
    "Page 4 — MUSHROOM COUNT|Mossy log with friendly mushrooms; {Child} points and counts ‘one, two, three’; {Animal} nods.",
    "Page 5 — WOODEN BRIDGE|Small wooden bridge over a trickling stream; {Child} tap-taps across; {Animal} pauses mid-bridge to wave.",
    "Page 6 — SUNNY CLEARING|Grassy clearing; sun patch; stump or blanket; {Child} and {Animal} rest and share a snack.",
    "Page 7 — SNACK SHARE|{Child} offers a tiny snack to {Animal}; both smile; gentle, cozy moment in leaves and light.",
    "Page 8 — GOODNIGHT TREES|Path heading home; golden evening light; {Child} waves goodnight to the trees; {Animal} curls up.",
  ],
};

function tokens(str, a) {
  return str
    .replaceAll("{Child}", a.name || "Buddy")
    .replaceAll("{Color}", a.favoriteColor || "blue")
    .replaceAll("{Animal}", a.favoriteAnimal || "bunny")
    .replaceAll("{Town}", a.homeTown || "the park");
}
function buildSoraPromptForPage(adventure, a, i) {
  const header = STYLE_HEADER(CLEAR_AREAS[i]);
  const lock = tokens(LOCKS[adventure], a);
  const env = tokens(ENV[adventure], a);
  const [title, scene] = SCENES[adventure][i].split("|");
  return [
    header,"", lock,"",
    "ENVIRONMENT & COMPOSITION:", env,"",
    `SCENE (${title.toUpperCase()}):`, tokens(scene, a),"",
    AVOID,
  ].join("\n");
}
function buildSoraPromptPack(adventure, a) {
  const files = [];
  for (let i = 0; i < 8; i++) {
    const text = buildSoraPromptForPage(adventure, a, i);
    const name = `${adventure}_p${String(i + 1).padStart(2, "0")}.txt`;
    files.push({ name, text });
  }
  const combined =
    `# ${adventure[0].toUpperCase() + adventure.slice(1)} — SORA Prompts\n` +
    `Child: ${a.name || "Buddy"} • Color: ${a.favoriteColor || "blue"} • Animal: ${a.favoriteAnimal || "bunny"} • Town: ${a.homeTown || "the park"}\n\n` +
    files.map((f, i)=>`## Page ${i+1}\n\n${files[i].text}\n\n---\n\n`).join("");
  return { files, combined };
}

/* ===== PDF (portrait) ===== */
function exportPDF(pages, images, answers, storyChoice) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 28;
  const imgBoxH = pageH * 0.58;
  const textTop = margin + imgBoxH + 14;

  const title =
    (answers.name ? `${answers.name} — ` : "") +
    (STORY_CHOICES.find(s=>s.id===storyChoice)?.label.replace(/^[^ ]+ /,"") || "Storybook");

  doc.setFontSize(20); doc.text(title, margin, 72);
  doc.setFontSize(12); doc.text(`Pages: ${pages.length}`, margin, 96);

  pages.forEach((p, idx) => {
    if (idx !== 0) doc.addPage();

    const boxW = pageW - margin*2;
    const targetRatio = 1920/1080; // h / w
    let drawW = boxW, drawH = drawW*targetRatio;
    if (drawH > imgBoxH) { drawH = imgBoxH; drawW = drawH/targetRatio; }
    const imgX = margin + (boxW - drawW)/2;
    const imgY = margin;

    if (images[p.page]) {
      doc.addImage(images[p.page], "JPEG", imgX, imgY, drawW, drawH, undefined, "FAST");
    } else {
      doc.setDrawColor(180); doc.setLineDash([5]); doc.rect(imgX, imgY, drawW, drawH); doc.setLineDash([]);
      doc.setFontSize(11); doc.text("(Drop illustration here)", imgX+12, imgY+22);
    }

    doc.setFontSize(14);
    const lines = doc.splitTextToSize(p.text, pageW - margin*2);
    doc.text(lines, margin, textTop);

    doc.setFontSize(9); doc.text(`Page ${p.page}`, margin, pageH - margin);
  });

  doc.save((title.replace(/\s+/g,"_") || "storybook") + ".pdf");
}

/* ===== minimal UI helpers ===== */
function Box({children, style}) {
  return <div style={{border:"1px solid #ddd", borderRadius:12, padding:16, ...style}}>{children}</div>;
}
function Row({children, style}) {
  return <div style={{display:"flex", gap:12, flexWrap:"wrap", ...style}}>{children}</div>;
}
function Label({children}) { return <div style={{fontSize:12, opacity:0.65, marginBottom:6}}>{children}</div>; }
function Button({children, onClick, kind="solid"}) {
  const solid = {background:"#111", color:"#fff", border:"1px solid #111"};
  const outline = {background:"#fff", color:"#111", border:"1px solid #999"};
  return <button onClick={onClick} style={{padding:"10px 14px", borderRadius:10, cursor:"pointer", ...(kind==="solid"?solid:outline)}}>{children}</button>;
}

/* ===== main component ===== */
export default function UnifiedStorybookBuilder() {
  const [tab, setTab] = useState("character");
  const [answers, setAnswers] = useState({name:"", hair:"", skin:"", favoriteColor:"", favoriteAnimal:"", homeTown:""});
  const [storyChoice, setStoryChoice] = useState("cowboy");
  const [images, setImages] = useState({}); // {pageNumber: dataURL}
  const pages = useMemo(()=>buildPages(storyChoice, answers), [storyChoice, answers]);

  const setAns = (k,v)=>setAnswers(s=>({...s,[k]:v}));
  const onFile = (page, file)=>{
    if (!file) return;
    const fr = new FileReader();
    fr.onload = ()=> setImages(s=>({...s, [page]: fr.result}));
    fr.readAsDataURL(file);
  };

  return (
    <div style={{maxWidth:1000, margin:"0 auto", padding:20}}>
      <h1 style={{fontSize:22, fontWeight:700, marginBottom:10}}>Unified Storybook Builder</h1>
      <Row style={{marginBottom:12}}>
        <Button onClick={()=>setTab("character")} kind={tab==="character"?"solid":"outline"}>Character</Button>
        <Button onClick={()=>setTab("pages")} kind={tab==="pages"?"solid":"outline"}>Story Pages</Button>
        <Button onClick={()=>setTab("images")} kind={tab==="images"?"solid":"outline"}>Images</Button>
        <Button onClick={()=>setTab("export")} kind={tab==="export"?"solid":"outline"}>Export</Button>
      </Row>

      {tab==="character" && (
        <Box>
          <h3 style={{marginTop:0}}>Child & Story</h3>
          <Row>
            <input placeholder="Child's name" value={answers.name} onChange={e=>setAns("name", e.target.value)} />
            <input placeholder="Hair (e.g., brown curly)" value={answers.hair} onChange={e=>setAns("hair", e.target.value)} />
            <input placeholder="Skin (e.g., fair / tan / dark)" value={answers.skin} onChange={e=>setAns("skin", e.target.value)} />
            <input placeholder="Favorite color" value={answers.favoriteColor} onChange={e=>setAns("favoriteColor", e.target.value)} />
            <input placeholder="Favorite animal" value={answers.favoriteAnimal} onChange={e=>setAns("favoriteAnimal", e.target.value)} />
            <input placeholder="Hometown / place" value={answers.homeTown} onChange={e=>setAns("homeTown", e.target.value)} />
          </Row>
          <div style={{marginTop:10}}>
            {STORY_CHOICES.map(opt=>(
              <label key={opt.id} style={{marginRight:16}}>
                <input type="radio" name="storyChoice" value={opt.id} checked={storyChoice===opt.id} onChange={e=>setStoryChoice(e.target.value)} /> {opt.label}
              </label>
            ))}
          </div>
          <div style={{marginTop:10}}>
            <Button onClick={()=>setTab("pages")}>Go to Story Pages →</Button>
          </div>
        </Box>
      )}

      {tab==="pages" && (
        <Box>
          <h3 style={{marginTop:0}}>Story Pages (auto-filled)</h3>

          {/* SORA Prompt Pack actions */}
          <Row style={{marginBottom:12}}>
            <Button onClick={async ()=>{
              const pack = buildSoraPromptPack(storyChoice, answers);
              const zip = new JSZip();
              pack.files.forEach(f=>zip.file(f.name, f.text));
              zip.file("ALL_PROMPTS.md", pack.combined);
              const blob = await zip.generateAsync({type:"blob"});
              const base = `${answers.name || "child"}_${storyChoice}_SORA_Prompts`;
              saveAs(blob, `${base}.zip`);
            }}>Download SORA Prompt Pack (.zip)</Button>

            <Button kind="outline" onClick={()=>{
              const { combined } = buildSoraPromptPack(storyChoice, answers);
              const blob = new Blob([combined], {type:"text/markdown"});
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
              setTimeout(()=>URL.revokeObjectURL(url), 4000);
            }}>Preview Combined (MD)</Button>
          </Row>

          <Row style={{alignItems:"flex-start"}}>
            <div style={{flex:"1 1 300px"}}>
              {pages.map(p=>(
                <div key={p.page} style={{display:"flex", justifyContent:"space-between", border:"1px solid #eee", borderRadius:10, padding:"8px 12px", marginBottom:8}}>
                  <div><b>Page {p.page}</b>: {p.pose}</div>
                  <div style={{fontSize:12, opacity:0.7}}>Seed {p.seed}</div>
                </div>
              ))}
            </div>
            <div style={{flex:"1 1 300px"}}>
              {pages.map(p=>(
                <div key={p.page} style={{marginBottom:16}}>
                  <Label>Script (book text) — Page {p.page}</Label>
                  <textarea value={p.text} readOnly style={{width:"100%", minHeight:80}} />
                </div>
              ))}
            </div>
          </Row>

          <Button onClick={()=>setTab("images")}>Go to Images →</Button>
        </Box>
      )}

      {tab==="images" && (
        <Box>
          <h3 style={{marginTop:0}}>Upload one illustration per page</h3>
          <Row>
            {pages.map(p=>(
              <div key={p.page} style={{flex:"1 1 300px", border:"1px solid #eee", borderRadius:10, padding:12}}>
                <div style={{fontWeight:600, marginBottom:8}}>Page {p.page}</div>
                <label style={{display:"block", border:"2px dashed #ccc", borderRadius:12, padding:10, textAlign:"center", cursor:"pointer"}}>
                  <input type="file" accept="image/*" style={{display:"none"}}
                         onChange={e=>{ const f=e.target.files?.[0]; if (f) onFile(p.page, f); }} />
                  {images[p.page]
                    ? <img src={images[p.page]} alt={`Page ${p.page}`} style={{width:"100%", height:180, objectFit:"cover", borderRadius:8}} />
                    : <div style={{fontSize:13, opacity:0.7}}>Click to add illustration</div>}
                </label>
              </div>
            ))}
          </Row>
          <div style={{marginTop:12}}><Button onClick={()=>setTab("export")}>Go to Export →</Button></div>
        </Box>
      )}

      {tab==="export" && (
        <Box>
          <h3 style={{marginTop:0}}>Export Picture-Book PDF (Portrait)</h3>
          <p style={{fontSize:13, opacity:0.8}}>Make sure each page has its image, then export.</p>
          <Button onClick={()=>exportPDF(pages, images, answers, storyChoice)}>Export PDF</Button>
        </Box>
      )}
    </div>
  );
}
