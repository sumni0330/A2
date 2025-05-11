// Mycelium Chaos - A response to "What Is It Like to Be A Fungus?" by Merlin Sheldrake
// This code explores the networked, decentralized intelligence of fungi through
// recursive growth patterns, emergent behaviors, and chaotic systems

import * as Tone from "https://esm.sh/tone";
window.Tone = Tone;

let mycelium = [];
let playing = false;
let rotationOffset = 0;

// Audio variables
let audioCtx;
let oscillator;
let gainNode;

window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noiseDetail(4, 0.5);
  noStroke();

  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));

  // Don't initialize audio yet - wait for click
};

window.draw = function () {
  background(0);
  rotateY(rotationOffset);
  rotateX(rotationOffset * 0.5);
  rotationOffset += 0.003;

  ambientLight(60);
  pointLight(255, 255, 255, 200, -200, 300);

  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }
};

// Using Web Audio API directly instead of Tone.js
function setupAudio() {
  try {
    // Create audio context
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create gain node for volume control
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.1; // Set volume
    gainNode.connect(audioCtx.destination);

    console.log("Audio initialization successful");
    return true;
  } catch (error) {
    console.error("Audio initialization error:", error);
    return false;
  }
}

// Play a simple tone with given frequency and duration
function playTone(frequency, duration) {
  if (!audioCtx) return;

  try {
    // Create oscillator
    oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency; // Set frequency

    // Connect and play
    oscillator.connect(gainNode);
    oscillator.start();

    // Stop after specified duration
    setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
    }, duration);
  } catch (error) {
    console.error("Sound playback error:", error);
  }
}

window.mousePressed = function () {
  // Set up audio on first click
  if (!audioCtx) {
    setupAudio();
  }

  // Resume audio context if suspended
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  playing = !playing;

  if (playing && audioCtx) {
    // Play a simple tone to indicate start
    playTone(220, 500); // A3 note, 500ms
  }
};

// MyceliumNode class - represents a fungal node in the network
class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.pos = createVector(x, y, z);
    this.r = r;
    this.depth = depth;
    this.angle = p5.Vector.random3D();
    this.life = 0;
    this.col = color(
      100 + noise(x * 0.01, y * 0.01) * 155,
      100 + sin(depth) * 155,
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
    sphere(this.r * 0.1 + noise(this.life * 0.01) * 5, 6, 4);
    pop();
  }

  shouldSpawn() {
    return this.r > 10 && this.life > 30 && random() < 0.01;
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

    // Play sound when spawning (only if audio is set up)
    if (playing && audioCtx) {
      // Play a short sound with random frequency
      let notes = [261.63, 329.63, 392.0]; // C4, E4, G4 frequencies
      playTone(notes[floor(random(notes.length))], 100); // Play for 100ms
    }
  }
}
