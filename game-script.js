// global variables

var game;
var canvas;
var scoreValue;
var menu;
var cat;
var nyanCat;
var tacNayn;
var flourish;
var star;
var skullHead;
var cherry;
var catCherry;
var tacCherry;
var music;
var catMusic;
var tacMusic;

var cherries;
var lastTime;
var scoreTime;
var keyCode; // 37: left, 38: up, 39: right, 40: down, -1: none
var directionCode;
var catPoint;
var cherryPoint;
var path;
var selectedCat; // 0: nyan cat, 1: tac nayn
var tailLineColors;
var catTailLineColors;
var tacTailLineColors;
var spaceBg;
var catSpaceBg;
var tacSpaceBg;
var tailLineTicks;
var gameRect;

// events

function selectClick(event) {
          
  selectedCat = (event.clientX + event.clientY < 600 ? 0 : 1);
  start();
  update();
  
}

// game logic functions

function init() {
  
  game = document.getElementById("game");
  canvas = document.getElementById("canvas");
  scoreValue = null;
  menu = document.getElementById("select");
  nyanCat = new Image();
  nyanCat.src = "images/cat.gif";
  tacNayn = new Image();
  tacNayn.src = "images/tac.gif";
  star = new Image();
  star.src = "images/star.gif";
  skullHead = new Image();
  skullHead.src = "images/skullhead.gif";
  catCherry = new Image();
  catCherry.src = "images/cherry.png";
  tacCherry = new Image();
  tacCherry.src = "images/darkcherry.png";
  var fading = new Image();
  fading.src = "images/fading.gif";
  catMusic = document.getElementById("cat-music");
  tacMusic = document.getElementById("tac-music");
  
  cherries = 0;
  lastTime = -1;
  scoreTime = 0;
  keyCode = -1;
  directionCode = 39;
  catPoint = {x: 100, y: 500};
  cherryPoint = {x: 300, y: 300};
  path = [{x: catPoint.x, y: catPoint.y}];
  catTailLineColors = ["#f00", "#f90", "#ff0", "#3f0", "#09f", "#63f"];
  tacTailLineColors = ["#7b7b7b", "#999", "#bdbdbd", "#fff", "#7b7b7b", "#999"];
  catSpaceBg = "#036";
  tacSpaceBg = "#840810";
  tailLineTicks = [55, 45, 35, 25, 15, 5];
  gameRect = {x: 40, y: 40, w: 520, h:520};
  
}

function start() {

  // remove menu
  game.removeChild(menu);

  // setup game visuals/audio
  cat = (selectedCat == 0 ? nyanCat : tacNayn);
  flourish = (selectedCat == 0 ? star : skullHead);
  cherry = (selectedCat == 0 ? catCherry : tacCherry);
  music = (selectedCat == 0 ? catMusic : tacMusic);
  tailLineColors = (selectedCat == 0 ? catTailLineColors : tacTailLineColors);
  spaceBg = (selectedCat == 0 ? catSpaceBg : tacSpaceBg);
  for (var i = 0; i <= 13; i++) {
    
    var img = flourish.cloneNode(false);
    img.id = "star" + i;
    img.className = "star";
    game.appendChild(img);
  }
  game.style.backgroundColor = spaceBg;

  // show score
  var score = document.createElement("div");
  score.id = "score";
  score.innerHTML = 'Score: <span id="score-value">0</span>';
  game.appendChild(score);
  scoreValue = document.getElementById("score-value");

  // show cat
  cat.id = "cat";
  cat.style.top = (catPoint.y - 36) + "px";
  cat.style.left = (catPoint.x - 59) + "px";
  game.appendChild(cat);

  // show cherry
  cherry.id = "cherry";
  cherry.style.top = (cherryPoint.y - 15) + "px";
  cherry.style.left = (cherryPoint.x - 15) + "px";
  game.appendChild(cherry);

  // start song
  music.play();
  music.addEventListener("ended", function(){
    
    this.currentTime = 0;
    this.play();
    
  }, false);

  // capture input
  window.focus();
  document.onkeydown = function (event) {

    if (event.preventDefault) { // avoid automactic scroll
     
      event.preventDefault(); 
    } else {
    
      event.returnValue = false; 
    }
    keyCode = (event.keyCode >= 37 && event.keyCode <= 40 ? event.keyCode : -1);
    
  }

  canvas /* topmost layer */ .onclick = canvas.touchstart = function (event) {
   
    var clickPoint =
      {x: event.clientX - catPoint.x, y: event.clientY - catPoint.y};
    if (Math.abs(clickPoint.x) > Math.abs(clickPoint.y)) {
      
      keyCode = (clickPoint.x > 0 ? 39 : 37);
    } else {
      
      keyCode = (clickPoint.y > 0 ? 40 : 38);
    }
    
  }
  
}

function update() {

  // process delta time
  var time = (new Date()).getTime();
  var deltaTime = (lastTime == -1 ? 0 : time - lastTime);
  lastTime = time;

  // process score
  scoreTime += deltaTime;
  if (scoreTime >= 500) {

    scoreTime -= 500;
    scoreValue.innerHTML = (Number(scoreValue.innerHTML) + cherries);
  }

  // has direction change ?
  if (keyCode != -1) {

    if (keyCode != directionCode && 
        (cherries == 0 || Math.abs(directionCode - keyCode) != 2)) {

      directionCode = keyCode;
      path.push({x: catPoint.x, y: catPoint.y});
    }
    keyCode = -1;
  }

  // move cat
  var deltaPixels = (deltaTime * 180 /* speed: pixels/sec. */ / 1000);
  var transform = "";
  if (directionCode == 37) {

    catPoint.x -= deltaPixels;
    transform = "scaleX(-1.0)";
  } else if (directionCode == 38) {

    catPoint.y -= deltaPixels;
    transform = "rotate(-90deg)";
  } else if (directionCode == 39) {

    catPoint.x += deltaPixels;
    transform = "none";
  } else if (directionCode == 40) {

    catPoint.y += deltaPixels;
    transform = "rotate(90deg)";
  }
  cat.style.top = (catPoint.y - 36) + "px";
  cat.style.left = (catPoint.x - 59) + "px";
  cat.style.webkitTransform = cat.style.msTransform = cat.style.MozTransform = 
    cat.style.OTransform = cat.style.transform = transform;
  var catRect = {x: catPoint.x - 40, y: catPoint.y - 40, w: 80, h: 80};

  // is cherry eaten?
  if (contains(cherryPoint, catRect)) {

    cherries++;
    cherryPoint.x = 60 + Math.random() * 480;
    cherryPoint.y = 60 + Math.random() * 480;
    cherry.style.top = (cherryPoint.y - 15) + "px";
    cherry.style.left = (cherryPoint.x - 15) + "px";
  }

  // process and draw tail
  var tail = new Array();
  var tailLen = cherries * 60;
  tail.push({x: catPoint.x, y: catPoint.y});
  for (var i = path.length - 1, lastTailPoint = tail[0], pathPoint = path[i];
      i >= 0 && tailLen > 0;
      i--, lastTailPoint = tail[tail.length - 1], pathPoint = path[i]) {

    var segLen = distance(lastTailPoint, pathPoint);
    var segLenRatio = tailLen / segLen;
    var segEndPoint = null;
    if (segLenRatio < 1) {

      segEndPoint = lerp(lastTailPoint, pathPoint, segLenRatio);
      segLen = tailLen;
    } else {

      segEndPoint = pathPoint;
    }
    var segFracs = Math.ceil(segLen / 60 /* seg. max. length */);
    for (var segFrac = 1; segFrac < segFracs; segFrac++) {

      var segFracLenRatio = segFrac / segFracs;
      var segFracLastPoint = lerp(lastTailPoint, segEndPoint, segFracLenRatio);
      tail.push(segFracLastPoint);
    }
    tail.push(segEndPoint);
    tailLen -= segLen;
    
  }
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, 600, 600);
  context.lineCap = context.lineJoin = "round";
  for (var i = 0; i < tailLineColors.length; i++) {
  
    context.lineWidth = tailLineTicks[i];
    context.strokeStyle = tailLineColors[i];
    context.beginPath();
    context.moveTo(tail[0].x, tail[0].y);
    for (var j = 1; j < tail.length; j++) {
    
      context.lineTo(tail[j].x, tail[j].y);
    }
    context.stroke();
  }

  // check for intersections
  var intersection = false;
  if (!contains(catPoint, gameRect)) {
   
    stop(selectedCat == 0 ? "cat-wall" : "tac-wall");
    intersection = true;
  }
  var tooClose = true;
  for (var i = 0 /* no intersect. granted */; i < tail.length; i++) {
    
    tooClose = (tooClose &&
      sqDistance(tail[i], catPoint) < 3200 /* (40 * sqrt(2)) ^ 2 */);
    if (!tooClose && contains(tail[i], catRect)) {
     
      stop(selectedCat == 0 ? "cat-tail" : "tac-tail");
      intersection = true;
      break;
    }
  }

  // schedule next update
  if (!intersection) {
  
    setTimeout("update();", 1 /* as fast as possible */);
  }

}

function stop(reason, score) {
  
  music.pause(); // ie fix
  var message;
  var bg;
  if (reason == "cat-wall") {
    
    message = "Nyan Cat has flown right into the wall...";
    bg = "#036";
  } else if (reason == "cat-tail") {
    
    message = "Nyan Cat has eaten its marvelous rainbow tail...";
    bg = "#036";
  } else if (reason == "tac-wall") {
    
    message = "Tac Nayn has flown right into the wall...";
    bg = "url('images/fading.gif')";
  } else if (reason == "tac-tail") {
    
    message = "Tac Nayn has eaten its dark rainbow tail...";
    bg = "url('images/fading.gif')";
  }
  game.innerHTML = "<div id=\"final-score\"><div><p>" + message + "<br/>" + "By the way, your score is [score].".replace(/\[score\]/, scoreValue.innerHTML) + "</p><p><span onClick=\"location.reload();\">Play again!</span></p></div></div>";
  document.getElementById("final-score").style.background = bg;

}

// geometry/utility functions

function lerp(fromPoint, toPoint, lengthRatio) {

  return {x: fromPoint.x + (toPoint.x - fromPoint.x) * lengthRatio,
    y: fromPoint.y + (toPoint.y - fromPoint.y) * lengthRatio};

}

function contains(point, rect) {

  return (point.x >= rect.x && point.x <= (rect.x + rect.w) &&
    point.y >= rect.y && point.y <= (rect.y + rect.h));

}

function sqDistance(from, to) {
  
  return ((from.x - to.x) * (from.x - to.x) +
    (from.y - to.y) * (from.y - to.y));
  
}

function distance(from, to) {
  
  return Math.sqrt(sqDistance(from, to));
  
}
