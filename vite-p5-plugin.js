// vite-p5-plugin.js
export function p5GlobalsPlugin(options = {}) {
  const {
    instanceName = "this.p",
    filePattern = /generator\.js$/,
    debug = false,
  } = options;

  // Comprehensive list of p5.js methods and properties
  const p5Methods = [
    // Drawing
    "background",
    "fill",
    "noFill",
    "stroke",
    "noStroke",
    "strokeWeight",
    "strokeCap",
    "strokeJoin",
    "smooth",
    "noSmooth",
    "rectMode",
    "ellipseMode",
    "imageMode",
    "blendMode",
    "colorMode",

    // Shapes
    "point",
    "line",
    "rect",
    "square",
    "circle",
    "ellipse",
    "arc",
    "triangle",
    "quad",
    "beginShape",
    "endShape",
    "vertex",
    "curveVertex",
    "bezierVertex",
    "quadraticVertex",

    // Typography
    "text",
    "textAlign",
    "textSize",
    "textFont",
    "textWidth",
    "textAscent",
    "textDescent",
    "textLeading",
    "textStyle",
    "textWrap",

    // Transforms
    "push",
    "pop",
    "translate",
    "rotate",
    "scale",
    "shearX",
    "shearY",
    "resetMatrix",
    "applyMatrix",
    "printMatrix",

    // Math
    "abs",
    "ceil",
    "constrain",
    "dist",
    "exp",
    "floor",
    "lerp",
    "log",
    "mag",
    "map",
    "max",
    "min",
    "norm",
    "pow",
    "round",
    "sq",
    "sqrt",
    "fract",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "atan2",
    "degrees",
    "radians",
    "noise",
    "noiseDetail",
    "noiseSeed",
    "random",
    "randomSeed",
    "randomGaussian",

    // Color
    "color",
    "alpha",
    "blue",
    "brightness",
    "green",
    "hue",
    "lerpColor",
    "lightness",
    "red",
    "saturation",

    // Image
    "createImage",
    "saveCanvas",
    "saveFrames",
    "loadImage",
    "image",
    "tint",
    "noTint",
    "imageMode",
    "pixels",
    "blend",
    "copy",
    "filter",
    "get",
    "loadPixels",
    "set",
    "updatePixels",

    // Input
    "keyPressed",
    "keyReleased",
    "keyTyped",
    "mousePressed",
    "mouseReleased",
    "mouseClicked",
    "mouseDragged",
    "mouseMoved",
    "mouseWheel",
    "touchStarted",
    "touchMoved",
    "touchEnded",

    // Time
    "millis",
    "second",
    "minute",
    "hour",
    "day",
    "month",
    "year",

    // Utilities
    "print",
    "println",
    "cursor",
    "noCursor",
    "fullscreen",
    "pixelDensity",
    "displayDensity",
    "getURL",
    "getURLPath",
    "getURLParams",

    // Canvas
    "createCanvas",
    "resizeCanvas",
    "noCanvas",
    "createGraphics",
    "blendMode",

    // 3D (WEBGL)
    "plane",
    "box",
    "sphere",
    "cylinder",
    "cone",
    "ellipsoid",
    "torus",
    "camera",
    "perspective",
    "ortho",
    "frustum",
    "createCamera",
    "setCamera",
    "ambientLight",
    "directionalLight",
    "pointLight",
    "lights",
    "noLights",
    "ambientMaterial",
    "emissiveMaterial",
    "specularMaterial",
    "shininess",
    "texture",
    "textureMode",
    "textureWrap",
    "normalMaterial",
    "shader",
    "resetShader",
    "createShader",
    "loadShader",
    "save",
  ];

  const p5Properties = [
    "width",
    "height",
    "pixelDensity",
    "displayWidth",
    "displayHeight",
    "windowWidth",
    "windowHeight",
    "mouseX",
    "mouseY",
    "pmouseX",
    "pmouseY",
    "mouseIsPressed",
    "mouseButton",
    "keyIsPressed",
    "key",
    "keyCode",
    "keyIsDown",
    "frameCount",
    "frameRate",
    "focused",
    "cursor",
    "pixels",
    "drawingContext",
  ];

  const p5Constants = [
    // Blend modes
    "BLEND",
    "DARKEST",
    "LIGHTEST",
    "DIFFERENCE",
    "MULTIPLY",
    "EXCLUSION",
    "SCREEN",
    "REPLACE",
    "OVERLAY",
    "HARD_LIGHT",
    "SOFT_LIGHT",
    "DODGE",
    "BURN",
    "ADD",
    "NORMAL",

    // Color modes
    "RGB",
    "HSB",
    "HSL",

    // Shape modes
    "CORNER",
    "CORNERS",
    "RADIUS",
    "CENTER",

    // Text align
    "LEFT",
    "RIGHT",
    "CENTER",
    "TOP",
    "BOTTOM",
    "BASELINE",

    // Key codes
    "BACKSPACE",
    "DELETE",
    "ENTER",
    "RETURN",
    "TAB",
    "ESCAPE",
    "SHIFT",
    "CONTROL",
    "OPTION",
    "ALT",
    "UP_ARROW",
    "DOWN_ARROW",
    "LEFT_ARROW",
    "RIGHT_ARROW",

    // Mouse buttons
    "LEFT",
    "RIGHT",
    "CENTER",

    // 3D
    "WEBGL",
    "P2D",
    "P3D",

    // Shapes
    "POINTS",
    "LINES",
    "TRIANGLES",
    "TRIANGLE_FAN",
    "TRIANGLE_STRIP",
    "QUADS",
    "QUAD_STRIP",
    "CLOSE",
    "OPEN",

    // Angles
    "RADIANS",
    "DEGREES",

    // Filters
    "THRESHOLD",
    "GRAY",
    "OPAQUE",
    "INVERT",
    "POSTERIZE",
    "BLUR",
    "ERODE",
    "DILATE",
  ];

  const allP5Identifiers = new Set([
    ...p5Methods,
    ...p5Properties,
    ...p5Constants,
  ]);

  function transformCode(code, id) {
    if (debug) {
      console.log(`[p5-globals] Transforming: ${id}`);
    }

    // Split code into lines to process line by line
    const lines = code.split("\n");
    const transformedLines = lines.map((line) => {
      // Skip import/export lines entirely
      if (
        line.trim().startsWith("import ") ||
        line.trim().startsWith("export ") ||
        line.includes(" from ") ||
        line.includes("//")
      ) {
        return line;
      }

      let transformedLine = line;
      const instancePrefix = instanceName + ".";

      // Transform each identifier individually on this line
      allP5Identifiers.forEach((identifier) => {
        const regex = new RegExp(`\\b${identifier}\\b`, "g");

        transformedLine = transformedLine.replace(regex, (match, offset) => {
          // Get context around the match within this line
          const before = transformedLine.substring(
            Math.max(0, offset - 20),
            offset
          );
          const after = transformedLine.substring(
            offset + match.length,
            offset + match.length + 10
          );

          // Don't transform if already prefixed
          if (before.endsWith(instancePrefix)) {
            return match;
          }

          // Don't transform if it's a property definition (followed by : or =)
          if (after.match(/^\s*[:=]/)) {
            return match;
          }

          // Don't transform if it's a class or function declaration
          if (before.match(/(class|function)\s+$/)) {
            return match;
          }

          // Transform the match
          return `${instanceName}.${identifier}`;
        });
      });

      return transformedLine;
    });

    const transformedCode = transformedLines.join("\n");

    if (debug && transformedCode !== code) {
      console.log(`[p5-globals] Transformed ${id}`);
    }

    return transformedCode;
  }

  return {
    name: "p5-globals-transform",
    transform(code, id) {
      // Only transform files that match the pattern
      if (filePattern.test(id)) {
        const transformedCode = transformCode(code, id);

        return {
          code: transformedCode,
          map: null, // You could generate source maps here if needed
        };
      }
    },
  };
}

// Example usage configurations
export const presetConfigs = {
  // For generator files
  generator: {
    instanceName: "this.p",
    filePattern: /generator\.js$/,
    debug: false,
  },

  // For sketch files
  sketch: {
    instanceName: "p",
    filePattern: /sketch\.js$/,
    debug: false,
  },

  // For any p5 files
  all: {
    instanceName: "this.p",
    filePattern: /\.(js|ts)$/,
    debug: false,
  },
};

export default p5GlobalsPlugin;
