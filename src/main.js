import p5 from "p5";
import { GUIForP5, setGUI } from "./lib/gui";
import { createGUI } from "./create-gui";
// import { Vec2D } from "./lib/simple-vec2d"; // Use our simple version instead
import { Generator } from "./generator";
import { lang } from "./lang";

// Variables that need to be accessed across the sketch
let canvas;
let svgCanvas;
let canvWrapper;
let pw = 1,
  ph = 1;
let canvScale = 1;
let theShader;
let gui;
let generator;
let bodyFont, titleFont;
let isCapturingFrames = false;
// let mouse = new Vec2D();
let isPlaying = true;
let progress = 0;
let time = 0;
let ptime = -1 / 60;
let speed = 1;
let dtime;
let ffmpegWaiter = 0;
let SSIDHash;
let scrollScale = 1;
let SSID;
let K = 0;
let utilBools = [];
let FR, duration, nFrames;
let noiseOffs;

// Constants
const maxImgResIncrease = 0.25;
const doRunRealTime = false;
const doCaptureStartFromFrame0 = true;

const sketch = (p) => {
  // Make our real p5 instance available globally
  globalThis.p5Instance = p;

  // Expose commonly used properties (but don't override p5's width/height)
  globalThis.pw = pw;
  globalThis.ph = ph;
  globalThis.time = time;

  p.setup = function () {
    initUtils(10, 30);

    canvas =
      theShader === undefined
        ? p.createCanvas(1, 1)
        : p.createCanvas(1, 1, p.WEBGL);

    createCanvasWrapper(p);
    lang.setup("en");

    // Pass p5 instance to Generator
    generator = new Generator(p);

    setGUI(new GUIForP5(p));
    createGUI(generator);

    containCanvasInWrapper(p);
    generator.setup();

    if (window.location.hostname !== "localhost") {
      setTimeout(() => helpMe(p), 500);
    }
  };

  p.draw = function () {
    // Update global time
    time = p.millis() * 0.001;
    globalThis.time = time;

    // Update global dimensions (use our own variables, not p5's width/height)
    pw = p.width;
    ph = p.height;
    globalThis.pw = pw;
    globalThis.ph = ph;

    if (p.keyIsDown("-")) p.frameCount--;
    if (p.keyIsDown("=")) p.frameCount++;

    generator.draw();
    handleFrameCapture(p);
  };

  p.windowResized = function () {
    containCanvasInWrapper(p);
  };

  // Event handlers (if you want to enable them)
  p.keyPressed = function (e) {
    if (gui && gui.isTypingText) return;

    // Handle utility bools with keys 0-9
    if (p.keyCode >= 48 && p.keyCode <= 57) {
      let utilInd = p.keyCode - 48;
      utilBools[utilInd] = !utilBools[utilInd];
    }

    // Handle other keys
    switch (p.key) {
      case "ArrowUp":
        K++;
        p.print("K: " + K);
        break;
      case "ArrowDown":
        if (K <= 0) break;
        K--;
        p.print("K: " + K);
        break;
    }

    switch (p.key.toLowerCase()) {
      case " ":
        isPlaying = !isPlaying;
        break;
      case "h":
        helpMe(p);
        break;
      case "[":
        p.frameCount -= 100;
        break;
      case "]":
        p.frameCount += 100;
        break;
      case "s":
        if (Generator.getOutputFileName) {
          p.save(Generator.getOutputFileName() + ".png");
        } else {
          p.save("sketch.png");
        }
        break;
      case "f":
        let fs = p.fullscreen();
        p.fullscreen(!fs);
        break;
      case "b":
        if (gui) gui.toggleSide();
        break;
      case "m":
        if (gui) gui.toggleLightDarkMode();
        break;
    }
  };
};

// Helper functions (updated to work with p5 instance)
function createCanvasWrapper(p) {
  canvWrapper = p.createDiv();
  canvWrapper.id("canvas-workarea");
  canvas.parent(canvWrapper);
  if (svgCanvas) {
    canvWrapper.elt.append(svgCanvas.canvas.wrapper);
    svgCanvas.parent(canvWrapper);
  }
  document.querySelector("main").append(canvWrapper.elt);
}

function containCanvasInWrapper(p) {
  const canvAsp = pw / ph;
  const wrapperW = canvWrapper.elt.clientWidth;
  const wrapperH = canvWrapper.elt.clientHeight;
  const wrapperAsp = wrapperW / wrapperH;

  canvas.elt.style = "";
  if (canvAsp > wrapperAsp) {
    canvas.elt.style.height = "";
    canvas.elt.style.width = "100%";
  } else {
    canvas.elt.style.width = "";
    canvas.elt.style.height = "calc(100vh - 2rem)";
  }

  if (svgCanvas) {
    svgCanvas.canvas.wrapper.style = "";
    svgCanvas.canvas.svg.removeAttribute("width");
    svgCanvas.canvas.svg.removeAttribute("height");
    svgCanvas.canvas.svg.style.width = pw;
    svgCanvas.canvas.svg.style.height = ph;
  }

  canvScale = p.sqrt((pw * ph) / (1920 * 1080));
}

function handleFrameCapture(p) {
  if (isCapturingFrames && gui) {
    // You'll need to adapt this to your specific capture setup
    // const vidButton = gui.getController(
    //   "buttonVidCapture" + ffmpegExportSettings.ext.toUpperCase()
    // ).controllerElement;
    // ... rest of capture logic
  }
}

function helpMe(p) {
  // Implement your help dialog here
  if (lang && lang.process) {
    // dialog.alert(lang.process(`LANG_HELPME_MSG`, true));
    console.log("Help dialog would appear here");
  }
}

function initUtils(_duration, _frameRate) {
  console.log("p5Catalyst initiated as " + Generator.name);
  console.log(
    "Visit the project: https://github.com/multitude-amsterdam/p5Catalyst"
  );

  // SSID-based seed initialization
  SSID = generateSSID();
  SSIDHash = SSID / 1e8;

  // Use the p5 instance for random/noise seeds
  if (globalThis.p5Instance) {
    globalThis.p5Instance.randomSeed(SSID);
    globalThis.p5Instance.noiseSeed(SSID);
  }

  noiseOffs = SSIDHash * 1000;

  // Set framerate using p5 instance
  if (globalThis.p5Instance) {
    globalThis.p5Instance.frameRate(30);
  }

  document.title = Generator.name;

  for (let i = 0; i < 10; i++) utilBools.push(false);
}

function generateSSID() {
  return Math.floor(Math.random() * 1e8);
}

// Export resize function for external use
export function resize(w, h) {
  if (w == pw && h == ph) return;
  if (w < 1 || h < 1) return;

  pw = w;
  ph = h;
  globalThis.pw = pw;
  globalThis.ph = ph;

  const p = globalThis.p5Instance;
  if (p) {
    p.print(`Resizing to: ${w} x ${h}...`);
    p.pixelDensity(1);
    p.resizeCanvas(pw, ph);

    if (svgCanvas) {
      svgCanvas.pixelDensity(1);
      svgCanvas.resizeCanvas(pw, ph);
    }

    containCanvasInWrapper(p);
    containCanvasInWrapper(p); // needs a double call
  }
}

// Create the p5 instance
new p5(sketch);
