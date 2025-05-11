// Mycelium Chaos - A response to "What Is It Like to Be A Fungus?" by Merlin Sheldrake
// This code explores the networked, decentralized intelligence of fungi through
// recursive growth patterns, emergent behaviors, and chaotic systems

import * as Tone from "https://esm.sh/tone";
window.Tone = Tone;

// Global variables
let mycelium = []; // Array to store all mycelium nodes
let nutrientSources = []; // Array for nutrient sources
let glitchEffect = false; // Toggle for glitch effect
let moirePatternActive = false; // Toggle for moiré pattern
let simulationSpeed = 1; // Control for simulation speed
let lastInteractionTime = 0; // Track user interaction
let cameraShake = 0; // Amount of camera shake
let depthOfField = 100; // Simulated depth of field

// Audio variables
let bassSynth, melodySynth, noiseSynth, reverb, delay;
let playing = false;
let rotationOffset = 0;

// Lifecycle variables
let decomposers = []; // Array for decomposer agents
let symbiotes = []; // Array for symbiotic relationships

// Color palettes
const colorPalettes = {
  forest: [
    [50, 150, 90, 200], // Moss green
    [20, 100, 40, 200], // Dark green
    [150, 220, 190, 200], // Mint
    [100, 120, 50, 200], // Olive
  ],
  toxic: [
    [255, 100, 240, 200], // Neon pink
    [180, 255, 100, 200], // Acid green
    [0, 200, 255, 200], // Cyan
    [255, 230, 100, 200], // Yellow
  ],
  mycelial: [
    [255, 255, 255, 200], // White
    [240, 240, 255, 200], // Off-white
    [220, 220, 255, 200], // Pale blue
    [255, 240, 220, 200], // Warm white
  ],
};

// Current color scheme
let currentPalette = "mycelial";

// Setup function - initialize the canvas and environment
window.setup = function () {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(RADIANS);
  noiseDetail(4, 0.5);

  // Initialize first mycelium node at center
  mycelium.push(new MyceliumNode(0, 0, 0, 80, 0));

  // Create nutrient sources
  createNutrientSources(15);

  // Initialize audio components
  setupAudio();

  // Create initial fractal structures
  createFractalStructures(3); // Start with 3 recursive levels
};

// Draw function - runs continuously
window.draw = function () {
  // Clear background with slight alpha for trailing effect when glitching
  if (glitchEffect && frameCount % 10 === 0) {
    background(0, 200); // Semi-transparent background for trails
  } else {
    background(0);
  }

  // Camera and lighting setup
  setupCamera();
  setupLighting();

  // Apply moiré pattern effect if active
  if (moirePatternActive) {
    drawMoirePattern();
  }

  // Update and display mycelium network
  updateMyceliumNetwork();

  // Update and display nutrient sources
  updateNutrients();

  // Update ecological interactions
  updateEcology();

  // Display information
  displayInfo();

  // Random glitch effect
  if (random() < 0.005 || (glitchEffect && random() < 0.2)) {
    applyGlitchEffect();
  }

  // Update audio based on current state
  updateAudio();
};

// Setup camera with optional shake effect
function setupCamera() {
  // Apply camera shake if active
  if (cameraShake > 0) {
    let shakeX = random(-cameraShake, cameraShake);
    let shakeY = random(-cameraShake, cameraShake);
    translate(shakeX, shakeY, 0);
    cameraShake *= 0.95; // Gradually reduce shake
  }

  // Rotate view based on time and interaction
  rotationOffset += 0.003 * simulationSpeed;
  rotateY(rotationOffset);
  rotateX(sin(rotationOffset * 0.5) * 0.3);

  // Zoom effect based on interaction recency
  let zoom = map(min(frameCount - lastInteractionTime, 300), 0, 300, 1.2, 1);
  scale(zoom);
}

// Setup lighting in the 3D environment
function setupLighting() {
  // Create ambient light
  ambientLight(40);

  // Add key light
  pointLight(255, 255, 255, 200, -200, 300);

  // Add fill light
  pointLight(100, 100, 150, -300, 100, -100);

  // Add optional rim light based on time
  if (sin(frameCount * 0.01) > 0.7) {
    pointLight(200, 180, 100, 0, 0, -400);
  }
}

// Initialize audio components using Tone.js
function setupAudio() {
  // Create reverb effect
  reverb = new Tone.Reverb({
    decay: 5,
    wet: 0.5,
  }).toDestination();

  // Create delay effect
  delay = new Tone.FeedbackDelay({
    delayTime: 0.25,
    feedback: 0.4,
    wet: 0.3,
  }).connect(reverb);

  // Bass synth for root/structure sounds
  bassSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: {
      type: "sine",
    },
    envelope: {
      attack: 0.01,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
    },
  }).connect(reverb);
  bassSynth.volume.value = -15;

  // Melody synth for interactions
  melodySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.2,
      release: 1,
    },
  }).connect(delay);
  melodySynth.volume.value = -20;

  // Noise for background texture
  noiseSynth = new Tone.Noise("brown");
  noiseSynth.volume.value = -45;
  const noiseFilter = new Tone.Filter({
    type: "lowpass",
    frequency: 800,
  });
  noiseSynth.connect(noiseFilter);
  noiseFilter.connect(reverb);
}

// Update audio based on current state of the mycelium
function updateAudio() {
  if (playing) {
    // Modulate noise volume based on network size
    noiseSynth.volume.rampTo(-55 + mycelium.length * 0.05, 0.1);

    // Occasionally play notes based on network activity
    if (frameCount % 30 === 0 && random() < 0.3) {
      playNetworkSound();
    }
  }
}

// Play sounds based on the current network state
function playNetworkSound() {
  // Generate note from pentatonic scale
  const notes = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4"];

  // Complexity-based probability
  if (mycelium.length > 50 && random() < 0.2) {
    // Play a chord when network is complex
    let chord = [];
    for (let i = 0; i < 3; i++) {
      chord.push(notes[floor(random(notes.length))]);
    }
    melodySynth.triggerAttackRelease(chord, "8n");
  } else {
    // Play a single note
    let note = notes[floor(random(notes.length))];
    melodySynth.triggerAttackRelease(note, "16n");
  }
}

// Create initial nutrient sources
function createNutrientSources(count) {
  for (let i = 0; i < count; i++) {
    let r = random(300, 600);
    let theta = random(TWO_PI);
    let phi = random(PI);

    let x = r * sin(phi) * cos(theta);
    let y = r * sin(phi) * sin(theta);
    let z = r * cos(phi);

    nutrientSources.push(new NutrientSource(x, y, z));
  }
}

// Create initial fractal structures through recursion
function createFractalStructures(depth) {
  // Recursive fractal creation
  createFractalBranch(0, 0, 0, 150, depth, createVector(0, -1, 0));
}

// Recursively create a fractal branch - true recursion example
function createFractalBranch(x, y, z, size, depth, direction, angle = 0) {
  // Base case for recursion
  if (depth <= 0 || size < 10) return;

  // Create current branch node
  let node = new MyceliumNode(x, y, z, size, 5 - depth);
  node.angle = direction.copy();
  node.isFractal = true; // Mark as part of initial fractal structure
  mycelium.push(node);

  // Calculate endpoint of this branch
  let endpoint = createVector(
    x + direction.x * size,
    y + direction.y * size,
    z + direction.z * size
  );

  // Create sub-branches with recursion
  let branchCount = floor(random(2, 4));
  for (let i = 0; i < branchCount; i++) {
    // Calculate new direction with deviation
    let newDir = direction.copy();
    newDir.rotate(random(-PI / 4, PI / 4));
    newDir.rotate((TWO_PI / branchCount) * i, createVector(0, 1, 0));

    // Recursive call for sub-branch
    createFractalBranch(
      endpoint.x,
      endpoint.y,
      endpoint.z,
      size * 0.6,
      depth - 1,
      newDir
    );
  }
}

// Update all nodes in the mycelium network
function updateMyceliumNetwork() {
  // Handle growth and connections
  for (let i = mycelium.length - 1; i >= 0; i--) {
    // Update node's state
    mycelium[i].update();

    // Display the node
    mycelium[i].display();

    // Check if should spawn new nodes
    if (mycelium[i].shouldSpawn()) {
      mycelium[i].spawn();
    }

    // Remove dead nodes
    if (mycelium[i].isDead()) {
      // Trigger decomposition process
      if (random() < 0.3) {
        createDecomposer(
          mycelium[i].pos.x,
          mycelium[i].pos.y,
          mycelium[i].pos.z
        );
      }
      mycelium.splice(i, 1);
    }
  }

  // Limit total nodes for performance
  if (mycelium.length > 500) {
    mycelium.splice(0, mycelium.length - 500);
  }
}

// Update nutrient sources
function updateNutrients() {
  for (let i = 0; i < nutrientSources.length; i++) {
    nutrientSources[i].update();
    nutrientSources[i].display();
  }

  // Occasionally add a new nutrient source
  if (frameCount % 300 === 0 && nutrientSources.length < 30) {
    let r = random(400, 800);
    let theta = random(TWO_PI);
    let phi = random(PI);

    let x = r * sin(phi) * cos(theta);
    let y = r * sin(phi) * sin(theta);
    let z = r * cos(phi);

    nutrientSources.push(new NutrientSource(x, y, z));
  }
}

// Update ecological interactions
function updateEcology() {
  // Update decomposers
  for (let i = decomposers.length - 1; i >= 0; i--) {
    decomposers[i].update();
    decomposers[i].display();

    if (decomposers[i].isFinished()) {
      decomposers.splice(i, 1);
    }
  }

  // Update symbiotic relationships
  for (let i = symbiotes.length - 1; i >= 0; i--) {
    symbiotes[i].update();
    symbiotes[i].display();

    if (symbiotes[i].isDead()) {
      symbiotes.splice(i, 1);
    }
  }

  // Occasionally create a symbiotic relationship
  if (frameCount % 200 === 0 && random() < 0.3 && mycelium.length > 20) {
    createSymbiosis();
  }
}

// Create a decomposer agent
function createDecomposer(x, y, z) {
  decomposers.push(new Decomposer(x, y, z));

  // Play bass note for decomposition
  if (playing) {
    bassSynth.triggerAttackRelease("G1", "8n");
  }
}

// Create a symbiotic relationship
function createSymbiosis() {
  // Find two separate nodes to connect
  if (mycelium.length < 10) return;

  let index1 = floor(random(mycelium.length));
  let index2 = floor(random(mycelium.length));

  // Make sure they're different nodes
  while (index1 === index2) {
    index2 = floor(random(mycelium.length));
  }

  symbiotes.push(new Symbiosis(mycelium[index1], mycelium[index2]));

  // Play a harmonious chord for symbiosis
  if (playing) {
    melodySynth.triggerAttackRelease(["C4", "E4", "G4"], "4n");
  }
}

// Apply glitch effect
function applyGlitchEffect() {
  // Visual glitch
  push();
  if (random() < 0.5) {
    // Color inversion
    filter(INVERT);
  } else {
    // Displacement
    translate(random(-10, 10), random(-10, 10));
    rotateZ(random(-0.1, 0.1));
  }

  // RGB shift
  if (random() < 0.3) {
    drawRGBShift();
  }

  // Data corruption visualization
  if (random() < 0.2) {
    stroke(255);
    strokeWeight(2);
    for (let i = 0; i < 10; i++) {
      let x1 = random(-width / 2, width / 2);
      let y1 = random(-height / 2, height / 2);
      let x2 = x1 + random(-100, 100);
      let y2 = y1 + random(-100, 100);
      line(x1, y1, x2, y2);
    }
  }
  pop();

  // Audio glitch if sound is on
  if (playing && random() < 0.3) {
    // Quick filter sweep
    bassSynth.triggerAttackRelease(["C1"], "32n");
  }

  // Activate camera shake
  cameraShake = random(5, 15);
}

// Draw RGB shift effect for glitch
function drawRGBShift() {
  let amount = random(1, 5);
  push();
  translate(-amount, 0, 0);
  fill(255, 0, 0, 100);
  drawMyceliumOutline();
  pop();

  push();
  translate(amount, 0, 0);
  fill(0, 0, 255, 100);
  drawMyceliumOutline();
  pop();
}

// Draw mycelium outline for RGB shift effect
function drawMyceliumOutline() {
  for (let node of mycelium) {
    push();
    translate(node.pos.x, node.pos.y, node.pos.z);
    sphere(node.r * 0.1);
    pop();
  }
}

// Draw moiré pattern effect
function drawMoirePattern() {
  push();
  noLights();
  strokeWeight(0.5);
  stroke(255, 100);

  // Two overlapping patterns creating moiré effect
  let spacing1 = 20 + sin(frameCount * 0.01) * 5;
  let spacing2 = 20 + cos(frameCount * 0.01) * 5;
  let angle1 = frameCount * 0.001;
  let angle2 = frameCount * 0.002;

  // Draw first grid
  push();
  rotateZ(angle1);
  for (let x = -width; x < width; x += spacing1) {
    line(x, -height, x, height);
  }
  pop();

  // Draw second grid
  push();
  rotateZ(angle2);
  for (let x = -width; x < width; x += spacing2) {
    line(x, -height, x, height);
  }
  pop();

  pop();
}

// Display information about the simulation
function displayInfo() {
  push();
  noLights();
  fill(255);
  textSize(12);
  textAlign(LEFT);

  // Reset camera transform for HUD
  camera();
  translate(-width / 2 + 20, -height / 2 + 20);

  text(`Mycelium Nodes: ${mycelium.length}`, 10, 20);
  text(`Nutrients: ${nutrientSources.length}`, 10, 40);
  text(`Decomposers: ${decomposers.length}`, 10, 60);
  text(`Symbiotes: ${symbiotes.length}`, 10, 80);

  pop();
}

// Event handlers
window.mousePressed = function () {
  // Start audio context
  Tone.start();

  // Toggle sound
  playing = !playing;

  if (playing) {
    noiseSynth.start();
    bassSynth.triggerAttackRelease("C2", "8n");
  } else {
    noiseSynth.stop();
  }

  // Record interaction time
  lastInteractionTime = frameCount;
};

window.mouseDragged = function () {
  // Interact with the environment
  let mouseWorldPos = screenToWorld(mouseX, mouseY);

  // Create a new node at mouse position
  if (frameCount % 5 === 0) {
    mycelium.push(
      new MyceliumNode(
        mouseWorldPos.x,
        mouseWorldPos.y,
        mouseWorldPos.z,
        random(20, 40),
        0
      )
    );

    // Play sound for node creation
    if (playing) {
      let note = ["C4", "D4", "E4", "G4", "A4"][floor(random(5))];
      melodySynth.triggerAttackRelease(note, "16n");
    }
  }

  // Record interaction
  lastInteractionTime = frameCount;
  return false; // Prevent default behavior
};

window.keyPressed = function () {
  // Toggle glitch effect with G key
  if (key === "g" || key === "G") {
    glitchEffect = !glitchEffect;
  }

  // Toggle moiré pattern with M key
  if (key === "m" || key === "M") {
    moirePatternActive = !moirePatternActive;
  }

  // Change color scheme with C key
  if (key === "c" || key === "C") {
    const palettes = Object.keys(colorPalettes);
    const currentIndex = palettes.indexOf(currentPalette);
    const nextIndex = (currentIndex + 1) % palettes.length;
    currentPalette = palettes[nextIndex];
  }

  // Adjust simulation speed with + and - keys
  if (key === "+") {
    simulationSpeed = min(simulationSpeed + 0.1, 3);
  }
  if (key === "-") {
    simulationSpeed = max(simulationSpeed - 0.1, 0.1);
  }

  // Record interaction
  lastInteractionTime = frameCount;
};

window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};

// Utility function - convert screen coordinates to world coordinates
function screenToWorld(sx, sy) {
  // Create a rough approximation for WEBGL mode
  let x = map(sx, 0, width, -width / 2, width / 2);
  let y = map(sy, 0, height, -height / 2, height / 2);
  let z = 0;

  return createVector(x, y, z);
}

// 🧠 MyceliumNode class - represents a single node in the mycelium network
class MyceliumNode {
  constructor(x, y, z, r, depth) {
    this.pos = createVector(x, y, z);
    this.r = r;
    this.depth = depth;
    this.angle = p5.Vector.random3D();
    this.life = 0;
    this.maxLife = random(200, 600);
    this.isFractal = false;
    this.nutrientLevel = random(30, 100);

    // Color based on current palette
    const palette = colorPalettes[currentPalette];
    const paletteColor = palette[depth % palette.length];

    this.col = color(
      paletteColor[0] + noise(x * 0.01, y * 0.01, z * 0.01) * 30,
      paletteColor[1] + sin(depth) * 30,
      paletteColor[2] + cos(x * 0.01) * 30,
      paletteColor[3]
    );

    // Connection properties
    this.connections = [];
    this.hasNutrientSource = false;
  }

  update() {
    // Age the node
    this.life++;

    // Move based on growth direction
    if (!this.isFractal) {
      this.pos.add(p5.Vector.mult(this.angle, 0.5 * simulationSpeed));
    }

    // Slightly adjust angle randomly over time
    if (frameCount % 10 === 0 && !this.isFractal) {
      this.angle.rotate(random(-0.1, 0.1));
    }

    // Check for nutrients
    this.checkNutrients();

    // Handle connections
    this.updateConnections();
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    // Different material based on node properties
    if (this.hasNutrientSource) {
      specularMaterial(this.col);
    } else {
      ambientMaterial(this.col);
    }

    // Size fluctuation based on noise
    let sizeFluctuation = noise(this.life * 0.01, this.pos.x * 0.01) * 5;

    // Shape depends on type
    if (this.isFractal) {
      // Structural nodes are more geometric
      box(this.r * 0.1 + sizeFluctuation);
    } else {
      // Regular nodes are organic spheres
      sphere(this.r * 0.1 + sizeFluctuation, 6, 4);
    }

    pop();

    // Draw connections
    this.drawConnections();
  }

  shouldSpawn() {
    // Spawn new nodes based on conditions
    return (
      this.r > 10 &&
      this.life > 30 &&
      this.life < this.maxLife * 0.7 &&
      random() < 0.01 * simulationSpeed &&
      this.nutrientLevel > 20
    );
  }

  spawn() {
    // Create between 1-3 new branches
    let branches = int(random(1, 3));
    let energyPerBranch = this.nutrientLevel / (branches + 1);

    // Create branches
    for (let i = 0; i < branches; i++) {
      // New node inherits properties but with variations
      let child = new MyceliumNode(
        this.pos.x,
        this.pos.y,
        this.pos.z,
        this.r * random(0.6, 0.8), // Slight size variation
        this.depth + 1
      );

      // Direction variation
      child.angle = this.angle.copy();
      child.angle.rotate(random(-PI / 3, PI / 3));

      // Transfer some nutrients to child
      child.nutrientLevel = energyPerBranch;
      this.nutrientLevel -= energyPerBranch;

      // Add to mycelium array
      mycelium.push(child);

      // Create connection
      this.connections.push(mycelium.length - 1);
    }

    // Play sound if active
    if (playing && random() < 0.3) {
      let note = random(["C3", "E3", "G3", "A3"]);
      melodySynth.triggerAttackRelease(note, "16n");
    }
  }

  isDead() {
    // Check if node has reached end of life or run out of nutrients
    return this.life > this.maxLife || this.nutrientLevel <= 0;
  }

  checkNutrients() {
    // Check proximity to nutrient sources
    for (let i = 0; i < nutrientSources.length; i++) {
      let d = p5.Vector.dist(this.pos, nutrientSources[i].pos);

      if (d < nutrientSources[i].size) {
        // Transfer nutrients
        let transfer = min(2, nutrientSources[i].energy);
        this.nutrientLevel += transfer;
        nutrientSources[i].energy -= transfer;

        this.hasNutrientSource = true;

        // Play absorption sound occasionally
        if (playing && random() < 0.05) {
          let note = ["C5", "E5", "G5"][floor(random(3))];
          melodySynth.triggerAttackRelease(note, "32n");
        }
      }
    }

    // Slowly consume nutrients over time
    this.nutrientLevel -= 0.1 * simulationSpeed;
  }

  updateConnections() {
    // Remove connections to dead nodes
    for (let i = this.connections.length - 1; i >= 0; i--) {
      let connectedIndex = this.connections[i];
      if (connectedIndex >= mycelium.length) {
        this.connections.splice(i, 1);
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

// 🌱 NutrientSource class - represents resources in the environment
class NutrientSource {
  constructor(x, y, z) {
    this.pos = createVector(x, y, z);
    this.energy = random(50, 200);
    this.size = map(this.energy, 0, 200, 10, 40);
    this.oscillation = random(TWO_PI);
    this.decayRate = random(0.01, 0.05);
  }

  update() {
    // Slow decay of energy
    this.energy -= this.decayRate * simulationSpeed;

    // Update size based on remaining energy
    this.size = map(this.energy, 0, 200, 5, 40);

    // Slight movement/oscillation
    this.oscillation += 0.01;

    // Replenish occasionally
    if (random() < 0.001 && this.energy < 50) {
      this.energy += random(10, 30);
    }
  }

  display() {
    // Only display if has energy left
    if (this.energy <= 0) return;

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    // Glow effect
    ambientLight(0, 50, 0);
    pointLight(0, 150, 50, 0, 0, 0);

    // Oscillating transparency
    let alpha = map(sin(this.oscillation), -1, 1, 100, 200);

    // Nutrient appearance
    specularMaterial(0, 255, 100, alpha);
    noStroke();

    // Oscillating size
    let displaySize = this.size * (1 + sin(this.oscillation) * 0.1);
    sphere(displaySize, 8, 8);

    pop();
  }
}

//
