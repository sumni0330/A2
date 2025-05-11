import * as Tone from "https://esm.sh/tone";
window.Tone = Tone;

let mycelium = [];
let bugs = [];
let structures = [];

let synth,
  noise,
  playing = false;

let angleOffset = 0;

class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
    this.depth = depth;
    this.angleXY = random(TWO_PI);
    this.angleZ = random(-0.3, 0.3);
    this.life = 0;
  }

  update() {
    this.life++;
    this.x += cos(this.angleXY) * 0.4;
    this.y += sin(this.angleXY) * 0.4;
    this.z += sin(this.angleZ) * 0.4;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    ambientMaterial(180 + this.depth * 10, 100, 200, 80);
    sphere(this.r);
    pop();
  }

  shouldSpawn() {
    return this.r > 1 && this.life > 20 && random() < 0.008;
  }

  spawn() {
    let branches = int(random(1, 3));
    for (let i = 0; i < branches; i++) {
      let child = new MyceliumNode(
        this.x,
        this.y,
        this.z,
        this.r * 0.7,
        this.depth + 1
      );
      child.angleXY = this.angleXY + random(-PI / 4, PI / 4);
      child.angleZ = this.angleZ + random(-0.2, 0.2);
      mycelium.push(child);
    }

    if (random() < 0.4) {
      synth.triggerAttackRelease(random(["C3", "D#3", "G3", "B2"]), "16n");
    }
  }
}

class WigglerBug {
  constructor() {
    this.x = random(-200, 200);
    this.y = random(-200, 200);
    this.z = random(-200, 200);
    this.wigglePhase = random(TWO_PI);
    this.life = int(random(200, 500));
    this.size = random(8, 15);
  }

  update() {
    this.wigglePhase += 0.2;
    this.x += sin(this.wigglePhase) * 1.5;
    this.y += cos(this.wigglePhase * 1.2) * 1.5;
    this.z += sin(this.wigglePhase * 0.8) * 1.2;
    this.life--;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    rotateY(this.wigglePhase * 0.1);
    ambientMaterial(255, 100, 50);
    box(this.size, this.size * 0.6, this.size * 0.4);
    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ChaosStructure {
  constructor() {
    this.x = random(-300, 300);
    this.y = random(-300, 300);
    this.z = random(-400, -200);
    this.type = random(["box", "torus", "ellipsoid"]);
    this.size = random(30, 70);
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(0.01, 0.03);
    this.life = int(random(300, 600));
  }

  update() {
    this.rotation += this.rotationSpeed;
    this.life--;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    rotateY(this.rotation);
    rotateX(this.rotation * 0.6);
    ambientMaterial(100, 255, 150);
    if (this.type === "box") {
      box(this.size);
    } else if (this.type === "torus") {
      torus(this.size * 0.5, this.size * 0.2);
    } else {
      ellipsoid(this.size * 0.6, this.size, this.size * 0.5);
    }
    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}

window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  mycelium.push(new MyceliumNode(0, 0, 0, 10, 0));

  synth = new Tone.MembraneSynth().toDestination();
  noise = new Tone.Noise("brown").start();
  noise.volume.value = -40;
};

window.draw = function () {
  background(0);
  rotateY(angleOffset + sin(frameCount * 0.005) * 0.5);
  rotateX(sin(frameCount * 0.003) * 0.3);

  ambientLight(120);
  directionalLight(255, 255, 255, 0, -1, 0);

  // 균사체 업데이트
  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }

  // 벌레
  if (frameCount % 60 === 0) bugs.push(new WigglerBug());
  for (let i = bugs.length - 1; i >= 0; i--) {
    bugs[i].update();
    bugs[i].display();
    if (bugs[i].isDead()) bugs.splice(i, 1);
  }

  // 구조물
  if (frameCount % 150 === 0) structures.push(new ChaosStructure());
  for (let i = structures.length - 1; i >= 0; i--) {
    structures[i].update();
    structures[i].display();
    if (structures[i].isDead()) structures.splice(i, 1);
  }

  // 글리치 흔들림 효과
  if (frameCount % 100 < 4) {
    rotateZ(sin(frameCount * 0.2) * 0.4);
  }
};

window.mousePressed = function () {
  Tone.start();
  playing = !playing;
  noise.volume.value = playing ? -10 : -40;
  synth.triggerAttackRelease("C1", "8n");
};
