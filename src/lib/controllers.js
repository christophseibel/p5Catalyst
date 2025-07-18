import { Field, Label } from "./gui";
import { lang } from "../lang";
// import { resize } from "../main";
import * as util from "./util";

export class Controller extends Field {
  static _doUpdateChangeSet = true;
  _doUpdateChangeSet = true;

  controllerElement = null;
  doRandomize = undefined;

  constructor(gui, name, labelStr, setupCallback = undefined) {
    super(gui.div, name, "gui-controller", gui.p); // Pass p5 instance to Field
    this.gui = gui;
    this.p = gui.p; // Store p5 instance for easy access
    this.name = name;

    if (labelStr !== undefined) {
      labelStr = lang.process(labelStr, true);
      this.label = new Label(this.div, labelStr, this.p);
    }

    this.controllerWrapper = this.p.createDiv();
    this.controllerWrapper.class("controller-wrapper");
    this.controllerWrapper.parent(this.div);

    this.setupCallback = setupCallback || ((controller) => {});
  }

  setup() {
    this.createConsole();
    this.setupCallback(this);
  }

  disable() {
    if (this.controllerElement instanceof p5.Element)
      this.controllerElement.elt.disabled = true;
    else this.controllerElement.disabled = true;
  }

  enable() {
    if (this.controllerElement instanceof p5.Element)
      this.controllerElement.elt.disabled = false;
    else this.controllerElement.disabled = false;
  }

  isDisabled() {
    if (this.controllerElement instanceof p5.Element)
      return this.controllerElement.elt.disabled;
    else return this.controllerElement.disabled;
  }

  setDisabled(doSetDisabled) {
    doSetDisabled ? this.disable() : this.enable();
  }

  createConsole() {
    this.console = this.p.createDiv();
    this.console.parent(this.div);
    this.console.class("gui-console");
    this.console.hide();
  }

  setConsole(text, type) {
    if (text === undefined) {
      this.consoleText = undefined;
      this.console.hide();
      this.console.html("");
      this.console.class("gui-console");
      return;
    }

    if (type === undefined) text = "🔺 " + text;

    this.consoleText = text;
    this.console.class("gui-console");
    this.console.addClass("gui-console-" + type);
    this.console.html(text);
    this.console.show();
  }

  setError(text) {
    this.setConsole("❌ " + text, "error");
  }

  setWarning(text) {
    this.setConsole("⚠️ " + text, "warning");
  }

  addToRandomizer(randomizer) {
    randomizer.addController(this);
  }

  addDie(die) {
    die.img.parent(this.controllerWrapper);
    this.die = die;
  }

  //   doUpdateChangeSet() {
  //     return (
  //       changeSet !== undefined &&
  //       this._doUpdateChangeSet &&
  //       Controller._doUpdateChangeSet
  //     );
  //   }
}

export class ValuedController extends Controller {
  constructor(gui, name, labelStr, setupCallback = undefined) {
    super(gui, name, labelStr, setupCallback);
  }

  setValue(value) {
    this.value = value;
    // if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {
    console.error("No randomize() method.");
  }

  getValueForJSON() {
    return this.value;
  }
}

export class Button extends Controller {
  constructor(gui, name, labelStr, callback, setupCallback = undefined) {
    super(gui, name, undefined, setupCallback);
    labelStr = lang.process(labelStr, true);
    this.controllerElement = this.p.createButton(labelStr);
    this.controllerElement.parent(this.controllerWrapper);
    this.controllerElement.elt.onclick = () => {
      callback(this);
      if (this.doUpdateChangeSet()) changeSet.save();
    };
  }

  click() {
    this.controllerElement.elt.onclick();
  }
}

export class FileLoader extends Button {
  constructor(
    gui,
    name,
    fileType,
    labelStr,
    fileReadyCallback,
    valueCallback,
    setupCallback = undefined
  ) {
    super(
      gui,
      name,
      labelStr,
      () => {
        this.controllerElement.elt.click();
      },
      setupCallback
    );
    this.fileType = fileType;

    this.callback = (value) => {
      valueCallback(this, value);
    };

    this.controllerElement = this.p.createFileInput((file) => {
      this.file = file;
      this.fileName = file.file.name;
      fileReadyCallback(file);
      this.callback(this.file);
    });
    this.controllerElement.parent(this.controllerWrapper);
    this.controllerElement.hide();
  }
}

export class TextFileLoader extends FileLoader {
  constructor(gui, name, labelStr, valueCallback, setupCallback = undefined) {
    super(
      gui,
      name,
      "text",
      labelStr,
      (file) => {},
      valueCallback,
      setupCallback
    );
    this.controllerElement.elt.accept = ".txt";
  }
}

export class JSONFileLoader extends FileLoader {
  constructor(gui, name, labelStr, valueCallback, setupCallback = undefined) {
    super(
      gui,
      name,
      "json",
      labelStr,
      (file) => {},
      valueCallback,
      setupCallback
    );
    this.controllerElement.elt.accept = ".json";
  }
}

export class ImageLoader extends FileLoader {
  constructor(gui, name, labelStr, valueCallback, setupCallback = undefined) {
    super(
      gui,
      name,
      "image",
      labelStr,
      (file) => {
        this.img = this.p.createImg(file.data, "");
        this.img.hide();
        this.file = this.img;
      },
      valueCallback,
      setupCallback
    );
    this.controllerElement.elt.accept = ".jpg,.png,.gif,.tif";
  }
}

export class Toggle extends ValuedController {
  constructor(
    gui,
    name,
    labelStr0,
    labelStr1,
    isToggled,
    callback,
    setupCallback = undefined
  ) {
    super(gui, name, undefined, setupCallback);
    this.controllerElement = this.p.createButton("");
    this.controllerElement.parent(this.controllerWrapper);
    this.controllerElement.class("toggle");
    this.controllerElement.elt.onmousedown = () => callback(this);

    labelStr0 = lang.process(labelStr0, true);
    labelStr1 = lang.process(labelStr1, true);
    const span0 = this.p.createSpan(labelStr0);
    const span1 = this.p.createSpan(labelStr1);
    span0.parent(this.controllerElement);
    span1.parent(this.controllerElement);

    this.value = isToggled ? true : false;

    this.controllerElement.elt.onmousedown = () => {
      this.setValue(!this.value);
    };
    this.callback = callback;
  }

  click() {
    this.controllerElement.elt.onmousedown();
  }

  setValue(value) {
    if (value != this.value)
      this.controllerElement.elt.toggleAttribute("toggled");
    this.value = value;
    this.callback(this, this.value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {
    this.setValue(this.p.random(1) < 0.5);
  }
}

export class Select extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    options,
    defaultIndex,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);

    this.controllerElement = this.p.createSelect();
    this.setOptions(options);

    const callback = (event) => {
      console.log("Select changed!", event);
      const valueStr = event.srcElement.value;
      const ind = this.optionStrs.indexOf(valueStr);
      this.value = this.options[ind];
      valueCallback(this, this.value);
    };
    this.controllerElement.elt.onchange = callback;
    this.valueCallback = valueCallback;
    this.setValue(options[defaultIndex]);
  }

  setOptions(options) {
    this.controllerElement.elt.replaceChildren();
    this.controllerElement.parent(this.controllerWrapper);
    this.options = options;
    this.optionStrs = options.map((option) => this.optionToString(option));
    for (const optionStr of this.optionStrs)
      this.controllerElement.option(optionStr);
    this.afterSetOptions();
  }

  optionToString(option) {
    return option.toString();
  }

  afterSetOptions() {}

  hasOption(option) {
    return this.options.some((o) => o == option);
  }
  hasOptionStr(optionStr) {
    return this.optionStrs.some((os) => os == optionStr);
  }

  setValue(option) {
    if (!this.hasOption(option)) {
      throw new Error(option + " was not found in options.");
    }
    this.value = option;
    const optStr = this.optionStrs[this.options.indexOf(option)];
    this.controllerElement.selected(optStr);
    this.valueCallback(this, option);
    // if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {
    this.setValue(this.p.random(this.options));
  }
}

export class ResolutionSelect extends Select {
  constructor(
    gui,
    labelStr,
    resOptions,
    defaultIndex,
    valueCallback,
    setupCallback = undefined
  ) {
    super(
      gui,
      "resolutionSelect",
      labelStr,
      resOptions.map((s) => lang.process(s, true)),
      defaultIndex,
      (controller, value) => {
        if (value.indexOf(" x ") >= 0) {
          const resStr = value.split(": ")[1];
          const wh = resStr.split(" x ");
          const w = parseInt(wh[0]);
          const h = parseInt(wh[1]);
          resize(w, h);
        }
        valueCallback(controller, value);
      },
      setupCallback
    );
  }
}

export class Slider extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    minVal,
    maxVal,
    defaultVal,
    stepSize,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);
    this.controllerElement = this.p.createSlider(
      minVal,
      maxVal,
      defaultVal,
      stepSize
    );
    this.controllerElement.parent(this.controllerWrapper);
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.defaultVal = defaultVal;
    this.stepSize = stepSize;

    const callback = (event) => {
      const value = parseFloat(event.srcElement.value);
      valueCallback(this, value);
    };
    this.controllerElement.elt.onchange = callback;
    this.controllerElement.elt.oninput = callback;
    valueCallback(this, defaultVal);
    this.valueCallback = valueCallback;
  }

  setValue(value) {
    this.value = value;
    this.valueCallback(this, value);
    this.controllerElement.value(value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {
    this.setValue(this.p.random(this.minVal, this.maxVal));
  }
}

export class RangeSlider extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    minVal,
    maxVal,
    defaultValMin,
    defaultValMax,
    stepSize,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);
    this.controllerElement = this.p
      .createDiv()
      .class("dual-range-input")
      .parent(this.controllerWrapper);
    this.minSlider = this.p
      .createSlider(minVal, maxVal, defaultValMin, stepSize)
      .parent(this.controllerElement);
    this.maxSlider = this.p
      .createSlider(minVal, maxVal, defaultValMax, stepSize)
      .parent(this.controllerElement);
    new DualRangeInput(this.minSlider.elt, this.maxSlider.elt);

    this.minVal = minVal;
    this.maxVal = maxVal;
    this.defaultValMin = defaultValMin;
    this.defaultValMax = defaultValMax;
    this.stepSize = stepSize;

    const callback = (event) => {
      const minValue = parseFloat(this.minSlider.elt.value);
      const maxValue = parseFloat(this.maxSlider.elt.value);
      valueCallback(this, { min: minValue, max: maxValue });
    };

    this.minSlider.elt.onchange = callback;
    this.minSlider.elt.oninput = callback;
    this.maxSlider.elt.onchange = callback;
    this.maxSlider.elt.oninput = callback;
    this.valueCallback = valueCallback;
  }

  setValue(value) {
    this.value = value;
    this.valueCallback(this, value);
    this.minSlider.value(value.min);
    this.maxSlider.value(value.max);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {
    const pivot = this.p.random(this.minVal, this.maxVal);
    this.setValue({
      min: this.p.random(this.minVal, pivot),
      max: this.p.random(pivot, this.maxVal),
    });
  }
}

class XYSlider extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    minValX,
    maxValX,
    defaultValX,
    stepSizeX,
    minValY,
    maxValY,
    defaultValY,
    stepSizeY,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);
    this.minValX = minValX;
    this.minValY = minValY;
    this.maxValX = maxValX;
    this.maxValY = maxValY;
    this.defaultValX = defaultValX;
    this.defaultValY = defaultValY;
    this.stepSizeX = stepSizeX;
    this.stepSizeY = stepSizeY;
    this.valueCallback = valueCallback;

    this.controllerElement = this.p.createDiv();
    this.controllerElement.class("xyslider");
    this.controllerElement.parent(this.controllerWrapper);
    const handle = this.p.createDiv();
    handle.class("handle");
    handle.parent(this.controllerElement);
    this.handle = handle;

    this.isDragging = false;
    this.controllerElement.elt.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this._doUpdateChangeSet = false;
    });
    handle.elt.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this._doUpdateChangeSet = false;
    });
    handle.elt.addEventListener("mouseup", (e) => {
      this.isDragging = false;
      this._doUpdateChangeSet = true;
      this.setValue(this.getValueFromHandlePosition(e));
    });
    document.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.setValue(this.getValueFromHandlePosition(e));
    });

    this.setValue({ x: this.defaultValX, y: this.defaultValY });
  }

  getValueFromHandlePosition(mouseEvent) {
    const compStyle = window.getComputedStyle(this.controllerElement.elt);
    const borderW = parseFloat(compStyle.borderWidth);

    const rect = this.controllerElement.elt.getBoundingClientRect();
    rect.width -= borderW * 2;
    rect.height -= borderW * 2;

    let x = mouseEvent.clientX - rect.left - this.handle.elt.offsetWidth / 2;
    let y = mouseEvent.clientY - rect.top - this.handle.elt.offsetHeight / 2;

    const handleW = this.handle.elt.offsetWidth;
    const handleH = this.handle.elt.offsetHeight;
    x = this.p.constrain(x, -handleW / 2, rect.width - handleW / 2);
    y = this.p.constrain(y, -handleH / 2, rect.height - handleH / 2);

    let normX = this.p.map(x, -handleW / 2, rect.width - handleW / 2, -1, 1);
    let normY = this.p.map(y, -handleH / 2, rect.height - handleH / 2, -1, 1);

    return this.mapSteppedFromNormedVec({ x: normX, y: normY });
  }

  mapSteppedFromNormedVec(normedVec) {
    // snap to axes
    if (this.p.abs(normedVec.x) < 0.033) normedVec.x = 0;
    if (this.p.abs(normedVec.y) < 0.033) normedVec.y = 0;

    const nStepsX = this.p.round(
      (this.maxValX - this.minValX) / this.stepSizeX
    );
    const nStepsY = this.p.round(
      (this.maxValY - this.minValY) / this.stepSizeY
    );
    return {
      x:
        this.minValX +
        (this.p.round((normedVec.x * 0.5 + 0.5) * nStepsX) / nStepsX) *
          (this.maxValX - this.minValX),
      y:
        this.minValY +
        (this.p.round((normedVec.y * 0.5 + 0.5) * nStepsY) / nStepsY) *
          (this.maxValY - this.minValY),
    };
  }

  setValue(vec) {
    if (vec.x === undefined || vec.y === undefined) {
      console.error("Value must be a vector {x: X, y: Y}, not this: ", vec);
      return;
    }
    this.value = vec;
    this.setDisplay();
    this.valueCallback(this, this.value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  setDisplay() {
    const compStyle = window.getComputedStyle(this.controllerElement.elt);
    const borderW = parseFloat(compStyle.borderWidth);
    const rect = this.controllerElement.elt.getBoundingClientRect();
    rect.width -= borderW * 2;
    rect.height -= borderW * 2;
    const handleW = this.handle.elt.offsetWidth;
    const handleH = this.handle.elt.offsetHeight;
    const feedbackX = this.p.map(
      this.value.x,
      this.minValX,
      this.maxValX,
      -handleW / 2,
      rect.width - handleW / 2
    );
    const feedbackY = this.p.map(
      this.value.y,
      this.minValY,
      this.maxValY,
      -handleH / 2,
      rect.height - handleH / 2
    );

    this.handle.elt.style.left = `${feedbackX}px`;
    this.handle.elt.style.top = `${feedbackY}px`;
  }

  randomize() {
    this.setValue(
      this.mapSteppedFromNormedVec({
        x: this.p.random(-1, 1),
        y: this.p.random(-1, 1),
      })
    );
  }
}

export class ColourBoxes extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    colours,
    defaultIndex,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);

    this.valueCallback = valueCallback;

    this.createRadioFromColours(colours);

    this.setValue(colours[defaultIndex]);
  }

  createRadioFromColours(colours) {
    const isInit = this.controllerElement === undefined;
    if (this.controllerElement) {
      this.controllerElement.elt.remove();
    }

    const radio = this.p.createRadio(this.name);
    radio.class("colour-boxes");
    this.controllerWrapper.elt.prepend(radio.elt);

    for (let i = 0; i < colours.length; i++) {
      radio.option(i.toString());
    }

    // remove span labels from p5 structure
    for (const elt of radio.elt.querySelectorAll("span")) elt.remove();

    let i = 0;
    for (const elt of radio.elt.querySelectorAll("input")) {
      const hexCol = util.colorToHexString(colours[i++]).toUpperCase();
      elt.style.backgroundColor = hexCol;
      elt.title = hexCol;
      elt.onclick = (evt) => {
        this.setValue(this.colours[parseInt(elt.value)]);
      };
    }

    this.colours = colours;
    this.controllerElement = radio;
  }

  setValue(colObj) {
    if (!(colObj instanceof p5.Color))
      throw new Error(colObj + " is not a p5.Color.");

    const index = this.colours.findIndex((col) =>
      isArraysEqual(col.levels, colObj.levels)
    );

    this.value = this.colours[index];
    this.controllerElement.selected("" + index);
    this.valueCallback(this, this.value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {
    this.setValue(this.p.random(this.colours));
  }
}

export class MultiColourBoxes extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    colours,
    defaultIndices,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);

    this.colours = colours;
    this.valueCallback = valueCallback;

    this.setControllerColours();

    const defaultCols = defaultIndices.map((i) => this.colours[i]);
    this.setValue(defaultCols);
  }

  setControllerColours() {
    if (this.controllerElement) {
      this.controllerElement.remove();
    }

    const div = this.p.createDiv();
    div.class("colour-boxes");
    div.parent(this.controllerWrapper);
    this.checkboxes = [];
    for (let i = 0; i < this.colours.length; i++) {
      const cb = this.p.createCheckbox();
      cb.parent(div);
      cb.value("" + i);
      cb.elt.addEventListener("click", () => {
        const indices = [];
        this.checkboxes.forEach((c, idx) => {
          if (c.checked()) indices.push(idx);
        });
        this.setValueFromIndices(indices);
      });
      this.checkboxes.push(cb);
    }

    div.elt.querySelectorAll("span").forEach((elt) => {
      elt.remove();
    });
    div.elt.querySelectorAll("input").forEach((elt, i) => {
      const hexCol = util.colorToHexString(this.colours[i]).toUpperCase();
      elt.style.backgroundColor = hexCol;
      elt.title = hexCol;
    });

    this.controllerElement = div;
  }

  setValueFromIndices(indices) {
    this.valueIndices = indices;
    this.value = indices.map((i) => this.colours[i]);
    this.checkboxes.forEach((cb, i) => {
      cb.checked(indices.includes(i));
    });
    this.valueCallback(this, this.value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  setValue(colArray) {
    const indices = colArray.map((colObj) => {
      if (!(colObj instanceof p5.Color))
        throw new Error(colObj + " is not a p5.Color.");
      return this.colours.findIndex((col) =>
        isArraysEqual(col.levels, colObj.levels)
      );
    });
    this.setValueFromIndices(indices);
  }

  randomize() {
    const indices = [];
    for (let i = 0; i < this.colours.length; i++) {
      if (this.p.random(1) < 0.5) indices.push(i);
    }
    if (indices.length === 0)
      indices.push(this.p.floor(this.p.random(this.colours.length)));
    this.setValueFromIndices(indices);
  }
}

export class Textbox extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    defaultVal,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);
    this.controllerElement = this.p.createInput();
    this.controllerElement.parent(this.controllerWrapper);
    this.controllerElement.value(defaultVal);

    this.controllerElement.elt.oninput = (event) => {
      const value = event.srcElement.value;
      valueCallback(this, value);
    };

    this.valueCallback = valueCallback;

    this.controllerElement.elt.addEventListener(
      "focusin",
      (event) => (gui.isTypingText = true)
    );
    this.controllerElement.elt.addEventListener(
      "focusout",
      (event) => (gui.isTypingText = false)
    );
  }

  setValue(value) {
    this.value = value;
    this.valueCallback(this, value);
    this.controllerElement.value(value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {}
}

export class ResolutionTextboxes extends ValuedController {
  constructor(gui, defW, defH, valueCallback, setupCallback = undefined) {
    super(gui, "resolutionTextboxes", undefined, setupCallback);
    this.w = defW;
    this.h = defH;
    this.wBox = new Textbox(
      gui,
      "resolutionTextBoxes-Width",
      lang.process("LANG_WIDTH:", true),
      defW,
      (controller, value) => {
        const pxDim = parseInt(value);
        if (isNaN(pxDim)) {
          return;
        }
        this.w = pxDim;
        resize(this.w, this.h);
        valueCallback(this, { w: this.w, h: this.h });
      }
    );
    this.hBox = new Textbox(
      gui,
      "resolutionTextBoxes-Height",
      lang.process("LANG_HEIGHT:", true),
      defH,
      (controller, value) => {
        const pxDim = parseInt(value);
        if (isNaN(pxDim)) {
          return;
        }
        this.h = pxDim;
        resize(this.w, this.h);
        valueCallback(this, { w: this.w, h: this.h });
      }
    );

    for (const tb of [this.wBox, this.hBox]) {
      tb.div.parent(this.controllerWrapper);
    }
    this.div.style("display", "flex");
    this.div.style("flex-direction", "row");
    this.div.style("gap", "1em");
  }

  setValue(vec) {
    this.value = vec;
    this.wBox.setValue(vec.w);
    this.hBox.setValue(vec.h);
    // if (this.doUpdateChangeSet()) changeSet.save();
  }

  setValueOnlyDisplay(w, h) {
    console.log(w, h);
    this.wBox.controllerElement.value(w);
    this.hBox.controllerElement.value(h);
  }
}

class Textarea extends ValuedController {
  constructor(
    gui,
    name,
    labelStr,
    defaultVal,
    valueCallback,
    setupCallback = undefined
  ) {
    super(gui, name, labelStr, setupCallback);
    this.controllerElement = this.p.createElement("textarea");
    this.controllerElement.parent(this.controllerWrapper);
    this.controllerElement.html(defaultVal);

    this.controllerElement.elt.oninput = (event) => {
      const value = event.srcElement.value;
      valueCallback(this, value);
    };
    this.valueCallback = valueCallback;

    this.controllerElement.elt.addEventListener(
      "focusin",
      (event) => (gui.isTypingText = true)
    );
    this.controllerElement.elt.addEventListener("focusout", (event) => {
      gui.isTypingText = false;
      const value = event.srcElement.value;
      this.setValue(value);
    });
  }

  setValue(value) {
    this.value = value;
    this.valueCallback(this, value);
    this.controllerElement.value(value);
    if (this.doUpdateChangeSet()) changeSet.save();
  }

  randomize() {}
}

export class ColourTextArea extends Textarea {
  constructor(
    gui,
    name,
    labelStr,
    colours,
    valueCallback,
    setupCallback = undefined
  ) {
    const colourList = ColourTextArea.colourListToString(colours);
    super(gui, name, labelStr, colourList, valueCallback, setupCallback);

    this.controllerElement.elt.oninput = (event) => {
      const value = ColourTextArea.parseColourList(event.srcElement.value);
      this.valueCallback(this, value);

      this.displayColours(value);
    };

    this.displayColours(colours);
  }

  displayColours(colours) {
    if (this.disp) this.disp.elt.remove();

    this.disp = this.p.createDiv();
    this.disp.class("colour-text-area-display");
    this.disp.parent(this.div);
    for (let col of colours) {
      let colBlock = this.p.createDiv();
      colBlock.class("colour-text-area-block");
      colBlock.style("background-color", util.colorToHexString(col));
      colBlock.parent(this.disp);
    }
  }

  static colourListToString(colours) {
    return colours.map((c) => util.colorToHexString(c).toUpperCase()).join(",");
  }

  static parseColourList(str) {
    return str
      .split(",")
      .map((cstr) => cstr.trim())
      .filter((cstr) => cstr.length == 7 && cstr[0] == "#")
      .map((cstr) => color(cstr));
  }
}
