                                    (function(){const STORAGE_KEY="Accessabox_settings";const Z_INDEX={toggle:"100000",panel:"99999",top:"2147483647000"};const COLORS={dark:"#1e1e1e",white:"#ffffff",black:"#000000",accent:"#4f46e5",overlay:"rgba(0,0,0,0.8)",yellow:"#ffff00",transparent:"rgba(255,255,255,0.08)",darkOverlay:"rgba(30, 30, 30, 0.85)"};const defaultSettings={contrast:false,dyslexiaFont:"normal",pauseAnimations:false,highlightLinks:false,biggerText:0,textSpacing:"normal",hideImages:false,cursor:false,lineHeight:"normal",textAlign:"left",saturation:false};const slug=(val)=>String(val).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");const keyClass=(key)=>key.replace(/[A-Z]/g,m=>"-"+m.toLowerCase());const updateClassList=(element,baseClass,value)=>{const classesToRemove=Array.from(element.classList).filter(cls=>cls===baseClass||cls.startsWith(`${baseClass}-`));classesToRemove.forEach(cls=>element.classList.remove(cls));if(typeof value==="boolean"){if(value)element.classList.add(baseClass);}else{element.classList.add(`${baseClass}-${slug(value)}`);}};let settings={};let presets=[];let wrapper,panel,toggleBtn;let baseFontSize=16;const controls=[{label:"Toggle High Contrast",key:"contrast"},{label:"Dyslexia Friendly",key:"dyslexiaFont",type:"select",style:"color: white;",options:["normal","Arial","Verdana","OpenDyslexic"],cssGenerator:opts=>`
        .acc-dyslexia-font-normal .acc-wrapper * { font-family: initial !important; }
        .acc-dyslexia-font-arial .acc-wrapper * { font-family: Arial, sans-serif !important; }
        .acc-dyslexia-font-verdana .acc-wrapper * { font-family: Verdana, sans-serif !important; }
        .acc-dyslexia-font-opendyslexic .acc-wrapper * { font-family: 'OpenDyslexic', Arial, sans-serif !important; }
      `},{label:"Pause Animations",key:"pauseAnimations"},{label:"Highlight Links",key:"highlightLinks"},{label:"Bigger Text",key:"biggerText",type:"range",min:0,max:200,step:1},{label:"Text Spacing",key:"textSpacing",options:["normal","wide","wider"],cssGenerator:opts=>`
        .acc-text-spacing-normal .acc-wrapper * { letter-spacing: normal !important; word-spacing: normal !important; }
        .acc-text-spacing-wide .acc-wrapper * { letter-spacing: 0.08em !important; word-spacing: 0.15em !important; }
        .acc-text-spacing-wider .acc-wrapper * { letter-spacing: 0.12em !important; word-spacing: 0.3em !important; }
      `},{label:"Hide Images",key:"hideImages"},{label:"Cursor",key:"cursor"},{label:"Line Height",key:"lineHeight",options:["normal","1.5","2"],cssGenerator:opts=>`
        .acc-line-height-normal .acc-wrapper * { line-height: initial !important; }
        .acc-line-height-1-5 .acc-wrapper * { line-height: 1.5 !important; }
        .acc-line-height-2 .acc-wrapper * { line-height: 2 !important; }
      `},{label:"Text Align",key:"textAlign",options:["left","center","right","justify"],cssProperty:"text-align"},{label:"Saturation",key:"saturation"}];const loadSettings=async()=>{try{if(!chrome?.storage?.local){console.warn("Chrome storage API not available. Using defaults.");settings={...defaultSettings};presets=[];return;}
const result=await chrome.storage.local.get(STORAGE_KEY);let data=result[STORAGE_KEY];if(data){try{data=JSON.parse(data);}catch{}}
if(data&&data.settings){settings=data.settings;presets=data.presets||[];}else{settings=data||{...defaultSettings};presets=[];}}catch(e){console.error("Failed to load settings:",e);settings={...defaultSettings};presets=[];}
controls.forEach(def=>{if(def.options&&!def.options.includes(settings[def.key])){settings[def.key]=def.options[0];}
if(def.type==="range"){const num=Number(settings[def.key]);settings[def.key]=isNaN(num)?0:num;if(typeof def.min==="number"&&settings[def.key]<def.min){settings[def.key]=def.min;}
if(typeof def.max==="number"&&settings[def.key]>def.max){settings[def.key]=def.max;}}});};const saveSettings=async()=>{try{if(!chrome?.storage?.local){console.warn("Chrome storage API not available. Settings not persisted.");return;}
const payload=JSON.stringify({settings,presets});await chrome.storage.local.set({[STORAGE_KEY]:payload});}catch(e){console.error("Failed to save settings:",e);}};const applyFilters=()=>{const filters=[];if(settings.saturation)filters.push("saturate(150%)");const target=wrapper||document.documentElement;target.style.filter=filters.join(" ");};const applyTextScaling=(scale)=>{const root=document.body;const exclude='#acc-panel, #acc-toggle-btn';const nodes=root.querySelectorAll('*');nodes.forEach(el=>{if(el.matches(exclude)||el.closest('#acc-panel')||el.id==='acc-toggle-btn')return;if(!el.dataset.origFontSize){el.dataset.origFontSize=getComputedStyle(el).fontSize||'';}
const orig=parseFloat(el.dataset.origFontSize)||baseFontSize;if(scale===1){el.style.fontSize='';}else{el.style.fontSize=`${orig * scale}px`;}});};const applySettings=()=>{Object.entries(settings).forEach(([key,value])=>{if(key==="biggerText")return;const baseClass=`acc-${keyClass(key)}`;updateClassList(document.documentElement,baseClass,value);});if(settings.biggerText&&settings.biggerText>baseFontSize){const scale=settings.biggerText / baseFontSize;applyTextScaling(scale);}else{applyTextScaling(1);}
if(panel){updatePanelUI();}
applyFilters();};const updatePanelUI=()=>{panel.querySelectorAll("button, select, input[type=range]").forEach(el=>{const key=el.dataset.settingKey;if(!key)return;const value=settings[key];const isChanged=value!==defaultSettings[key];if(el.tagName.toLowerCase()==="select"){el.value=value;el.classList.toggle("active",isChanged);}else if(el.tagName.toLowerCase()==="input"&&el.type==="range"){const minVal=Number(el.min)||0;const numeric=Number(value);el.value=numeric<=minVal?minVal:numeric;const display=el.nextElementSibling;if(display&&display.classList.contains("range-value")){display.textContent=(numeric&&numeric>baseFontSize)?`${numeric}px`:`${baseFontSize}px`;}
el.classList.toggle("active",numeric>baseFontSize);}else{const options=el.dataset.options?.split(",");if(options){el.querySelectorAll(".dot").forEach((dot,i)=>{dot.classList.toggle("active",options[i]===value);});}else{el.setAttribute("aria-pressed",String(Boolean(value)));}
el.classList.toggle("active",isChanged);}});};const createStyle=()=>{const style=document.createElement("style");let css=`
    /* load OpenDyslexic font for dyslexia-friendly option */
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/otf/OpenDyslexicMono-Regular.otf') format('opentype');
      font-weight: normal;
      font-style: normal;
    }

    .acc-toggle-btn {
      pointer-events: auto !important;
      z-index: ${Z_INDEX.top} !important;
    }

    .acc-contrast .acc-wrapper * {
      background: ${COLORS.black} !important;
      color: ${COLORS.white} !important;
      border-color: ${COLORS.white} !important;
    }

    .acc-dyslexia-font .acc-wrapper * {
      font-family: Arial, Verdana, sans-serif !important;
      letter-spacing: 0.05em;
      line-height: 1.6;
    }

    .acc-pause-animations .acc-wrapper *,
    .acc-pause-animations .acc-panel,
    .acc-pause-animations .acc-panel * {
      animation: none !important;
      transition: none !important;
    }

    .acc-highlight-links .acc-wrapper a {
      background: ${COLORS.yellow} !important;
      color: ${COLORS.black} !important;
      font-weight: bold;
    }

    /* bigger text sizing is handled dynamically now via inline style on wrapper */

    .acc-hide-images img {
      display: none !important;
    }

    .acc-cursor .acc-wrapper * {
      cursor: pointer !important;
    }
`;controls.forEach(def=>{if(def.options){if(def.cssGenerator){css+=def.cssGenerator(def.options)+"\n";}else if(def.cssProperty){const base=keyClass(def.key);def.options.forEach(opt=>{const safe=slug(opt);css+=`.acc-${base}-${safe} .acc-wrapper * { ${def.cssProperty}: ${opt} !important; }\n`;});}}});css+=`
    .acc-panel {
      display: block;
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 260px;
      background: ${COLORS.darkOverlay};
      backdrop-filter: blur(12px);
      color: ${COLORS.white};
      padding: 18px;
      border-radius: 16px;
      z-index: ${Z_INDEX.panel};
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      max-height: 75vh;
      overflow-y: auto;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s ease;
    }

    .acc-panel.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .acc-panel h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .acc-panel button {
      display: block;
      margin-bottom: 8px;
      width: 100%;
      padding: 8px 10px;
      border-radius: 10px;
      border: none;
      background: ${COLORS.transparent};
      color: ${COLORS.white};
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
    }

    .control-select {
      margin-bottom: 8px;
    }

    .control-select label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .control-select select {
      width: 100%;
      padding: 4px 6px;
      border-radius: 4px;
      border: none;
      font-size: 14px;
    }

    /* slider for bigger text */
    .control-range {
      margin-bottom: 8px;
    }
    .control-range label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }
    .control-range input[type=range] {
      width: 100%;
    }
    .control-range .range-value {
      display: inline-block;
      margin-left: 6px;
      font-size: 13px;
      vertical-align: middle;
    }

    .acc-panel button:hover {
      background: rgba(255,255,255,0.18);
    }

    .acc-panel button.active {
      background: ${COLORS.accent};
    }

    .indicator {
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-top: 4px;
    }

    .indicator .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${COLORS.white};
      opacity: 0.4;
      transition: opacity 0.15s;
    }

    .indicator .dot.active {
      opacity: 1;
    }

    .acc-toggle-btn {
      background: ${COLORS.overlay};
      color: ${COLORS.white};
      transition: background 0.2s ease;
    }

    .acc-toggle-btn:hover {
      background: rgba(0, 0, 0, 0.6);
      color: ${COLORS.white};
      font-weight: 600;
    }

    /* ensure panel and toggle are not affected by font-size changes */
    #acc-panel, #acc-toggle-btn {
      font-size: initial !important;
    }

    /* preset list styling */
    .preset-toggle-btn {
      display: block;
      margin-top: 4px;
      width: 100%;
      padding: 8px 10px;
      border-radius: 10px;
      border: none;
      background: ${COLORS.transparent};
      color: ${COLORS.white};
      cursor: pointer;
      font-size: 13px;
      text-align: left;
    }
    .preset-toggle-btn:hover {
      background: rgba(255,255,255,0.18);
    }
    .preset-list {
      margin-top: 4px;
      max-height: 150px;
      overflow-y: auto;
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 6px;
      display: none;
    }
    .preset-list.open {
      display: block;
    }
    .preset-item {
      position: relative;
      padding: 4px 24px 4px 6px;
      font-size: 13px;
      cursor: pointer;
    }
    .preset-item:hover {
      background: rgba(255,255,255,0.1);
    }
    .preset-delete {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: ${COLORS.accent};
      cursor: pointer;
    }
`;style.textContent=css;(document.head||document.documentElement).appendChild(style);};const wrapContent=()=>{if(document.body.classList.contains('acc-wrapped'))return;wrapper=document.body;document.body.classList.add('acc-wrapped','acc-wrapper');};const createControlButton=(def)=>{if(def.type==="select"){const container=document.createElement("div");container.className="control-select";const label=document.createElement("label");label.htmlFor=`select-${def.key}`;label.textContent=def.label;const select=document.createElement("select");select.id=`select-${def.key}`;select.dataset.settingKey=def.key;def.options.forEach(opt=>{const option=document.createElement("option");option.value=opt;option.textContent=opt==="normal"?"Off":opt;option.selected=settings[def.key]===opt;select.appendChild(option);});select.addEventListener("change",async()=>{settings[def.key]=select.value;applySettings();await saveSettings();});container.appendChild(label);container.appendChild(select);return container;}
if(def.type==="range"){const container=document.createElement("div");container.className="control-range";const label=document.createElement("label");label.htmlFor=`range-${def.key}`;label.textContent=def.label;const input=document.createElement("input");input.type="range";input.id=`range-${def.key}`;input.dataset.settingKey=def.key;input.min=def.min;input.max=def.max;input.step=def.step||1;input.value=settings[def.key]||0;const display=document.createElement("span");display.className="range-value";display.textContent=input.value?`${input.value}px`:"Auto";input.addEventListener("input",async()=>{settings[def.key]=Number(input.value);display.textContent=settings[def.key]?`${settings[def.key]}px`:"Auto";applySettings();await saveSettings();});container.appendChild(label);container.appendChild(input);container.appendChild(display);return container;}
const btn=document.createElement("button");btn.type="button";btn.textContent=def.label;btn.dataset.settingKey=def.key;if(def.options){btn.dataset.options=def.options.join(",");const indicator=document.createElement("div");indicator.className="indicator";def.options.forEach(opt=>{const dot=document.createElement("span");dot.className="dot";if(settings[def.key]===opt)dot.classList.add("active");indicator.appendChild(dot);});btn.appendChild(indicator);}else{btn.setAttribute("aria-pressed",String(settings[def.key]));}
btn.addEventListener("click",async()=>{if(def.options){const opts=def.options;const current=settings[def.key];const idx=opts.indexOf(current);settings[def.key]=opts[(idx+1)%opts.length];}else{settings[def.key]=!settings[def.key];}
applySettings();await saveSettings();});return btn;};const renderPresetList=()=>{let list=panel.querySelector('.preset-list');if(!list)return;list.innerHTML='';if(presets.length===0){const empty=document.createElement('div');empty.className='preset-item';empty.style.fontStyle='italic';empty.textContent='No presets saved';list.appendChild(empty);return;}
presets.forEach(p=>{const item=document.createElement('div');item.className='preset-item';item.textContent=`${p.name} (${p.url})`;item.dataset.id=p.id;if(p.url===window.location.hostname){item.style.fontWeight='600';}
const del=document.createElement('span');del.className='preset-delete';del.textContent='✕';del.title='Delete preset';del.style.display='none';del.style.color=COLORS.white;del.addEventListener('click',async e=>{e.stopPropagation();presets=presets.filter(x=>x.id!==p.id);await saveSettings();renderPresetList();});item.addEventListener('mouseenter',()=>del.style.display='inline');item.addEventListener('mouseleave',()=>del.style.display='none');item.addEventListener('click',async()=>{settings={...p.settings};applySettings();await saveSettings();});item.appendChild(del);list.appendChild(item);});};const savePreset=async()=>{const url=window.location.hostname;const defaultName=url||'site';const name=prompt('Enter a name for this preset',defaultName);if(!name)return;const id=Date.now();presets.push({id,name,url,settings:{...settings}});await saveSettings();renderPresetList();};const buildPanel=()=>{panel=document.createElement("div");panel.className="acc-panel";panel.id="acc-panel";panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-hidden","true");const baseSize=parseFloat(getComputedStyle(document.body).fontSize)||16;baseFontSize=baseSize;controls.forEach(def=>{if(def.key==="biggerText"&&def.type==="range"){def.min=Math.round(baseSize);if(settings.biggerText<=0){settings.biggerText=0;}
if(typeof def.max==="number"&&settings.biggerText>def.max){settings.biggerText=def.max;}}
panel.appendChild(createControlButton(def));});const resetBtn=document.createElement("button");resetBtn.type="button";resetBtn.textContent="Reset All";resetBtn.addEventListener("click",async()=>{Object.keys(settings).forEach(key=>{settings[key]=defaultSettings[key];});applySettings();await saveSettings();});panel.appendChild(resetBtn);const saveBtn=document.createElement("button");saveBtn.type="button";saveBtn.textContent="Save Preset";saveBtn.addEventListener("click",savePreset);panel.appendChild(saveBtn);const toggleListBtn=document.createElement('button');toggleListBtn.type='button';toggleListBtn.className='preset-toggle-btn';toggleListBtn.textContent='Presets ▾';const listContainer=document.createElement('div');listContainer.className='preset-list';toggleListBtn.addEventListener('click',()=>{const open=listContainer.classList.toggle('open');toggleListBtn.textContent=open?'Presets ▲':'Presets ▾';});panel.appendChild(toggleListBtn);panel.appendChild(listContainer);renderPresetList();return panel;};const togglePanel=()=>{const isOpen=panel.classList.toggle("open");panel.setAttribute("aria-hidden",String(!isOpen));toggleBtn.setAttribute("aria-expanded",String(isOpen));if(isOpen){const firstButton=panel.querySelector("button");if(firstButton)firstButton.focus();}else{toggleBtn.focus();}};const addFocusTrap=()=>{panel.addEventListener("keydown",e=>{if(e.key!=="Tab"&&e.key!=="Escape")return;if(e.key==="Escape"){e.preventDefault();togglePanel();return;}
const focusable=panel.querySelectorAll("button, select");if(focusable.length===0)return;const first=focusable[0];const last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});};const buildToggle=()=>{const existing=document.getElementById('acc-toggle-btn');if(existing){toggleBtn=existing;return toggleBtn;}
toggleBtn=document.createElement("button");toggleBtn.id="acc-toggle-btn";toggleBtn.type="button";toggleBtn.textContent="Accessibility";toggleBtn.className="acc-toggle-btn";toggleBtn.setAttribute("aria-expanded","false");toggleBtn.setAttribute("aria-controls","acc-panel");toggleBtn.setAttribute("aria-label","Accessibility options");Object.assign(toggleBtn.style,{position:"fixed",bottom:"20px",right:"20px",zIndex:Z_INDEX.toggle,padding:"10px 15px",borderRadius:"6px",border:"none"});toggleBtn.addEventListener("click",togglePanel);return toggleBtn;};const observeBody=()=>{const observer=new MutationObserver(records=>{records.forEach(record=>{record.removedNodes.forEach(node=>{if(node.id==='acc-panel'||node.id==='acc-toggle-btn'){observer.disconnect();init();}});});});observer.observe(document.documentElement,{childList:true,subtree:true});const bodyObs=new MutationObserver(records=>{records.forEach(r=>{r.addedNodes.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE){const scale=settings.biggerText>0?settings.biggerText / baseFontSize:1;const applyTo=el=>{if(el.matches('#acc-panel, #acc-toggle-btn')||el.closest('#acc-panel'))return;if(!el.dataset.origFontSize){el.dataset.origFontSize=getComputedStyle(el).fontSize||'';}
const orig=parseFloat(el.dataset.origFontSize)||baseFontSize;el.style.fontSize=scale===1?'':`${orig * scale}px`;el.querySelectorAll('*').forEach(applyTo);};applyTo(n);}});});});bodyObs.observe(document.body,{childList:true,subtree:true});};const init=async()=>{if(document.getElementById("acc-panel"))return;await loadSettings();createStyle();wrapContent();const root=document.documentElement;root.appendChild(buildPanel());root.appendChild(buildToggle());addFocusTrap();await applySettings();observeBody();};init();})();                                