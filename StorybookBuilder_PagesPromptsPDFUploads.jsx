import React, { useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";

const defaultForm = {
  name: "",
  gender: "child",
  skin: "light",
  hair: "",
  favoriteColor: "",
  favoriteAnimal: "",
  homeTown: "",
  story: "cowboy",
};

const GLOBAL_STYLE_PROMPT =
  "Children’s picture-book Pixar-style CGI illustration — stylized 3D, rounded shapes, soft painted textures, warm cozy colors, gentle cinematic lighting (key + soft rim), subtle depth of field, expressive eyes, friendly smiles, consistent character design across all pages.";

const CONSISTENCY_RULES = (a) => `Consistency: ${a.name} is a ${a.gender} with ${a.skin} skin and ${a.hair} hair. Keep the same outfit/accent color (${a.favoriteColor}) every page. Favorite animal (${a.favoriteAnimal}) appears with the same design each page. Setting references ${a.homeTown}. Framing: medium-wide composition with room for text, friendly tone.`;

const childDescriptor = ({ gender, skin, hair }) => {
  const g = (gender || "child").toLowerCase();
  const skinTxt = skin ? `${skin} skin` : "friendly skin tone";
  const hairTxt = hair ? `${hair} hair` : "neat hair";
  return `${g} with ${skinTxt} and ${hairTxt}`;
};

function cowboyPages(a) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown, gender, skin } = a;
  const kid = childDescriptor({ gender, skin, hair });
  return [
    { page: 1, text: `In ${homeTown}, ${name} put on a big ${favoriteColor} cowboy hat. "Yee-haw!" said ${name} with a big smile, sitting on Thunder the gentle horse.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid}, wearing a ${favoriteColor} cowboy hat, beside a calm horse named Thunder; small-town ${homeTown} backdrop, warm morning light.` },
    { page: 2, text: `Suddenly, ${favoriteAnimal} came hopping along. "Do you want to ride with me?" asked ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} greeting a friendly ${favoriteAnimal}; open field with flowers; welcoming gesture.` },
    { page: 3, text: `Together they rode slowly across the gentle field. The grass went swish-swash, swish-swash.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} riding with ${favoriteAnimal} companion; tall grass swaying; wide composition showing movement; soft clouds.` },
    { page: 4, text: `Thunder carried them to the old oak tree. They tied a ribbon and sang a cowboy song.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} at a big oak tree with a colorful ribbon; horse nearby; musical notes doodled; afternoon light through leaves.` },
    { page: 5, text: `Next, they trotted by the little stream. Splash! ${favoriteAnimal} dipped a paw in the cool water.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} by a clear stream; ${favoriteAnimal} splashing; sparkly water droplets; playful mood.` },
    { page: 6, text: `They paused by the fence and counted clouds. "One, two, three!" said ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} pointing at cloud shapes (hat, boot, tiny horse); wide sky; fence in foreground; gentle perspective.` },
    { page: 7, text: `At the end of the ride, ${name} gave ${favoriteAnimal} a hug. "Being together makes every adventure fun," said ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} hugging a friendly ${favoriteAnimal}; horse watching kindly; golden-hour glow; heartwarming.` },
    { page: 8, text: `With the cowboy hat tilted just right, ${name} and ${favoriteAnimal} laughed all the way home.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} riding toward a cozy ${homeTown} horizon; hat tilted cute; sunset colors; storybook finish.` },
  ];
}

function spacePages(a) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown, gender, skin } = a;
  const kid = childDescriptor({ gender, skin, hair });
  return [
    { page: 1, text: `The countdown echoed in ${homeTown}'s backyard. ${name} held tight to the shiny ${favoriteColor} helmet.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} in a ${favoriteColor} space suit; backyard launch pad; rocket with gentle smoke puffs.` },
    { page: 2, text: `"Ready for launch!" shouted ${name}. ${favoriteAnimal} wiggled into the co-pilot seat.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: cockpit interior; ${favoriteAnimal} as co-pilot; playful control panels.` },
    { page: 3, text: `Puff, puff… white smoke curled from the engines. Rumble-rumble… the ground shook.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: liftoff moment; bright exhaust; neighbors waving from ${homeTown}.` },
    { page: 4, text: `3…2…1… Whoooosh! The rocket zoomed into the starry sky.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: rocket ascending; stars and moon; cinematic angle.` },
    { page: 5, text: `Twinkly stars danced outside the window. "Hello, galaxy!" laughed ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: interior window framing stars; ${kid} smiling.` },
    { page: 6, text: `Suddenly, space dust swirled across the path. "Oh no, it's too thick!" said ${favoriteAnimal}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: colorful nebula dust; concerned expressions.` },
    { page: 7, text: `${name} pressed a big glowing button. Zzzap! A rainbow trail cleared the way.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: cockpit button press; outside shows rainbow trail carving through dust.` },
    { page: 8, text: `Past the rings of Saturn they zoomed. ${favoriteAnimal} tapped the glass. "Look! Shooting stars!"`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: exterior shot with Saturn rings; interior silhouettes.` },
    { page: 9, text: `Together they zipped to the Moon and planted a flag: "Friends Forever."`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: lunar surface; flag with friendly typography; Earth in the sky.` },
    { page: 10, text: `They steered home, hearts full of starlight and big smiles.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: reentry glow; cozy ${homeTown} night on return.` },
  ];
}

function underwaterPages(a) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown, gender, skin } = a;
  const kid = childDescriptor({ gender, skin, hair });
  return [
    { page: 1, text: `In ${homeTown}, ${name} put on a shiny ${favoriteColor} diving mask.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} kneeling by shore; ${favoriteColor} mask; gentle waves.` },
    { page: 2, text: `"Ready to explore?" asked ${name}. ${favoriteAnimal} splashed with a happy wiggle.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: shoreline splash; ${favoriteAnimal} friendly and consistent.` },
    { page: 3, text: `Down, down, down they went. Bubbles floated all around.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: underwater descent; bubble trails; coral silhouettes.` },
    { page: 4, text: `Colorful fish peeked from coral caves. One fish blew a bubble kiss!`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: playful fish; coral castle vibe.` },
    { page: 5, text: `Seaweed blocked the path. "Oh no, it's too twisty!" said ${favoriteAnimal}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ribbon-like seaweed maze.` },
    { page: 6, text: `${name} hummed a gentle tune. The seaweed swayed aside.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: musical notes in water; cleared path.` },
    { page: 7, text: `They swam past a treasure chest half buried in sand. "Next time!" whispered ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: old chest; shy crab; sunbeams.` },
    { page: 8, text: `At last, a tall coral castle appeared. The starfish guards waved.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: whimsical coral towers; waving starfish.` },
    { page: 9, text: `When the sun set through the water, they floated up, giggling with sea-sparkles.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: upward swim; orange-pink rays; surface glow.` },
  ];
}

function forestPages(a) {
  const { name, hair, favoriteColor, favoriteAnimal, homeTown, gender, skin } = a;
  const kid = childDescriptor({ gender, skin, hair });
  return [
    { page: 1, text: `Early in ${homeTown}, the trees whispered hello. ${name} tied the ${favoriteColor} jacket snug.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: ${kid} at trailhead; ${favoriteColor} jacket; morning mist.` },
    { page: 2, text: `"Ready to hike?" asked ${name}. ${favoriteAnimal} hopped along happily.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: forest path; buddy ${favoriteAnimal}.` },
    { page: 3, text: `Step, step, step — into the forest they went. Tall trees waved hello.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: towering trees; soft dappled light.` },
    { page: 4, text: `Birds sang a cheery tune. ${name} whistled back.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: birds on branches; playful notes.` },
    { page: 5, text: `They found a log covered in mushrooms. "One, two, three!"`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: cute mushroom log; counting gesture.` },
    { page: 6, text: `A soft breeze rustled the leaves. "Shh… listen," whispered ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: close-up listening pose; leaves flutter.` },
    { page: 7, text: `They crossed a little wooden bridge. Tap, tap went their feet.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: wooden bridge over stream; gurgling water.` },
    { page: 8, text: `They reached a sunny clearing and shared snacks.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: picnic blanket; ${favoriteAnimal} curled up beside ${name}.` },
    { page: 9, text: `"Exploring is more fun with friends," said ${name}.`, illustration: `${GLOBAL_STYLE_PROMPT} ${CONSISTENCY_RULES(a)} Scene: sunset through trees; cozy goodbye.` },
  ];
}

const builders = {
  cowboy: cowboyPages,
  space: spacePages,
  underwater: underwaterPages,
  forest: forestPages,
};

export default function StorybookBuilder_PagesPromptsPDFUploads(){
  const [form, setForm] = useState({
    name: "",
    gender: "child",
    skin: "light",
    hair: "",
    favoriteColor: "",
    favoriteAnimal: "",
    homeTown: "",
    story: "cowboy",
  });
  const [pages, setPages] = useState([]);
  const [images, setImages] = useState({}); 
  const fileInputs = useRef({}); 

  const generated = React.useMemo(() => {
    const fn = builders[form.story] || cowboyPages;
    return fn(form);
  }, [form]);

  const handleGenerate = () => setPages(generated);

  const handleImage = async (page, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    const loaded = new Promise((res) => { img.onload = () => res(true); img.onerror = () => res(false); });
    img.src = url;
    await loaded;
    setImages((m) => ({ ...m, [page]: { file, url, imgEl: img } }));
  };

  const downloadScriptAndPrompts = () => {
    const header = `Story: ${form.story}
Child: ${form.name} (${form.gender}, ${form.skin} skin, ${form.hair} hair)
Color: ${form.favoriteColor} • Animal: ${form.favoriteAnimal} • Home: ${form.homeTown}

GLOBAL STYLE:
${GLOBAL_STYLE_PROMPT}

CONSISTENCY:
${CONSISTENCY_RULES(form)}

`;
    const body = pages.map(p => `Page ${p.page}
Text: ${p.text}
Prompt: ${p.illustration}
`).join("
");
    const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.name || "storybook"}_${form.story}_script_prompts.txt`;
    a.click();
  };

  const downloadPDF = async () => {
    if (!pages.length) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "letter" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 36;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`Story Time with Tim — ${form.story[0].toUpperCase() + form.story.slice(1)}`, W/2, 120, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`${form.name} • ${form.gender} • ${form.skin} skin • ${form.hair} hair`, W/2, 160, { align: "center" });
    doc.text(`Fav color: ${form.favoriteColor} • Fav animal: ${form.favoriteAnimal} • ${form.homeTown}`, W/2, 185, { align: "center" });
    doc.setFontSize(11);
    doc.text("Pixar-style note: images should match prompts and stay visually consistent across all pages.", W/2, 220, { align: "center" });

    pages.forEach((p, idx) => {
      if (idx !== 0) doc.addPage();
      const img = images[p.page]?.imgEl;
      if (img) {
        const boxW = W - margin*2;
        const boxH = H - margin*2 - 120;
        const ratio = Math.min(boxW / img.width, boxH / img.height);
        const iw = img.width * ratio;
        const ih = img.height * ratio;
        const ix = (W - iw) / 2;
        const iy = margin;
        doc.addImage(img, "JPEG", ix, iy, iw, ih);
      } else {
        doc.setDrawColor(180);
        doc.setLineWidth(1);
        doc.rect(margin, margin, W - margin*2, H - margin*2 - 120);
        doc.setFontSize(12);
        doc.text("No image uploaded for this page yet.", W/2, H/2 - 20, { align: "center" });
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Page ${p.page}`, margin, H - margin - 90);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const text = doc.splitTextToSize(p.text, W - margin*2);
      doc.text(text, margin, H - margin - 70);
    });

    doc.save(`${form.name || "storybook"}_${form.story}_picturebook.pdf`);
  };

  return (
    <div className="grid two" style={{alignItems:"start"}}>
      <div className="card sticky">
        <h2>Child & Story Info</h2>
        <div className="grid two">
          <div>
            <label>Child's Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="e.g., Mia" />
          </div>
          <div>
            <label>Gender</label>
            <select value={form.gender} onChange={(e)=>setForm({...form, gender:e.target.value})}>
              <option>child</option>
              <option>girl</option>
              <option>boy</option>
              <option>kid</option>
            </select>
          </div>
          <div>
            <label>Skin Tone</label>
            <select value={form.skin} onChange={(e)=>setForm({...form, skin:e.target.value})}>
              <option>light</option>
              <option>tan</option>
              <option>dark</option>
            </select>
          </div>
          <div>
            <label>Hair</label>
            <input value={form.hair} onChange={(e)=>setForm({...form, hair:e.target.value})} placeholder="e.g., brown, curly" />
          </div>
          <div>
            <label>Favorite Color</label>
            <input value={form.favoriteColor} onChange={(e)=>setForm({...form, favoriteColor:e.target.value})} placeholder="e.g., purple" />
          </div>
          <div>
            <label>Favorite Animal</label>
            <input value={form.favoriteAnimal} onChange={(e)=>setForm({...form, favoriteAnimal:e.target.value})} placeholder="e.g., bunny" />
          </div>
          <div>
            <label>Favorite Place / Home Town</label>
            <input value={form.homeTown} onChange={(e)=>setForm({...form, homeTown:e.target.value})} placeholder="e.g., the park; Columbia" />
          </div>
          <div>
            <label>Story Choice</label>
            <select value={form.story} onChange={(e)=>setForm({...form, story:e.target.value})}>
              <option value="cowboy">🐎 Cowboy Adventure</option>
              <option value="space">🚀 Space Ranger Saga</option>
              <option value="underwater">🌊 Underwater Voyage</option>
              <option value="forest">🌲 Exploring the Forest</option>
            </select>
          </div>
        </div>

        <div className="row" style={{marginTop:12}}>
          <button onClick={handleGenerate}>Generate Pages</button>
          <button className="secondary" onClick={downloadScriptAndPrompts}>Download Script + Prompts (TXT)</button>
          <button className="secondary" onClick={downloadPDF}>Export Picture-Book PDF</button>
        </div>

        <div style={{marginTop:12}}>
          <span className="pill mono">Pixar-style</span>
          <span className="pill mono">Consistent outfits & animal</span>
          <span className="pill mono">Room for text</span>
        </div>
      </div>

      <div className="grid" style={{gap:16}}>
        <div className="card">
          <h2>Global Illustration Notes</h2>
          <p className="small"><strong>Style:</strong> {GLOBAL_STYLE_PROMPT}</p>
          <p className="small"><strong>Consistency:</strong> {CONSISTENCY_RULES(form)}</p>
        </div>

        {pages.length === 0 && (
          <div className="card">
            <p className="muted">Click <strong>Generate Pages</strong> to build the page texts and prompts.</p>
          </div>
        )}

        {pages.map((p) => (
          <div className="page" key={p.page}>
            <div className="grid two">
              <div>
                <div className="thumb">{images[p.page]?.url ? <img src={images[p.page].url} alt={`Page ${p.page}`} /> : <span className="muted small">Upload an image for this page</span>}</div>
                <div className="row" style={{marginTop:8}}>
                  <input type="file" accept="image/*" onChange={(e)=>handleImage(p.page, e.target.files?.[0])} ref={(el)=>fileInputs.current[p.page]=el} />
                  <button className="secondary" onClick={()=>{ setImages(m=>({ ...m, [p.page]: undefined })); if(fileInputs.current[p.page]) fileInputs.current[p.page].value=""; }}>Clear</button>
                </div>
              </div>
              <div>
                <h3 style={{marginTop:0}}>Page {p.page}</h3>
                <label>Story Text</label>
                <textarea value={p.text} onChange={(e)=>{
                  const v=e.target.value;
                  setPages(prev => prev.map(x => x.page===p.page ? {...x, text:v} : x));
                }} />
                <label style={{marginTop:8}}>Illustration Prompt (editable)</label>
                <textarea value={p.illustration} onChange={(e)=>{
                  const v=e.target.value;
                  setPages(prev => prev.map(x => x.page===p.page ? {...x, illustration:v} : x));
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
