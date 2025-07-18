import { lang } from "../lang";

export class GUIForP5 {
  static verbose = !false;

  fields = [];
  controllers = [];

  isTypingText = false;

  constructor(p5Instance) {
    this.p = p5Instance; // Store the p5 instance
    this.div = this.p.createDiv();
    this.div.id("gui");

    // this.randomizer = new Randomizer();

    this.loadLightDarkMode();

    this.setLeft();
  }

  setup() {
    for (let controller of this.controllers) {
      controller.setup();
    }
  }

  setLeft() {
    document.querySelector("main").prepend(this.div.elt);
    this.isOnLeftSide = true;
  }

  setRight() {
    document.querySelector("main").append(this.div.elt);
    this.isOnLeftSide = false;
  }

  toggleSide() {
    this.isOnLeftSide ? this.setRight() : this.setLeft();
  }

  loadLightDarkMode() {
    const setting = window.localStorage["isDarkMode"];
    switch (setting) {
      case "true":
        this.setDarkMode();
        break;
      case "false":
        this.setLightMode();
        break;
      default:
        this.setAutoLightDarkMode();
    }
  }

  setLightMode() {
    document.body.className = "";
    window.localStorage["isDarkMode"] = "false";
    this.darkMode = "false";
    if (this.darkModeButton) this.darkModeButton.setLightMode();
  }

  setDarkMode() {
    document.body.className = "dark-mode";
    window.localStorage["isDarkMode"] = "true";
    this.darkMode = "true";
    if (this.darkModeButton) this.darkModeButton.setDarkMode();
  }

  setAutoLightDarkMode() {
    const isSystemDarkMode = () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isSystemDarkMode()) {
      this.setDarkMode();
    } else {
      this.setLightMode();
    }
    window.localStorage["isDarkMode"] = "auto";
    this.darkMode = "auto";
    if (this.darkModeButton) this.darkModeButton.setAutoLightDarkMode();
  }

  toggleLightDarkMode() {
    // cycle modes
    switch (this.darkMode) {
      case "false":
        this.setDarkMode();
        break;
      case "true":
        this.setAutoLightDarkMode();
        break;
      default:
        this.setLightMode();
    }
  }

  createDarkModeButton() {
    this.darkModeButton = this.addController(
      new Button(this, "buttonDarkMode", "", (controller) => {
        this.toggleLightDarkMode();
      })
    );
    this.darkModeButton.controllerElement.id("dark-mode-button");
    this.darkModeButton.setLightMode = () => {
      this.darkModeButton.controllerElement.style(
        "background-image",
        'url("assets/dark-mode/light-mode-icon.svg")'
      );
      this.darkModeButton.controllerElement.elt.title = "Light mode";
    };
    this.darkModeButton.setDarkMode = () => {
      this.darkModeButton.controllerElement.style(
        "background-image",
        'url("assets/dark-mode/dark-mode-icon.svg")'
      );
      this.darkModeButton.controllerElement.elt.title = "Dark mode";
    };
    this.darkModeButton.setAutoLightDarkMode = () => {
      this.darkModeButton.controllerElement.style(
        "background-image",
        'url("assets/dark-mode/auto-mode-icon.svg")'
      );
      this.darkModeButton.controllerElement.elt.title = "Auto light/dark mode";
    };
    switch (this.darkMode) {
      case "false":
        this.darkModeButton.setLightMode();
        break;
      case "true":
        this.darkModeButton.setDarkMode();
        break;
      default:
        this.darkModeButton.setAutoLightDarkMode();
    }
  }

  // ============================================================================
  // FACTORY METHODS - Create elements with automatic p5 instance injection
  // ============================================================================

  createField(id, className) {
    return new Field(this.div, id, className, this.p);
  }

  createLabel(text) {
    return new Label(this.div, text, this.p);
  }

  createTitle(hSize, text, doAlignCenter = false) {
    return new Title(this.div, hSize, text, this.p, doAlignCenter);
  }

  createTextfield(text, className = undefined, doAlignCenter = false) {
    return new Textfield(this.div, text, this.p, className, doAlignCenter);
  }

  createImage(url, altText, doAlignCenter = true) {
    return new GUIImage(this.div, url, altText, this.p, doAlignCenter);
  }

  createDivider() {
    return new Divider(this.div, this.p);
  }

  // Factory methods for controllers (you'll need to implement these controller classes)
  createButton(name, label, onClick, onSetup = null) {
    return new Button(this, name, label, onClick, onSetup);
  }

  createSlider(name, label, min, max, value, step, onChange, onSetup = null) {
    return new Slider(
      this,
      name,
      label,
      min,
      max,
      value,
      step,
      onChange,
      onSetup
    );
  }

  createColorPicker(name, label, initialColor, onChange, onSetup = null) {
    return new ColorPicker(this, name, label, initialColor, onChange, onSetup);
  }

  createDropdown(
    name,
    label,
    options,
    selectedIndex,
    onChange,
    onSetup = null
  ) {
    return new Dropdown(
      this,
      name,
      label,
      options,
      selectedIndex,
      onChange,
      onSetup
    );
  }

  createTextInput(name, label, initialValue, onChange, onSetup = null) {
    return new TextInput(this, name, label, initialValue, onChange, onSetup);
  }

  createCheckbox(name, label, checked, onChange, onSetup = null) {
    return new Checkbox(this, name, label, checked, onChange, onSetup);
  }

  // ============================================================================
  // ADD METHODS - Create and add elements to the GUI
  // ============================================================================

  addField(field) {
    this.fields.push(field);
    return field;
  }

  addDivider() {
    let divider = this.createDivider();
    this.addField(divider);
    return divider;
  }

  addController(controller, doAddToRandomizerAs = undefined) {
    this.addField(controller);
    this.controllers.push(controller);
    if (doAddToRandomizerAs !== undefined)
      this.randomizer.addController(controller, doAddToRandomizerAs);
    return controller;
  }

  addLabel(labelText) {
    let label = this.createLabel(labelText);
    this.addField(label);
    return label;
  }

  addTitle(hSize, titleText, doAlignCenter = false) {
    let title = this.createTitle(hSize, titleText, doAlignCenter);
    this.addField(title);
    return title;
  }

  addImage(url, altText, doAlignCenter = true) {
    let img = this.createImage(url, altText, doAlignCenter);
    this.addField(img);
    return img;
  }

  addTextfield(text, className = undefined, doAlignCenter = false) {
    let textfield = this.createTextfield(text, className, doAlignCenter);
    this.addField(textfield);
    return textfield;
  }

  // Convenience methods for adding controllers
  addButton(name, label, onClick, onSetup = null) {
    let button = this.createButton(name, label, onClick, onSetup);
    return this.addController(button);
  }

  addSlider(name, label, min, max, value, step, onChange, onSetup = null) {
    let slider = this.createSlider(
      name,
      label,
      min,
      max,
      value,
      step,
      onChange,
      onSetup
    );
    return this.addController(slider);
  }

  addColorPicker(name, label, initialColor, onChange, onSetup = null) {
    let colorPicker = this.createColorPicker(
      name,
      label,
      initialColor,
      onChange,
      onSetup
    );
    return this.addController(colorPicker);
  }

  addDropdown(name, label, options, selectedIndex, onChange, onSetup = null) {
    let dropdown = this.createDropdown(
      name,
      label,
      options,
      selectedIndex,
      onChange,
      onSetup
    );
    return this.addController(dropdown);
  }

  addTextInput(name, label, initialValue, onChange, onSetup = null) {
    let textInput = this.createTextInput(
      name,
      label,
      initialValue,
      onChange,
      onSetup
    );
    return this.addController(textInput);
  }

  addCheckbox(name, label, checked, onChange, onSetup = null) {
    let checkbox = this.createCheckbox(name, label, checked, onChange, onSetup);
    return this.addController(checkbox);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  hasName(name) {
    return this.controllers.some((controller) => controller.name == name);
  }

  getController(name) {
    if (!this.hasName(name)) {
      return undefined;
    }
    return this.controllers[
      this.controllers.map((controller) => controller.name).indexOf(name)
    ];
  }
}

// ============================================================================
// BASE FIELD CLASSES
// ============================================================================

export class Field {
  constructor(parentDiv, id, className, p5Instance) {
    this.p = p5Instance;
    this.div = this.p.createDiv();
    this.div.parent(parentDiv);
    if (id !== undefined && id !== null && id != "") this.div.id(id);
    this.div.class(className);
  }

  setTooltip(tooltip) {
    this.div.elt.title = tooltip;
  }

  hide() {
    this.div.hide();
  }

  show() {
    this.div.elt.style.display = ""; // more general than p5 .show()
    if (this.setDisplay) this.setDisplay(); // XYSlider needs this for now
  }

  isHidden() {
    return this.div.elt.style.display == "none";
  }
}

export class Label extends Field {
  constructor(parentDiv, text, p5Instance) {
    super(parentDiv, null, "gui-label", p5Instance);
    text = lang.process(text, true);
    this.setText(text);
  }

  setText(text) {
    this.text = text;
    this.div.elt.innerText = text;
  }
}

export class Title extends Field {
  constructor(parentDiv, hSize, text, p5Instance, doAlignCenter = false) {
    super(parentDiv, null, "gui-title", p5Instance);
    text = lang.process(text, true);
    this.div.html(`<h${hSize}>${text}</h${hSize}>`);
    if (doAlignCenter) {
      this.div.style("text-align", "center");
    }
  }
}

export class Textfield extends Field {
  constructor(
    parentDiv,
    text,
    p5Instance,
    className = undefined,
    doAlignCenter = false
  ) {
    super(parentDiv, null, "gui-textfield", p5Instance);
    text = lang.process(text, true);
    this.div.html(`<span>${text}</span>`);
    if (className) {
      this.div.addClass(className);
    }
    if (doAlignCenter) {
      this.div.style("text-align", "center");
    }
  }
}

export class GUIImage extends Field {
  constructor(parentDiv, url, altText, p5Instance, doAlignCenter = true) {
    super(parentDiv, null, "gui-image", p5Instance);
    altText = lang.process(altText, true);
    this.div.html(`<img src='${url}' alt='${altText}'>`);
    if (doAlignCenter) {
      this.div.style("text-align", "center");
    }
  }
}

export class Divider extends Field {
  constructor(parentDiv, p5Instance) {
    super(parentDiv, null, "gui-divider", p5Instance);
    this.div.html("<hr>");
  }
}

// ============================================================================
// BASE CONTROLLER CLASSES (you'll need to implement these)
// ============================================================================

export class BaseController extends Field {
  constructor(gui, name, label, p5Instance = null) {
    const p = p5Instance || gui.p;
    super(gui.div, null, "gui-controller", p);
    this.gui = gui;
    this.name = name;
    this.label = label;
  }

  setup() {
    // Override in subclasses
  }
}

// Example controller - you'd implement Button, Slider, etc. similarly
export class Button extends BaseController {
  constructor(gui, name, label, onClick, onSetup = null) {
    super(gui, name, label);
    this.onClick = onClick;
    this.onSetup = onSetup;

    this.controllerElement = this.p.createButton(lang.process(label, true));
    this.controllerElement.parent(this.div);
    this.controllerElement.mousePressed(() => this.onClick(this));

    if (this.onSetup) {
      this.onSetup(this);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export let gui = null;
export function setGUI(instance) {
  gui = instance;
}
