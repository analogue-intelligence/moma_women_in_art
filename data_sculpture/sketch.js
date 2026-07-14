let data;

let state = "field";       // "field", "year", "star", or "transitioning"
let selectedYear = null;   // holds the year's data object once clicked
let starPositions = [];
let selectedStar = null;

async function setup() {
  createCanvas(1200, 800);

  try {
    data = await loadJSON('https://analogue-intelligence.github.io/moma_women_in_art/data_sculpture/data/moma_constellations.json');
    console.log("Data successfully loaded!");
    console.log(data.years.length);
    for (let yearData of data.years) {
      yearData.twinklePhase = random(TWO_PI);   // random starting point in the wave
      yearData.twinkleSpeed = random(0.001, 0.003);
      yearData.revealDelay = random(0, 500);
    }

  } catch (err) {
    console.error("Failed to load JSON file. Check your file path or local server.", err);
  }
}

function draw() {
  background(10);

  if (transitioning) {
    handleTransition();
  } else if (state === "field") {
    drawField();
  } else if (state === "year") {
    drawYearView();
  } else if (state === "star") {
    drawStarDetail();
  }
  // fullscreen(true);

}

function drawField() {
  cursor(ARROW);
  for (let yearData of data.years) {
    let x = map(yearData.year, 1929, 2026, 50, width - 50);
    let y = map(yearData.pct_women, 0, 1, height - 50, 50);
    let brightness = map(yearData.pct_american, 0, 1, 60, 255);

    let twinkle = sin(millis() * yearData.twinkleSpeed + yearData.twinklePhase);
    let sizeMod = map(twinkle, -1, 1, -2, 2);
    let alphaMod = map(twinkle, -1, 1, -25, 25);

    let isHovered = dist(mouseX, mouseY, x, y) < 10;

    if (isHovered) {
      noStroke();
      // fill(241,154,200, 40);
      fill(235, 83, 159, 40);
      ellipse(x, y, 30, 30);   // soft outer glow
      // fill(241,154,200, 80);
      fill(235, 83, 159, 80);
      ellipse(x, y, 20, 20);   // tighter glow layer
      cursor(HAND);            // visual cue: this is clickable

      // fill(241,154,200);
      fill(235, 83, 159);
      textAlign(LEFT);
      textSize(22);
      text(yearData.year, x + 15, y);
    }

    drawTitle();

    fill(241,154,200, constrain(brightness + alphaMod, 0, 255));
    noStroke();
    let baseSize = isHovered ? 20 : 12;
    ellipse(x, y, baseSize + sizeMod, baseSize + sizeMod);
  }
  drawLegend()
}

function drawTitle() {
  fill(235, 83, 159);
  textAlign(RIGHT);
  textSize(50);
  textFont("monospace");
  textStyle(BOLD);
  text("Women in \n MoMA's \n Collection", width - 30, 70);
}

function drawLegend() {
  fill(235, 83, 159);
  textAlign(LEFT, TOP);
  textSize(14);
  text("↑ vertical position: % acquisitions including a woman artist", 20,  90);
  text("● brightness: % acquisitions including a US artist", 20, 70);
}


let transitioning = false;
let transitionStart = 0;
let transitionDuration = 1000;
let transitionPhase = "out";   // "out" = zooming in + fading to black, "in" = fading in new view
let pendingState = null;
let pendingYear = null;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function mousePressed() {
  if (transitioning) return;
  if (state === "field") {
    for (let yearData of data.years) {
      let x = map(yearData.year, 1929, 2026, 50, width - 50);
      let y = map(yearData.pct_women, 0, 1, height - 50, 50);
      // let d = dist(mouseX, mouseY, x, y);
      if (dist(mouseX, mouseY, x, y) < 10) {   // forgiving for imprecise clicks
        // startTransition("year", yearData);
        // selectedYear = yearData;
        // state = "year";
        // generateStarLayout();   // see below
        startTransition("year", drawField, drawYearView, yearData);
        return;
      }
    }
  } else if (state === "year") {
    for (let s of starPositions) {
      if (dist(mouseX, mouseY, s.x, s.y) < 12) {
        // selectedStar = s;
        // state = "star";
        startTransition("star", drawYearView, drawStarDetail, s);
        return;
      }
    }
    // clicked empty space in year view — go back to field
    // state = "field";
    // selectedYear = null;
    startTransition("field", drawYearView, drawField, null);
  } else if (state === "star") {
    // clicked anywhere while viewing a star — go back to year view
    // state = "year";
    // selectedStar = null;
    startTransition("year", drawStarDetail, drawYearView, selectedYear);
  }
}

function generateStarLayout() {
  starPositions = [];
  for (let artist of selectedYear.sample_artists) {
    let sx = random(100, width - 100);
    let sy = random(100, height - 100);
    let spd =  random(0.2, 1.0);
    starPositions.push({ x: sx, y: sy, artist: artist, spd: spd });
  }
}

function drawYearView() {
  cursor(ARROW);
  // fill(241,154,200);
  fill(235, 83, 159);
  textAlign(LEFT);
  textSize(70);
  textFont("sans-serif");
  textStyle(BOLD);
  text(selectedYear.year, 20, 40);

  // let t = millis() * 0.0001;

  for (let s of starPositions) {
    let isHovered = dist(mouseX, mouseY, s.x, s.y) < 12;

    if (isHovered) {
      noStroke();
      fill(241,154,200, 50);
      ellipse(s.x, s.y, 24, 24);
      cursor(HAND);

      fill(241,154,200);
      textAlign(LEFT);
      textSize(12);
      text(s.artist.Artist, s.x + 15, s.y);
    }

    // let nx = noise(s.x + t * s.spd);
    // console.log(s.pct_american);
    // let dx = map(nx, 0, 1, -80, 80);

    // let ny = noise(s.y + t * s.spd);
    // console.log(s.pct_american);
    // let dy = map(nx, 0, 1, -80, 80);

    fill(241,154,200);
    noStroke();
    ellipse(s.x, s.y, isHovered ? 12 : 8, isHovered ? 12 : 8);
  }
}


let currentImage = null;
let currentImageURL = null;

function drawStarDetail() {
  let artist = selectedStar.artist;
  fill(241,154,200);
  textAlign(CENTER);
  textSize(20);
  // text(artist.Title, width / 2, height / 2 - 40);
  textSize(14);


  if (artist.ImageURL && artist.ImageURL !== "") {
    if (artist.ImageURL && artist.ImageURL !== currentImageURL) {
      currentImageURL = artist.ImageURL;
      currentImage = null;   // clear old one while new one loads
      loadImage(artist.ImageURL, (img) => { currentImage = img; });
    }

    if (currentImage) {
      image(currentImage, width / 2 - 150, 60, 300, 300);
    }

    let boxWidth = 500;
    let boxX = width / 2 - boxWidth / 2;

    fill(241,154,200);
    textAlign(CENTER);
    textSize(18);
    text(artist.Title, boxX, 390, boxWidth, 40);       // x, y, w, h — w/h enables wrapping

    textSize(13);
    text(artist.Artist, boxX, 440, boxWidth, 40);

    textSize(11);
    text(artist.Nationality, boxX, 480, boxWidth, 40);
  } else {
    text(artist.Artist + " (" + artist.Nationality + ")", width / 2, height / 2);
    noFill();
    stroke(241,154,200);
    ellipse(width / 2, height / 2 + 100, 100, 100);
    noStroke();
    fill(241,154,200);
    textSize(12);
    text("No image available", width / 2, height / 2 + 100);
  }
}





let fromDraw = null;
let toDraw = null;

function startTransition(toState, fromFn, toFn, yearOrStar) {
  transitioning = true;
  transitionPhase = "out";
  transitionStart = millis();
  pendingState = toState;
  pendingData = yearOrStar;
  fromDraw = fromFn;
  toDraw = toFn;
}


// function handleTransition() {
//   let elapsed = millis() - transitionStart;
//   let t = constrain(elapsed / transitionDuration, 0, 1);
//   let eased = easeInOutQuad(t);

//   if (transitionPhase === "out") {
//     drawField();   // keep showing the old view while it fades
//     fill(10, eased * 255);   // black overlay, increasing opacity
//     noStroke();
//     rect(0, 0, width, height);

//     if (t >= 1) {
//       // switch the actual state now that screen is fully black
//       state = pendingState;
//       selectedYear = pendingYear;
//       generateStarLayout();
//       transitionPhase = "in";
//       transitionStart = millis();   // reset timer for phase 2
//     }
//   } else if (transitionPhase === "in") {
//     drawYearView();
//     fill(10, (1 - eased) * 255);   // black overlay, decreasing opacity
//     noStroke();
//     rect(0, 0, width, height);

//     if (t >= 1) {
//       transitioning = false;
//     }
//   }
// }

function handleTransition() {
  let elapsed = millis() - transitionStart;
  let t = constrain(elapsed / transitionDuration, 0, 1);
  let eased = easeInOutQuad(t);

  if (transitionPhase === "out") {
    fromDraw();
    fill(241,154,200, eased * 255);
    noStroke();
    rect(0, 0, width, height);
    if (t >= 1) {
      applyPendingState();   // moved the state-switching logic here, see below
      transitionPhase = "in";
      transitionStart = millis();
    }
  } else {
    if (toDraw === drawField) {
      drawFieldWithReveal(elapsed);   // new function, see below
    } else {
      toDraw();
    }
    fill(241,154,200, (1 - eased) * 255);
    noStroke();
    rect(0, 0, width, height);
    if (t >= 1) transitioning = false;
  }
}

// function applyPendingState() {
//   state = pendingState;
//   if (pendingState === "year") {
//     selectedYear = pendingData;
//     generateStarLayout();
//   } else if (pendingState === "star") {
//     selectedStar = pendingData;
//   }
//   // pendingState === "field" needs no extra setup
// }

function applyPendingState() {
  state = pendingState;
  if (pendingState === "year") {
    if (selectedYear !== pendingData) {
      selectedYear = pendingData;
      generateStarLayout();
    }
  } else if (pendingState === "star") {
    selectedStar = pendingData;
  }
}

function drawFieldWithReveal(elapsedSinceReveal) {
  cursor(ARROW);
  for (let yearData of data.years) {
    let revealProgress = constrain((elapsedSinceReveal - yearData.revealDelay) / 200, 0, 1);
    if (revealProgress <= 0) continue;   // hasn't started appearing yet

    let x = map(yearData.year, 1929, 2026, 50, width - 50);
    let y = map(yearData.pct_women, 0, 1, height - 50, 50);
    let brightness = map(yearData.pct_american, 0, 1, 60, 255);
    let twinkle = sin(millis() * yearData.twinkleSpeed + yearData.twinklePhase);
    let sizeMod = map(twinkle, -1, 1, -2, 2);

    fill(241,154,200, constrain(brightness * revealProgress, 0, 255));
    noStroke();
    ellipse(x, y, 12 + sizeMod, 12 + sizeMod);
  }
}