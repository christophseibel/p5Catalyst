// generator.js - temporary manual version
export class Generator {
  static name = "p5Catalyst Generator";

  constructor(p5Instance, cola) {
    this.p = p5Instance;
    this.cola = cola;

    this.palette = [
      this.p.color("#7685F7"),
      this.p.color("#BFFB50"),
      this.p.color("#000000"),
      this.p.color("#FFFFFF"),
    ];

    // Set initial color from palette
    this.col = this.palette[0];
  }

  setup() {
    // You can write normal p5 code here
    this.p.colorMode(this.p.HSB);
    this.p.noStroke();
  }

  draw(doSVGToo = false) {
    // Manual instance calls for now
    this.p.background(0);

    let t = this.p.millis() * 0.001;
    let x = this.p.width / 2 + this.p.sin(t) * 100;
    let y = this.p.height / 2 + this.p.cos(t * 0.7) * 50;

    this.p.fill(this.col);
    this.p.circle(x, y, this.p.min(this.p.width, this.p.height) / 10);
  }
}
