// Get the global p5 instance - this should be set in main.js
function getP5() {
  if (!globalThis.p5Instance) {
    throw new Error(
      "p5 instance not available. Make sure it's set in globalThis.p5Instance"
    );
  }
  return globalThis.p5Instance;
}

// ---------------------- RESTORING SERIALISED OBJS -----------------------

export function restoreSerializedP5Color(obj) {
  if (!(obj.levels && obj.mode)) return obj;
  const p = getP5();
  p.push();
  p.colorMode(p.RGB);
  const col = p.color(obj.levels);
  p.pop();
  return col;
}

// export function restoreSerializedVec3D(obj) {
//   // always use before Vec2D version when used in combination
//   if ([obj.x, obj.y, obj.z].some((v) => v === undefined)) return obj;
//   return new Vec3D(obj.x, obj.y, obj.z);
// }

// export function restoreSerializedVec2D(obj) {
//   if ([obj.x, obj.y].some((v) => v === undefined)) return obj;
//   return new Vec2D(obj.x, obj.y);
// }

// ----------------------------- DRAWING ------------------------------

export function pushpop() {
  const p = getP5();

  // pushpop(pg, () => { ... })
  if (arguments.length == 2) {
    const pg = arguments[0];
    const func = arguments[1];
    pg.push();
    func();
    pg.pop();
    return;
  }
  // pushpop(() => { ... })
  if (arguments.length == 1) {
    const func = arguments[0];
    p.push();
    func();
    p.pop();
    return;
  }
}

export function toxiFillet(filletStart, filletEnd, cen) {
  const cpts = bezierFilletControlPoints(filletStart, filletEnd, cen);
  toxiBezierVertex(cpts[0], cpts[1], filletEnd);
}

export function bezierFilletControlPoints(filletStart, filletEnd, cen) {
  const p = getP5();
  let a = filletStart.sub(cen);
  let b = filletEnd.sub(cen);
  let q1 = a.dot(a);
  let q2 = q1 + a.dot(b);
  let k2 = ((4 / 3) * (p.sqrt(2 * q1 * q2) - q2)) / (a.x * b.y - a.y * b.x);

  let x2 = cen.x + a.x - k2 * a.y;
  let y2 = cen.y + a.y + k2 * a.x;
  let x3 = cen.x + b.x + k2 * b.y;
  let y3 = cen.y + b.y - k2 * b.x;
  return [new Vec2D(x2, y2), new Vec2D(x3, y3)];
}

export function intersectionPoint(lineA, lineB) {
  let res = lineA.intersectLine(lineB);
  return res.pos;
}

export function toxiBezierVertex(cp1, cp2, p2) {
  const p = getP5();
  p.bezierVertex(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
}

export function toxiVertex(v) {
  const p = getP5();
  p.vertex(...vectorComponents(v));
}

export function vectorComponents(v) {
  return Object.values({ ...v });
}

export function imageCentered(img, doFill) {
  const p = getP5();
  p.image(
    img,
    0,
    0,
    p.width,
    p.height,
    0,
    0,
    img.width,
    img.height,
    doFill ? p.COVER : p.CONTAIN
  );
}

export function imageCenteredXYScale(
  img,
  doFill,
  posX = 0,
  posY = 0,
  sc = 1,
  doFlipHorizontal = false
) {
  const p = getP5();
  p.push();
  {
    p.resetMatrix();
    if (globalThis.theShader !== undefined)
      p.translate(-p.width / 2, -p.height / 2);
    p.imageMode(p.CENTER);

    const am = p.width / p.height;
    const aimg = img.width / img.height;
    const doFitVertical = (am > aimg) ^ doFill;

    let imgFitW = doFitVertical ? p.height * aimg : p.width;
    let imgFitH = doFitVertical ? p.height : p.width / aimg;

    p.translate(p.width * 0.5, p.height * 0.5);

    let renderW = imgFitW * sc;
    let renderH = imgFitH * sc;
    let dx = (-posX * (renderW - p.width)) / 2;
    let dy = (-posY * (renderH - p.height)) / 2;
    p.translate(dx, dy);

    p.scale(sc);

    if (doFlipHorizontal) p.scale(-1, 1);

    p.image(img, 0, 0, imgFitW, imgFitH);
  }
  p.pop();
}

export function pgImageCenteredXYScale(
  pg,
  img,
  doFill,
  posX = 0,
  posY = 0,
  sc = 1,
  doFlipHorizontal = false
) {
  const p = getP5();
  pg.push();
  {
    pg.resetMatrix();
    if (globalThis.theShader !== undefined)
      pg.translate(-p.width / 2, -p.height / 2);
    pg.imageMode(pg.CENTER);

    const am = pg.width / pg.height;
    const aimg = img.width / img.height;
    const doFitVertical = (am > aimg) ^ doFill;

    let imgFitW = doFitVertical ? pg.height * aimg : pg.width;
    let imgFitH = doFitVertical ? pg.height : pg.width / aimg;

    pg.translate(p.width * 0.5, p.height * 0.5);

    let renderW = imgFitW * sc;
    let renderH = imgFitH * sc;
    let dx = (-posX * (renderW - pg.width)) / 2;
    let dy = (-posY * (renderH - pg.height)) / 2;
    pg.translate(dx, dy);

    pg.scale(sc);

    if (doFlipHorizontal) pg.scale(-1, 1);

    pg.image(img, 0, 0, imgFitW, imgFitH);
  }
  pg.pop();
}

export function getMouseMappedToCenteredPg(pg, doFill) {
  const p = getP5();
  // main aspect ratio, pg aspect ratio
  let am = p.width / p.height,
    apg = pg.width / pg.height;

  // pg is fitted to screen height
  let isPgFitVertical = am > apg;

  let pgSc = isPgFitVertical ? p.height / pg.height : p.width / pg.width;

  let pgMouse = isPgFitVertical
    ? new Vec2D(
        p.map(
          (p.mouseX - p.width / 2) / ((pg.width * pgSc) / 2),
          -1,
          1,
          0,
          pg.width
        ),
        p.map(p.mouseY, 0, p.height, 0, pg.height)
      )
    : new Vec2D(
        p.map(p.mouseX, 0, p.width, 0, pg.width),
        p.map(
          (p.mouseY - p.height / 2) / ((pg.height * pgSc) / 2),
          -1,
          1,
          0,
          pg.height
        )
      );
  return pgMouse;
}

// ----------------------------- COLOURS ------------------------------

export function randCol() {
  const p = getP5();
  return p.color(p.random(255), p.random(255), p.random(255));
}

export function lum(col) {
  const p = getP5();
  if (!col.levels) col = p.color(col);
  return (
    (0.2125 * col.levels[0]) / 255 +
    (0.7154 * col.levels[1]) / 255 +
    (0.0721 * col.levels[2]) / 255
  );
}

export function v(col) {
  const p = getP5();
  if (!col.levels) col = p.color(col);
  return (col.levels[0] + col.levels[1] + col.levels[2]) / 3;
}

export function colorToHexString(col, doAlpha = false) {
  let levels = col.levels;
  if (!doAlpha) levels = levels.slice(0, 3);
  return "#" + levels.map((l) => l.toString(16).padStart(2, "0")).join("");
}

export function lerpColorOKLab(col1, col2, t) {
  const p = getP5();

  // OKLab colour interpolation
  // more info: https://bottosson.github.io/posts/oklab/
  const srgbToLinear = (x) => {
    return x <= 0.04045 ? x / 12.92 : p.pow((x + 0.055) / 1.055, 2.4);
  };
  const linearToSrgb = (x) => {
    return x <= 0.0031308 ? x * 12.92 : 1.055 * p.pow(x, 1 / 2.4) - 0.055;
  };

  function rgbToOKLab(r, g, b) {
    r = srgbToLinear(r);
    g = srgbToLinear(g);
    b = srgbToLinear(b);

    // RGB to LMS
    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    let l_ = Math.cbrt(l);
    let m_ = Math.cbrt(m);
    let s_ = Math.cbrt(s);

    // LMS to OKLab
    return {
      L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
      A: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
      B: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
    };
  }

  function oklabToRGB(L, A, B) {
    let l_ = L + 0.3963377774 * A + 0.2158037573 * B;
    let m_ = L - 0.1055613458 * A - 0.0638541728 * B;
    let s_ = L - 0.0894841775 * A - 1.291485548 * B;

    l_ = l_ ** 3;
    m_ = m_ ** 3;
    s_ = s_ ** 3;

    let r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
    let g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
    let b = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

    r = linearToSrgb(r);
    g = linearToSrgb(g);
    b = linearToSrgb(b);

    let col;
    // preserve current main color mode
    p.push();
    {
      p.colorMode(p.RGB);
      col = p.color(
        p.constrain(r * 255, 0, 255),
        p.constrain(g * 255, 0, 255),
        p.constrain(b * 255, 0, 255)
      );
    }
    p.pop();
    return col;
  }

  // p5.Color._array is [r, g, b, a] in range [0,1]
  const lab1 = rgbToOKLab(...col1._array.slice(0, 3));
  const lab2 = rgbToOKLab(...col2._array.slice(0, 3));

  const L = p.lerp(lab1.L, lab2.L, t);
  const A = p.lerp(lab1.A, lab2.A, t);
  const B = p.lerp(lab1.B, lab2.B, t);

  p.colorMode(p.RGB);
  return oklabToRGB(L, A, B);
}

// ----------------------------- TIME ------------------------------

export function setDuration(_duration) {
  const FR = globalThis.FR;
  globalThis.nFrames = parseInt(_duration * FR);
  globalThis.duration = globalThis.nFrames / parseFloat(FR); // seconds
}

export function setTime() {
  const p = getP5();
  if (!globalThis.isPlaying) globalThis.frameCount--;

  globalThis.ptime = globalThis.time;

  if (globalThis.doRunRealTime) {
    globalThis.time = (p.millis() / 1000) * globalThis.speed;
    globalThis.progress =
      globalThis.time / globalThis.speed / globalThis.nFrames;
  } else {
    globalThis.progress =
      (globalThis.isCapturingFrames && globalThis.doCaptureStartFromFrame0
        ? globalThis.savedFrameCount
        : p.frameCount) / globalThis.nFrames;
    globalThis.time =
      globalThis.progress * globalThis.duration * globalThis.speed;
  }

  globalThis.dtime = globalThis.time - globalThis.ptime;
}

export function getUNIX() {
  return Math.floor(new Date().getTime() / 1000);
}

export function getTimestamp() {
  return toB64(new Date().getTime());
}

export function randomDate(date1, date2) {
  function randomValueBetween(min, max) {
    return Math.random() * (max - min) + min;
  }
  let d1 = date1 || "01-01-1970";
  let d2 = date2 || new Date().toLocaleDateString();
  d1 = new Date(d1).getTime();
  d2 = new Date(d2).getTime();
  if (d1 > d2) {
    return new Date(randomValueBetween(d2, d1));
  } else {
    return new Date(randomValueBetween(d1, d2));
  }
}

// ----------------------------- STRINGS UTIL ------------------------------

export function capitalizeFirstLetter(inputString) {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

// ----------------------------- MEMORY ------------------------------

export function computeRoughSizeOfObject(object) {
  const objectList = [];
  const stack = [object];
  let bytes = 0;
  while (stack.length) {
    const value = stack.pop();

    switch (typeof value) {
      case "boolean":
        bytes += 4;
        break;
      case "string":
        bytes += value.length * 2;
        break;
      case "number":
        bytes += 8;
        break;
      case "object":
        if (!objectList.includes(value)) {
          objectList.push(value);
          for (const prop in value) {
            if (value.hasOwnProperty(prop)) {
              stack.push(value[prop]);
            }
          }
        }
        break;
    }
  }
  return bytes;
}

// ----------------------------- SYSTEM ------------------------------

export function isMac() {
  return window.navigator.platform.toLowerCase().indexOf("mac") > -1;
}

export function getWheelDistance(evt) {
  if (!evt) evt = event;
  let w = evt.wheelDelta,
    d = evt.detail;
  if (d) {
    if (w) return (w / d / 40) * d > 0 ? 1 : -1;
    // Opera
    else return -d / 3; // Firefox;         TODO: do not /3 for OS X
  } else return w / 120; // IE/Safari/Chrome TODO: /3 for Chrome OS X
}

// ----------------------------- DATA/IO ------------------------------

export function isArraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function copyCanvasToClipboard() {
  const canvas = globalThis.canvas;
  canvas.elt.toBlob((blob) => {
    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  });
}

const b64Digits =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
const toB64 = (n) =>
  n
    .toString(2)
    .split(/(?=(?:.{6})+(?!.))/g)
    .map((v) => b64Digits[parseInt(v, 2)])
    .join("");
const fromB64 = (s64) =>
  s64.split("").reduce((s, v) => s * 64 + b64Digits.indexOf(v), 0);

export { toB64, fromB64 };
