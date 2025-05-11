import * as Tone from "https://esm.sh/tone";

// Tone을 전역에서 쓸 수 있게 설정
window.Tone = Tone;

let mycelium = [];
let synth, noise;
let playing = false;
let rotationOffset = 0;

window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noStroke();
  noiseDetail(4, 0.5); // Perlin noise

  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));

  // 사운드는 이 시점에서는 start하지 않음
  synth = new Tone.MembraneSynth().toDestination();
  noise = new Tone.Noise("brown");
  noise.volume.value = -40;
};

window.draw = function () {
  background(0);

  // 카오스 회전
  rotateY(rotationOffset);
  rotateX(rotationOffset * 0.5);
  rotationOffset += 0.003;

  // 빛 효과
  ambientLight(40);
  pointLight(255, 255, 255, 0, 0, 400);

  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();

    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }
};

window.mousePressed = function () {
  Tone.start(); // 반드시 클릭 후!
  playing = !playing;

  if (playing) {
    noise.start();
    synth.triggerAttackRelease("C2", "8n");
  } else {
    noise.stop();
  }
};

// 곰팡이 노드 클래스
class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.pos = createVector(x, y, z);
    this.r = r;
    this.depth = depth;
    this.angle = p5.Vector.random3D(); // 3D 방향
    this.life = 0;
    this.col = color(
      100 + window.noise(this.pos.x * 0.01, this.pos.y * 0.01) * 155,
      100 + sin(this.depth) * 155,
      255,
      200
    );
  }

  update() {
    this.life++;
    this.pos.add(p5.Vector.mult(this.angle, 0.5));
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    ambientMaterial(this.col);
    sphere(this.r * 0.1 + window.noise(this.life * 0.01) * 5, 6, 4); // 혼란한 느낌
    pop();
  }

  shouldSpawn() {
    return this.r > 10 && this.life > 30 && random() < 0.015;
  }

  spawn() {
    let branches = int(random(1, 3));
    for (let i = 0; i < branches; i++) {
      let child = new MyceliumNode(
        this.pos.x,
        this.pos.y,
        this.pos.z,
        this.r * 0.7,
        this.depth + 1
      );
      child.angle = p5.Vector.random3D();
      mycelium.push(child);
    }

    // 간헐적 사운드
    if (random() < 0.3) {
      synth.triggerAttackRelease(random(["C3", "E3", "G3"]), "16n");
    }
  }
}
