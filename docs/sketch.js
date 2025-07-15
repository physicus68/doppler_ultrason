let port;
let connectBtn;
let BAUD_ARDUINO = 9600;

let reference = 0;
let frequence = 0;
let buff_freq = [];
let BUFF_LEN = 10;

let N_data = 500;
let data_buffer = new Array(N_data);

let F_max = 100;
let F_divisions = [0, 20, 40, 60, 80];

let H = 300;
let W = 450;
let X0 = 50;
let Y0 = 300;

function setup() {
  let div = createDiv();
  div.id("application");

  let titre = createElement("h1", "Effet Doppler avec<br> des ultra sons ");
  titre.parent(div);

  let c = createCanvas(600, 500);
  c.parent(div);

  port = createSerial();
  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], BAUD_ARDUINO);
  }

  connectBtn = createButton("Connect to Arduino");
  connectBtn.mousePressed(connectBtnClick);
  connectBtn.parent(div);

  let sendBtn = createButton("Fixer la fréquence de référence Fo ");
  sendBtn.mousePressed(sendBtnClick);
  sendBtn.parent(div);

  textFont("Courier New");
  textStyle(BOLD);
}

function draw() {
  let str = port.readUntil("\n");
  if (str.length > 0) {
    clear();
    background(220);
    afficherFrequence(str);
    frequence = parseFloat(str);

    if (buff_freq.length > BUFF_LEN - 1) {
      buff_freq.shift();
    }
    buff_freq.push(frequence);

    afficherDecalageDoppler(frequence - reference);

    data_buffer.shift();
    data_buffer.push(frequence - reference);
    tracerGraphique(data_buffer);
  }

  if (!port.opened()) {
    connectBtn.html("Connexion à Arduino");
  } else {
    connectBtn.html("Déconnexion");
  }
}

function tracerGraphique(buffer) {
  x_offset = X0;
  y = Y0;
  delta_y_max = H / 2;
  fill("white");
  rect(x_offset, y - delta_y_max - 2, W, H + 4);

  noFill();
  stroke("red");
  strokeWeight(1.5);
  beginShape();
  for (let x = 0; x < buffer.length; x++) {
    let delta_y = (buffer[x] * H) / (F_max * 2);
    if (delta_y > delta_y_max) {
      delta_y = delta_y_max;
    }
    if (delta_y < -delta_y_max) {
      delta_y = -delta_y_max;
    }
    vertex((x * W) / buffer.length + x_offset, y - delta_y);
  }
  endShape();

  drawingContext.setLineDash([3]);
  strokeWeight(0.5);
  stroke("orange");
  let l = F_divisions.length;
  for (let i = 0; i < l; i++) {
    let delta_y = (F_divisions[i] * H) / (F_max * 2);
    beginShape();
    vertex(x_offset, y - delta_y);
    vertex(x_offset + W, y - delta_y);
    endShape();
    beginShape();
    vertex(x_offset, y + delta_y);
    vertex(x_offset + W, y + delta_y);
    endShape();
  }
  drawingContext.setLineDash([0]);

  stroke("black");
  strokeWeight(1);
  beginShape();
  vertex(x_offset, y);
  vertex(x_offset + W, y);
  endShape();

  beginShape();
  vertex(x_offset + W, y - H / 2);
  vertex(x_offset + W, y + H / 2);
  endShape();

  noStroke();
  fill("black");
  textSize(22);
  textAlign(LEFT, CENTER);
  text("+" + F_max + "Hz", x_offset + W, y - H / 2);
  text("-" + F_max + "Hz", x_offset + W, y + H / 2);
  textAlign(LEFT, BASELINE);
}

function afficherFrequence(f) {
  noStroke();
  textSize(22);
  fill("black");
  text("Fréquence", 50, 50);
  afficherValeur(f, 275,50);
  text("Hz", 350, 50);
}

function afficherDecalageDoppler(Df) {
  noStroke();
  textSize(22);
  fill("black");
  text("Décalage Doppler", 50, 100);
  afficherValeur(Df, 275,100);
  text("Hz", 350, 100);
}

function afficherValeur(v, x, y) {
  textSize(22);
  let data = parseFloat(v).toFixed(0);
  fill(220);
  noStroke();
  rect(x, y - textAscent(data), 200, textAscent(v) + textDescent(data));
  fill("yellow");
  noStroke();
  rect(
    x,
    y - textAscent(data),
    textWidth(data),
    textAscent(v) + textDescent(data)
  );
  noFill();
  fill("black");
  text(data, x, y);
}

function connectBtnClick() {
  if (!port.opened()) {
    port.open("Arduino", BAUD_ARDUINO);
  } else {
    port.close();
  }
}

function sendBtnClick() {
  let s = 0;
  let l = buff_freq.length;
  for (let i = 0; i < l; i++) {
    s = s + buff_freq[i];
  }
  reference = s / l;
}
