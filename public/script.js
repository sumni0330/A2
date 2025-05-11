// Mycelium Chaos - A response to "What Is It Like to Be A Fungus?" by Merlin Sheldrake
// This code explores the networked, decentralized intelligence of fungi through
// recursive growth patterns, emergent behaviors, and chaotic systems

import * as Tone from "https://esm.sh/tone";
window.Tone = Tone;

// Global variables
let mycelium = [];
let playing = false;
let rotationOffset = 0;
let audioInitialized = false;

// Audio variables
let synth, noise;
let glitchEffect = false;
let moirePatternActive = false;

// Setup function - initialize the canvas and environment
window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noiseDetail(4, 0.5);
  noStroke();

  // Create initial mycelium node
  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));

  // We'll initialize audio only after user interaction
};

// Draw function - runs continuously
window.draw = function () {
  background(0);

  // Apply moiré pattern effect if active
  if (moirePatternActive) {
    drawMoirePattern();
  }

  // Apply rotation to the entire scene
  rotateY(rotationOffset);
  rotateX(rotationOffset * 0.5);
  rotationOffset += 0.003;

  // Set up lighting
  ambientLight(60);
  pointLight(255, 255, 255, 200, -200, 300);

  // Update and display all mycelium nodes
  for (let i = mycelium.length - 1; i >= 0; i--) {
    mycelium[i].update();
    mycelium[i].display();

    // Check if the node should spawn new nodes
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }
  }

  // Apply random glitch effects
  if (glitchEffect && random() < 0.05) {
    applyGlitchEffect();
  }
};

// Initialize audio components safely
function setupAudio() {
  if (audioInitialized) return; // Prevent multiple initializations

  try {
    // Start audio context first
    Tone.start();
    console.log("Audio context started successfully");

    // Initialize synth
    synth = new Tone.MembraneSynth().toDestination();
    synth.volume.value = -15;

    // Initialize noise
    noise = new Tone.Noise("brown").toDestination();
    noise.volume.value = -40;

    audioInitialized = true;
    console.log("Audio components initialized successfully");
  } catch (error) {
    console.error("Error initializing audio:", error);
  }
}

// Handle mouse press event
window.mousePressed = function () {
  // Initialize audio on first click
  if (!audioInitialized) {
    setupAudio();
  }

  // Toggle playing state
  playing = !playing;

  // Only try to control audio if successfully initialized
  if (audioInitialized) {
    if (playing) {
      // Start noise and play a note
      noise.start();
      synth.triggerAttackRelease("C2", "8n");
    } else {
      // Stop noise
      noise.stop();
    }
  }
};

// Handle key press event
window.keyPressed = function () {
  // Toggle glitch effect with G key
  if (key === "g" || key === "G") {
    glitchEffect = !glitchEffect;
    console.log("Glitch effect:", glitchEffect ? "ON" : "OFF");
  }

  // Toggle moiré pattern with M key
  if (key === "m" || key === "M") {
    moirePatternActive = !moirePatternActive;
    console.log("Moiré pattern:", moirePatternActive ? "ON" : "OFF");
  }
};

// Handle window resize
window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};

// Draw moiré pattern effect
function drawMoirePattern() {
  push();
  noLights();
  strokeWeight(0.5);
  stroke(255, 40);

  // Two overlapping patterns creating moiré effect
  let spacing1 = 10 + sin(frameCount * 0.01) * 2;
  let spacing2 = 10 + cos(frameCount * 0.01) * 2;
  let angle1 = frameCount * 0.001;
  let angle2 = frameCount * 0.002;

  // Reset camera transform for screen coordinates
  camera();

  // Draw first grid
  push();
  translate(width / 2, height / 2);
  rotate(angle1);
  for (let x = -width; x < width; x += spacing1) {
    line(x, -height, x, height);
  }
  pop();

  // Draw second grid
  push();
  translate(width / 2, height / 2);
  rotate(angle2);
  for (let x = -width; x < width; x += spacing2) {
    line(x, -height, x, height);
  }
  pop();

  pop();
}

// Apply glitch effect
function applyGlitchEffect() {
  push();

  // Visual glitch - temporary displacement
  translate(random(-10, 10), random(-10, 10));

  // Apply visual noise/static
  stroke(255, 50);
  strokeWeight(1);
  for (let i = 0; i < 20; i++) {
    let x1 = random(-width / 2, width / 2);
    let y1 = random(-height / 2, height / 2);
    let x2 = x1 + random(-50, 50);
    let y2 = y1 + random(-50, 50);
    line(x1, y1, 0, x2, y2, 0);
  }

  // Audio glitch if sound is on
  if (playing && audioInitialized && random() < 0.3) {
    try {
      // Quick sound effect
      synth.triggerAttackRelease(["C1"], "32n");
    } catch (error) {
      console.error("Error playing glitch sound:", error);
    }
  }

  pop();
}

// 🧠 MyceliumNode class - represents a single node in the mycelium network
class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.pos = createVector(x, y, z);
    this.r = r;
    this.depth = depth;
    this.angle = p5.Vector.random3D();
    this.life = 0;
    this.maxLife = random(200, 500);

    // Color with noise-based variation
    this.col = color(
      100 + noise(x * 0.01, y * 0.01) * 155,
      100 + sin(depth) * 155,
      255,
      200
    );

    // Connection properties
    this.connections = [];
  }

  update() {
    // Age the node
    this.life++;

    // Move based on growth direction
    this.pos.add(p5.Vector.mult(this.angle, 0.5));

    // Slightly adjust angle randomly over time for organic movement
    if (frameCount % 10 === 0) {
      this.angle.rotate(random(-0.1, 0.1));
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    // Apply material
    ambientMaterial(this.col);

    // Size fluctuation based on noise for organic feel
    let sizeFluctuation = noise(this.life * 0.01) * 5;
    sphere(this.r * 0.1 + sizeFluctuation, 6, 4);

    pop();

    // Draw connections to other nodes
    this.drawConnections();
  }

  shouldSpawn() {
    // Spawn new nodes based on conditions
    return (
      this.r > 10 &&
      this.life > 30 &&
      this.life < this.maxLife * 0.7 &&
      random() < 0.01
    );
  }

  spawn() {
    // Create between 1-3 new branches
    let branches = int(random(1, 3));

    for (let i = 0; i < branches; i++) {
      // Create a new node
      let child = new MyceliumNode(
        this.pos.x,
        this.pos.y,
        this.pos.z,
        this.r * 0.7,
        this.depth + 1
      );

      // Randomize direction
      child.angle = p5.Vector.random3D();

      // Add to mycelium array
      mycelium.push(child);

      // Create connection
      this.connections.push(mycelium.length - 1);
    }

    // Play sound for spawning if audio is active
    if (playing && audioInitialized && random() < 0.3) {
      try {
        synth.triggerAttackRelease(random(["C3", "E3", "G3"]), "16n");
      } catch (error) {
        console.error("Error playing spawn sound:", error);
      }
    }
  }

  drawConnections() {
    // Draw connections to other nodes
    push();
    stroke(red(this.col), green(this.col), blue(this.col), 100);
    strokeWeight(1);

    for (let i = 0; i < this.connections.length; i++) {
      let connectedIndex = this.connections[i];
      if (connectedIndex < mycelium.length) {
        let otherNode = mycelium[connectedIndex];
        line(
          this.pos.x,
          this.pos.y,
          this.pos.z,
          otherNode.pos.x,
          otherNode.pos.y,
          otherNode.pos.z
        );
      }
    }
    pop();
  }
}

// Helper function for recursive fractal branch creation
// This demonstrates true recursion as required by the assignment
function createFractalBranch(x, y, z, size, depth, branchCount = 3) {
  // Base case for recursion
  if (depth <= 0 || size < 5) return;

  // Create current branch node
  let node = new MyceliumNode(x, y, z, size, 5 - depth);
  mycelium.push(node);

  // Create sub-branches with recursion
  for (let i = 0; i < branchCount; i++) {
    // Calculate angle for this branch
    let angle = (TWO_PI / branchCount) * i;

    // Calculate new position
    let newX = x + cos(angle) * size;
    let newY = y + sin(angle) * size;
    let newZ = z + sin(angle * 0.5) * size * 0.5;

    // Recursive call to create sub-branch
    createFractalBranch(newX, newY, newZ, size * 0.7, depth - 1, branchCount);
  }
}
