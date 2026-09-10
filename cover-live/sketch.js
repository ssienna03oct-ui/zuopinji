const CANVAS_W = 1920;
const CANVAS_H = 1080;
// Opening bubble-breathing and floating stage.
const INTRO_END = 5.0;
const BUBBLE_END = 6.25;
const LETTER_END = 4.78;
const HOUSE_END = 6.35;
const CONTENT_END = 7.18;
const FINAL_END = 8.05;
const HOLD_END = 8.2;

let miSansLight;
let animationStart = 0;
const taps = [-9999,-9999,-9999,-9999];
const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;

function preload() {
  miSansLight = 'MiSans Light';
}

function setup() {
  const logoCanvas = createCanvas(CANVAS_W, CANVAS_H);
  logoCanvas.parent('canvas-shell');
  pixelDensity(1);
  frameRate(60);
  textFont('Arial');
  strokeCap(ROUND);
  strokeJoin(ROUND);
  animationStart = millis();
  if (quiet) animationStart -= 9000;
  parent.postMessage({type:'cover-ready'}, '*');
}

function draw() {
  background(255);
  const t = Math.min(8.2, (millis() - animationStart) / 1000);
  // Letter construction overlaps the bubble arrivals instead of waiting for
  // all four bubbles to finish.
  const letterP = smoothStep(2.38, 4.75, t);

  // One restrained camera move controls the entire composition. The scene
  // begins slightly closer and eases back to the exact 1920 × 1080 layout.
  beginSceneCamera(t);

  if (t < INTRO_END) {
    drawVectorIntro(t);
    drawGrowingLetters(letterP, 0, 1, 0);
    endSceneCamera();
    return;
  }

  const bubbleP = smoothStep(INTRO_END, BUBBLE_END, t);
  drawBubbleArrival(bubbleP);

  const revisedLetterShift = smoothStep(LETTER_END, FINAL_END, t);
  // Keep the original p stem. Only its later downward extension is removed.
  drawGrowingLetters(letterP, revisedLetterShift, 1, bubbleP);

  // The house begins while the impact wave is still travelling through the
  // wordmark, creating one continuous transition instead of two stages.
  const houseStart = 4.72;
  const houseP = clampValue((t - houseStart) / (HOUSE_END - houseStart), 0, 1);
  drawHouseConstruction(houseP, revisedLetterShift);

  const contentP = smoothStep(HOUSE_END - 0.1, CONTENT_END, t);
  drawDescendingContent(contentP);

  const finalP = smoothStep(CONTENT_END - 0.1, FINAL_END, t);
  drawFinalCopy(finalP);

  endSceneCamera();

  if (t >= HOLD_END && taps.every(tap => millis() - tap > 350)) {
    noLoop();
    parent.postMessage({type:'cover-complete'}, '*');
  }
}

// 提供给网页按钮和视频录制器使用；按钮本身不画进视频画面。
function restartCoverAnimation() {
  animationStart = millis();
  parent.postMessage({type:'cover-playing'}, '*');
  if (quiet) animationStart -= 9000;
  loop();
}

function coverAnimationDurationMs() {
  return HOLD_END * 1000;
}

function beginSceneCamera(t) {
  const zoomOutP = smoothStep(BUBBLE_END - 0.35, BUBBLE_END + 0.2, t);
  const cameraScale = lerp(1.105, 1, easeInOutCubic(zoomOutP));
  const cameraY = lerp(14, 0, easeInOutCubic(zoomOutP));
  push();
  translate(CANVAS_W / 2, CANVAS_H / 2 + cameraY);
  scale(cameraScale);
  translate(-CANVAS_W / 2, -CANVAS_H / 2);
}

function endSceneCamera() {
  pop();
}

function drawVectorIntro(t) {
  const source = [930, 675];
  const targets = [[372,350,80],[558,350,80],[993,716,91],[1382,716,91]];
  const controls = [
    [[790,555],[535,350]],
    [[875,500],[690,320]],
    [[930,650],[965,700]],
    [[1060,650],[1260,690]]
  ];
  // The launches overlap, so the next bubble begins while the previous one
  // is still floating through the canvas.
  const starts = [0.15, 0.88, 1.61, 2.34];
  const flightDuration = 2.25;

  // Blow four separate bubbles in the same order as the four target rings.
  for (let i = 0; i < 4; i++) {
    const localTime = t - starts[i];
    if (localTime < 0) continue;

    const flightP = clampValue(localTime / flightDuration, 0, 1);
    const travelP = easeInOutCubic(flightP);
    const target = targets[i];
    const bubblePosition = cubicBezierPoint(
      source, controls[i][0], controls[i][1], [target[0], target[1]], travelP
    );
    const airDrift = sin(flightP * PI) * sin(localTime * 3.1 + i * 1.3);
    bubblePosition[0] += airDrift * (10 + i * 2);
    bubblePosition[1] += sin(flightP * TWO_PI + i) * 5 * sin(flightP * PI);

    const inflateP = smoothStep(0, 0.5, localTime);
    const radius = lerp(3, target[2], easeOutCubic(inflateP));
    const pulse = 1 + sin(localTime * 3.5 + i) * 0.045 * (1 - flightP);
    const stretch = 1 + sin(flightP * PI) * 0.075;

    push();
    translate(bubblePosition[0], bubblePosition[1]);
    scale(1 / stretch, stretch);
    stroke(78, 235);
    strokeWeight(1.9);
    noFill();
    drawLooseCircle(0, 0, radius * pulse, 0.028 * (1 - flightP), t + i * 1.7);
    pop();
  }
}

function drawLooseCircle(cx,cy,r,wobble,timeValue) {
  beginShape();
  const count = 64;
  for (let i=0;i<=count;i++) {
    const a = i/count*TWO_PI;
    const variation = 1 + sin(a*3+timeValue*1.6)*wobble + sin(a*5-timeValue)*wobble*.45;
    vertex(cx+cos(a)*r*variation,cy+sin(a)*r*variation);
  }
  endShape(CLOSE);
}

function drawBubbleArrival(p) {
  const targets = [[372,350,80],[558,350,80],[993,716,91],[1382,716,91]];
  // The bubbles are already at their destinations; now they settle into the
  // exact artboard-one ring shapes.
  for (let i = 0; i < targets.length; i++) {
    const localP = clampValue((p - i * 0.035) / 0.895, 0, 1);
    const breathing = 1 + sin(localP * PI * 4 + i * 0.8) * 0.045 * (1 - localP);
    drawMorphingBubble(targets[i][0], targets[i][1], targets[i][2] * breathing, localP, i);
  }
}

function drawMorphingBubble(x, y, r, p, seed) {
  push();
  noFill();
  stroke(15, 235);
  strokeWeight(1.35);
  translate(x, y);
  const age = (millis() - taps[seed]) / 1000;
  if (!quiet && age >= 0 && age < .3) {
    const phase = age / .3;
    const bounce = sin(phase * TWO_PI) * (1 - phase);
    translate(0, -sin(phase * PI) * 7);
    scale(1 + bounce * .14, 1 - bounce * .14);
  }

  // The circular letter receives the same horizontal impact as the straight
  // letterforms, so the wave reads across the complete wordmark.
  const ringImpact = sin(p * PI * 5) * pow(1 - p, 2.1);
  scale(1 + ringImpact * 0.13, 1 - ringImpact * 0.065);

  // A soft organic outline gradually loses its wobble as it becomes the O.
  const settle = smoothStep(0.58, 1, p);
  const wobbleAmount = (1 - settle) * r * 0.065;
  const verticalStretch = 1 + (1 - settle) * 0.09;
  beginShape();
  const pointCount = 72;
  for (let j = 0; j <= pointCount; j++) {
    const a = j / pointCount * TWO_PI;
    const wave = sin(a * 3 + seed * 1.7 + p * 5) * 0.65 + sin(a * 5 - p * 3) * 0.35;
    const rr = r + wave * wobbleAmount;
    vertex(cos(a) * rr, sin(a) * rr * verticalStretch);
  }
  endShape(CLOSE);

  // The inner circle grows only when the floating bubble is almost settled.
  const innerP = smoothStep(0.62, 1, p);
  if (innerP > 0) {
    const innerRadius = r * lerp(0.12, 0.8, easeOutCubic(innerP));
    stroke(15, 235 * innerP);
    circle(0, 0, innerRadius * 2);
  }
  pop();
}

function drawGrowingLetters(p, revisedShift, pStemVisibility, waterProgress) {
  push();
  // The original p stem inflates with the same visual language as every
  // other letter and then remains in place.
  drawInflatingLetter(() => {
    noStroke();
    fill(5, 255 * pStemVisibility);
    rect(280, 271, 15, 535);
  }, 287.5, 806, staggeredLetterP(p, 0), waterProgress, 0);

  // The remaining letters inflate in a short stagger.
  push();
  translate(lerp(0, -4, revisedShift), lerp(0, -4, revisedShift));
  drawInflatingLetter(() => {
    noStroke(); fill(5); rect(668, 272, 14, 163);
    drawRShoulder();
  }, 708, 435, staggeredLetterP(p, 1), waterProgress, 1);
  drawInflatingLetter(drawLetterT, 826, 428, staggeredLetterP(p, 2), waterProgress, 2);
  drawInflatingLetter(drawLetterF, 815, 804, staggeredLetterP(p, 3), waterProgress, 3);
  pop();
  drawInflatingLetter(drawLetterL, 1160, 798, staggeredLetterP(p, 4), waterProgress, 4);
  drawInflatingLetter(() => {
    noStroke(); fill(5); rect(1250, 584, 17, 220);
  }, 1258.5, 804, staggeredLetterP(p, 5), waterProgress, 5);
  pop();
}

function staggeredLetterP(overallP, index) {
  const start = index * 0.09;
  return clampValue((overallP - start) / 0.46, 0, 1);
}

function drawInflatingLetter(drawLetterFunction, pivotX, pivotY, progressValue, waterProgress, rippleIndex) {
  if (progressValue <= 0) return;
  const eased = easeOutCubic(progressValue);
  const widthScale = lerp(0.28, 1, eased);
  const heightScale = lerp(0.06, 1, easeInOutCubic(progressValue));
  // A damped impact travels horizontally across the letters. The bottom
  // pivots stay fixed: there is no up-and-down floating.
  const delayedWater = clampValue((waterProgress - rippleIndex * 0.045) / 0.775, 0, 1);
  const localWave = sin(delayedWater * PI * 5) * pow(1 - delayedWater, 2.1);
  const impactWidth = 1 + localWave * 0.17;
  const impactHeight = 1 - localWave * 0.08;
  push();
  translate(pivotX, pivotY);
  scale(widthScale * impactWidth, heightScale * impactHeight);
  translate(-pivotX, -pivotY);
  drawLetterFunction();
  pop();
}

function drawRShoulder() {
  noFill(); stroke(5); strokeWeight(14); strokeCap(SQUARE);
  bezier(675, 350, 675, 302, 706, 280, 748, 280);
}

function drawLetterT() {
  noFill(); stroke(5); strokeWeight(15); strokeCap(SQUARE);
  line(806, 272, 806, 369); line(774, 303, 879, 303);
  bezier(806, 369, 806, 408, 832, 428, 878, 428);
}

function drawLetterF() {
  noFill(); stroke(5); strokeWeight(16); strokeCap(SQUARE);
  line(796, 804, 796, 580); line(757, 614, 874, 614);
  bezier(796, 584, 796, 541, 818, 521, 861, 521);
}

function drawLetterL() {
  noFill(); stroke(5); strokeWeight(16); strokeCap(SQUARE);
  line(1120, 511, 1120, 726);
  bezier(1120, 726, 1120, 774, 1148, 798, 1204, 798);
}

function drawHouseConstruction(p, artboardShift) {
  push();
  // The complete house moves exactly from its artboard-three coordinates to
  // its artboard-four coordinates; no individual region is reshaped.
  translate(lerp(0, -7.3814, artboardShift), lerp(0, -4.6473, artboardShift));
  stroke(15); strokeWeight(1.01); noFill();
  // Exact roof-board paths extracted from artboard three.
  const leftRoof = [
    [1411.0039,363.3519],[931.9369,486.9169],
    [927.2029,463.3609],[1406.2699,339.7969],[1411.0039,363.3519]
  ];
  const rightRoof = [
    [1382.3217,370.7498],[1347.9677,379.6108],
    [1645.7077,505.2838],[1652.4547,484.7698],[1382.3217,370.7498]
  ];
  drawClosedBezierOutline(leftRoof, segmentProgress(p, 0, 7));
  drawClosedBezierOutline(rightRoof, segmentProgress(p, 1, 7));

  // Illustrator 中屋脊交接处保留的原始微小闭合路径。
  const ridgeJoin = [
    [1345.8867,355.3710],[1345.6167,355.2570],
    [1345.5507,355.4580],[1345.8867,355.3710]
  ];
  drawClosedBezierOutline(ridgeJoin, segmentProgress(p, 1, 7));

  // House body follows the exact open outline in the AI: left wall stops at
  // the lower O; the right wall continues to the baseline and turns left.
  strokeWeight(1.21);
  drawBezierStrokeProgress(
    [[990.0616,473.5272],[990.0616,520],[990.0616,578],[990.0616,627.2412]],
    segmentProgress(p, 2, 7)
  );
  // Begin exactly at the underside of the right eave. Only the former part
  // that penetrated the eave is removed; the wall remains fully connected.
  strokeWeight(1.19);
  drawBezierStrokeProgress(
    [[1593.6693,483.3193],[1593.6693,590],[1593.6693,700],[1593.6693,806.4263]],
    segmentProgress(p, 3, 7)
  );
  drawBezierStrokeProgress(
    [[1593.6693,806.4263],[1546,806.4263],[1490,806.4263],[1436.7413,806.4263]],
    segmentProgress(p, 4, 7)
  );

  const detailP = segmentProgress(p, 4, 7);
  if (detailP > 0) {
    drawEaveHatching(detailP);
    drawExactHouseWindow(detailP);
    // Exact thin outlined i-dot from artboard three.
    stroke(15, 255 * detailP);
    strokeWeight(1.21);
    noFill();
    drawEllipseProgress(1256.0952, 530.0884, 19.1185, 18.702, detailP);
  }
  pop();
}

function drawEaveHatching(p) {
  const visibleCount = floor(74 * p);
  stroke(15);
  strokeWeight(0.475);

  // Exact Illustrator clipping polygon and 74-line hatch on the left roof.
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(990.061,473.527);
  drawingContext.lineTo(1019.376,483.009);
  drawingContext.lineTo(1392.282,398.316);
  drawingContext.lineTo(1347.967,379.611);
  drawingContext.closePath();
  drawingContext.clip();
  for (let i = 0; i < visibleCount; i++) {
    const x1 = 1051.8754 + i * 5.6948;
    line(x1,253.9235,x1-199.82,592.9895);
  }
  drawingContext.restore();

  // Exact Illustrator clipping polygon and hatch on the right roof.
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.moveTo(1378.486,405.13);
  drawingContext.lineTo(1593.67,513.704);
  drawingContext.lineTo(1593.67,483.32);
  drawingContext.lineTo(1384.45,395.01);
  drawingContext.closePath();
  drawingContext.clip();
  for (let i = 0; i < visibleCount; i++) {
    const x1 = 1655.6472 + i * 5.059;
    const y1 = 196.2392 + i * 2.61494;
    line(x1,y1,x1-333.201,y1+209.454);
  }
  drawingContext.restore();
  strokeWeight(1.19);
}

function drawExactHouseWindow(p) {
  if (p <= 0) return;
  // Reveal the two exact filled paths extracted from artboard three: a black
  // arch with a white inset. The final silhouette is identical to the AI.
  const revealP = easeInOutCubic(p);
  drawingContext.save();
  drawingContext.beginPath();
  const revealTop = lerp(574, 500, revealP);
  drawingContext.rect(1488, revealTop, 52, 575 - revealTop);
  drawingContext.clip();

  noStroke();
  fill(5);
  drawPdfPath(1534.8842,507.9239,[0,0],[
    ['L',-42.464,0],
    ['L',-42.464,46.896],
    ['C',-42.464,58.622,-32.958,68.128,-21.232,68.128],
    ['C',-9.506,68.128,0,58.622,0,46.896]
  ],true);

  // 白色内轮廓同样直接使用 AI 的原始锚点与控制柄，不再重算圆角。
  fill(255);
  drawPdfPath(1493.3696,555.7693,[0,0],[
    ['C',0,0,5.306,18.026,21.232,16.030],
    ['C',37.157,14.034,38.890,0.544,38.890,0.544],
    ['L',38.890,-46.896],
    ['L',0,-46.896]
  ],true);
  drawingContext.restore();
}

function drawDescendingContent(p) {
  // The former downward extension of the p stem has been removed.
  noStroke(); fill(10);
  drawRiseText('视觉设计', 340, 582, 40, 700, itemProgress(p, .16, .43));
  const items = ['01. BRAND DESIGN','02.IP DESIGN','03.ILLUSTRATION DESIGN','04.PERSONAL WORKS'];
  items.forEach((s, i) => drawRiseText(s, 346, 709 + i*35, 23, 400, itemProgress(p, .34+i*.08, .62+i*.08)));
  drawTree(itemProgress(p, .55, 1));
}

function drawTree(p) {
  stroke(15); strokeWeight(1.25); noFill();
  drawLineProgress(1652,806,1652,749,itemProgress(p,0,.5));
  drawEllipseProgress(1652,749,20,11,itemProgress(p,.25,.78));
  drawEllipseProgress(1652,728,20,11,itemProgress(p,.48,1));
}

function drawFinalCopy(p) {
  fill(15); noStroke();
  // Keep the decorative marks, without the top and bottom text captions.
  drawExactFooterMark(itemProgress(p,.2,.72));
  const dotP = itemProgress(p,.55,1);
  fill(217,217,217,255*dotP); ellipse(1817,76,58,42);
}

function drawRiseText(s,x,y,size,weight,p) {
  if (p <= 0) return;
  push();
  noStroke();
  if (weight < 700) {
    fill(0, 255 * smoothStep(0, 0.72, p));
    textStyle(NORMAL);
    if (miSansLight) textFont(miSansLight);
  } else {
    fill(10, 255 * smoothStep(0, 0.72, p));
    textStyle(BOLD);
  }
  textSize(size);
  revealTextLeftToRight(s, x, y, p);
  pop();
}

function drawSlideText(s,x,y,size,p) {
  if (p <= 0) return;
  push();
  noStroke(); fill(0,255*smoothStep(0,0.72,p)); textStyle(NORMAL);
  if (miSansLight) textFont(miSansLight);
  textSize(size);
  revealTextLeftToRight(s,x,y,p);
  pop();
}

function revealTextLeftToRight(s, x, y, p) {
  const revealP = easeInOutCubic(p);
  const fullWidth = textWidth(s) + 4;
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x - 2, y - textAscent() - 4, fullWidth * revealP, textAscent() + textDescent() + 8);
  drawingContext.clip();
  text(s, x, y);
  drawingContext.restore();
}

function drawExactFooterMark(p) {
  if (p <= 0) return;
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(92, 940, 82 * easeInOutCubic(p), 105);
  drawingContext.clip();
  noFill();
  stroke(15, 255 * smoothStep(0, 0.72, p));
  strokeWeight(0.849);

  // Exact paths extracted from artboard 4 of 封面动画.ai.
  drawPdfPath(142.3719,121.2898,[0,0],[
    ['C',-3.9,0,-7.061,1.717,-7.061,3.835],
    ['C',-7.061,5.953,-3.9,7.67,0,7.67],
    ['C',3.9,7.67,7.061,5.953,7.061,3.835],
    ['C',7.061,1.717,3.9,0,0,0]
  ],true);
  drawPdfPath(142.3719,113.5714,[0,0],[
    ['C',-3.9,0,-7.061,1.717,-7.061,3.835],
    ['C',-7.061,5.953,-3.9,7.67,0,7.67],
    ['C',3.9,7.67,7.061,5.953,7.061,3.835],
    ['C',7.061,1.717,3.9,0,0,0]
  ],true);
  drawPdfPath(142.3719,113.5881,[0,0],[['L',0,-16.743]],false);

  drawPdfPath(159.9252,96.9089,[0,0],[
    ['C',-3.05,0,-5.522,7.155,-5.522,15.981],
    ['C',-5.522,24.808,-3.05,31.963,0,31.963],
    ['C',3.05,31.963,5.522,24.808,5.522,15.981],
    ['C',5.522,7.155,3.05,0,0,0]
  ],true);
  drawPdfPath(156.3902,112.3116,[0,0],[['L',9.057,0]],false);

  drawPdfPath(107.8708,62.8446,[0,0],[
    ['C',-1.438,0,-2.536,2.359,-2.454,5.27],
    ['C',-2.372,8.18,-1.14,10.54,.298,10.54],
    ['C',1.735,10.54,2.834,8.18,2.752,5.27],
    ['C',2.67,2.359,1.438,0,0,0]
  ],true);
  drawPdfPath(122.0852,62.8446,[0,0],[
    ['C',-1.438,0,-2.536,2.359,-2.454,5.27],
    ['C',-2.372,8.18,-1.14,10.54,.298,10.54],
    ['C',1.735,10.54,2.834,8.18,2.752,5.27],
    ['C',2.67,2.359,1.438,0,0,0]
  ],true);

  drawPdfPath(104.8327,88.2652,[0,0],[['L',21.203,0]],false);
  drawPdfPath(100.7395,80.2105,[0,0],[['L',0,-23.953]],false);
  drawPdfPath(100.7395,80.2105,[0,0],[['L',29.39,0],['L',29.39,-23.953]],false);
  drawPdfPath(115.4727,88.7033,[0,0],[['L',.038,-32.917]],false);

  drawPdfPath(149.5483,56.3183,[0,0],[
    ['C',0,11.488,3.559,20.8,7.949,20.8],
    ['C',12.34,20.8,15.899,11.488,15.899,0]
  ],false);
  drawPdfPath(151.844,64.1555,[0,0],[['L',11.79,0]],false);
  drawPdfPath(151.844,79.1898,[0,0],[['L',11.79,0]],false);
  drawPdfPath(151.844,82.1015,[0,0],[['L',11.79,0]],false);
  drawPdfPath(151.844,85.7903,[0,0],[['L',11.79,0]],false);

  drawPdfPath(142.3719,56.1332,[0,0],[
    ['C',-2.594,0,-4.697,7.213,-4.697,16.112],
    ['C',-4.697,25.01,-2.594,32.223,0,32.223],
    ['C',2.594,32.223,4.697,25.01,4.697,16.112],
    ['C',4.697,7.213,2.594,0,0,0]
  ],true);
  drawPdfPath(139.3648,72.2448,[0,0],[['L',7.704,0]],false);
  drawPdfPath(157.7388,88.3564,[0,0],[['L',0,-12.097]],false);

  drawPdfPath(130.9162,126.4921,[0,0],[
    ['C',0,-1.382,-2.317,-2.502,-5.175,-2.502],
    ['C',-8.033,-2.502,-10.351,-1.382,-10.351,0],
    ['C',-10.351,1.382,-8.033,2.502,-5.175,2.502],
    ['C',-2.317,2.502,0,1.382,0,0]
  ],true);
  drawPdfPath(118.6737,113.825,[0,0],[
    ['C',0,-1.417,-2.958,-2.566,-6.606,-2.566],
    ['C',-10.255,-2.566,-13.213,-1.417,-13.213,0],
    ['C',-13.213,1.417,-10.255,2.566,-6.606,2.566],
    ['C',-2.958,2.566,0,1.417,0,0]
  ],true);
  drawPdfPath(130.964,96.8795,[0,0],[['L',-5.26,13.122]],false);
  drawPdfPath(125.809,97.1568,[0,0],[['L',-.068,26.581]],false);
  drawPdfPath(120.3861,128.9064,[0,0],[['L',-19.813,0],['L',-19.817,-32.009],['L',.748,-32.009]],false);
  drawPdfPath(103.5346,123.8697,[0,0],[['L',6.559,-7.479]],false);
  drawPdfPath(114.9833,110.1991,[0,0],[['L',6.151,-6.621]],false);
  drawingContext.restore();
  pop();
}

function drawPdfPath(baseX, baseY, start, commands, closePath) {
  beginShape();
  let currentX = start[0];
  let currentY = start[1];
  vertex(baseX + currentX, CANVAS_H - (baseY + currentY));
  for (const cmd of commands) {
    if (cmd[0] === 'L') {
      currentX = cmd[1];
      currentY = cmd[2];
      vertex(baseX + currentX, CANVAS_H - (baseY + currentY));
    } else if (cmd[0] === 'C') {
      // p5.js 2.x has a Shape/Path2D compatibility issue with dynamic
      // bezierVertex() calls. Sample the exact cubic Bezier instead. This
      // preserves the AI control points and works in both p5 1.x and 2.x.
      const a = [currentX, currentY];
      const b = [cmd[1], cmd[2]];
      const c = [cmd[3], cmd[4]];
      const d = [cmd[5], cmd[6]];
      const curveSteps = 24;
      for (let i = 1; i <= curveSteps; i++) {
        const curvePoint = cubicBezierPoint(a, b, c, d, i / curveSteps);
        vertex(baseX + curvePoint[0], CANVAS_H - (baseY + curvePoint[1]));
      }
      currentX = cmd[5];
      currentY = cmd[6];
    }
  }
  if (closePath) endShape(CLOSE);
  else endShape();
}

function drawReplayButton() {
  push(); noFill(); stroke(20,80); strokeWeight(1); rect(1740,1012,130,42,21);
  noStroke(); fill(20,110); textAlign(CENTER,CENTER); textSize(17); textStyle(NORMAL); text('重新播放',1805,1033); pop();
}

function mousePressed() {
  // Accessible buttons on the parent page provide the hit areas.
}
addEventListener('message', event => {
  if (event.source !== parent) return;
  if (event.data?.type === 'cover-replay') restartCoverAnimation();
  if (event.data?.type === 'cover-tap' && Number.isInteger(event.data.index) && event.data.index >= 0 && event.data.index < 4) {
    taps[event.data.index] = millis(); loop();
  }
});

function drawLineProgress(x1,y1,x2,y2,p) { if (p>0) line(x1,y1,lerp(x1,x2,p),lerp(y1,y2,p)); }
function drawCircleProgress(x,y,r,p) { arc(x,y,r*2,r*2,-HALF_PI,-HALF_PI+TWO_PI*p); }
function drawEllipseProgress(x,y,rx,ry,p) { arc(x,y,rx*2,ry*2,-HALF_PI,-HALF_PI+TWO_PI*p); }
function drawBezierStrokeProgress(controlPoints, p) {
  if (p <= 0 || controlPoints.length !== 4) return;
  const points = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    points.push(cubicBezierPoint(controlPoints[0], controlPoints[1], controlPoints[2], controlPoints[3], u));
  }
  drawPolylineProgress(points, p);
}

function drawClosedBezierOutline(anchors, p) {
  if (p <= 0 || anchors.length < 2) return;
  const sampled = [];
  const stepsPerSide = 18;
  for (let side = 0; side < anchors.length - 1; side++) {
    const a = anchors[side];
    const b = anchors[side + 1];
    // Collinear 1/3 and 2/3 controls reproduce the AI's straight Bezier sides.
    const c1 = [lerp(a[0], b[0], 1/3), lerp(a[1], b[1], 1/3)];
    const c2 = [lerp(a[0], b[0], 2/3), lerp(a[1], b[1], 2/3)];
    for (let i = side === 0 ? 0 : 1; i <= stepsPerSide; i++) {
      sampled.push(cubicBezierPoint(a, c1, c2, b, i / stepsPerSide));
    }
  }
  drawPolylineProgress(sampled, p);
}

function cubicBezierPoint(a, b, c, d, t) {
  const mt = 1 - t;
  return [
    mt*mt*mt*a[0] + 3*mt*mt*t*b[0] + 3*mt*t*t*c[0] + t*t*t*d[0],
    mt*mt*mt*a[1] + 3*mt*mt*t*b[1] + 3*mt*t*t*c[1] + t*t*t*d[1]
  ];
}
function drawPolylineProgress(points,p) {
  const count = max(2,floor(lerp(2,points.length,p)));
  beginShape(); for(let i=0;i<count;i++) vertex(points[i][0],points[i][1]); endShape();
}
function segmentProgress(p,index,total) { return clampValue((p-index/(total+1))*((total+1)/2.2),0,1); }
function itemProgress(p,a,b) { return smoothStep(a,b,p); }
function clampValue(v,a,b) { return min(max(v,a),b); }
function smoothStep(a,b,v) { const n=clampValue((v-a)/(b-a),0,1); return n*n*(3-2*n); }
function easeOutCubic(v) { return 1-pow(1-v,3); }
function easeInOutCubic(v) { return v<.5 ? 4*v*v*v : 1-pow(-2*v+2,3)/2; }
