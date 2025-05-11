let mycelium = [];
let synth;
let noise;
let playing = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  console.log("✅ setup 시작됨");

  mycelium.push(new MyceliumNode(width / 2, height / 2, 10, 0));

  synth = new Tone.MembraneSynth().toDestination();
  noise = new Tone.Noise("pink").start();
  let autoFilter = new Tone.AutoFilter("4n").toDestination().start();
  noise.connect(autoFilter);
  noise.volume.value = -40;
}

function draw() {
  noFill();
  strokeWeight(1);
  stroke(255, 100);

  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }

  fill(255);
  noStroke();
  textSize(16);
  text("Nodes: " + mycelium.length, 10, 20);
}

function mousePressed() {
  Tone.start();
  playing = !playing;
  noise.volume.value = playing ? -10 : -60;
  synth.triggerAttackRelease("C2", "8n");
  console.log("🎵 mousePressed: sound " + (playing ? "on" : "off"));
}

class MyceliumNode {
  constructor(x, y, r, depth) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.depth = depth;
    this.angle = random(TWO_PI);
    this.life = 0;
  }

  update() {
    this.life++;
    this.x += cos(this.angle) * 0.5;
    this.y += sin(this.angle) * 0.5;
  }

  display() {
    let col = color(200 + this.depth * 10, 100, 255, 70);
    stroke(col);
    ellipse(this.x, this.y, this.r);
  }

  shouldSpawn() {
    return this.r > 1 && this.life > 30 && random() < 0.01;
  }

  spawn() {
    let branches = int(random(1, 3));
    for (let i = 0; i < branches; i++) {
      let offset = random(-PI / 3, PI / 3);
      let child = new MyceliumNode(
        this.x,
        this.y,
        this.r * 0.7,
        this.depth + 1
      );
      child.angle = this.angle + offset;
      mycelium.push(child);
    }

    if (random() < 0.5) {
      synth.triggerAttackRelease(random(["C3", "E3", "G3"]), "16n");
    }
  }
}
