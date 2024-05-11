const GRASS_LEVEL = 246;
const WIDTH = 484;
const HEIGHT = 450;
const TICK = 150; //ms
const ROUND_TIME = 3000; //ms
const STEP_BY_TICK_X = 10; //px
const STEP_BY_TICK_Y = -4; //px
const MIN_RIGHT_BORDER = (ROUND_TIME/TICK)*STEP_BY_TICK_X;
const DIRECTIONS = [
  'left', 'right', 'up',
  'down', 'left-down', 'left-up',
  'right-up', 'right-down',
];  

const audioShoot = new Audio('../assets/audio/awp.mp3');
const audioDuck = new Audio('../assets/audio/quack.mp3');
audioDuck.loop = true;

class DuckHunt {
  constructor(){
    this.config = {
      roundTime: ROUND_TIME, //ms
      field: {
        width: WIDTH,
        height: HEIGHT,    
      },
      duck: {
        position: null, //could set by default
        stepX: STEP_BY_TICK_X,
        stepY: STEP_BY_TICK_Y,
        speed: 1,     
      },
    }
    this.Field = new Field(this.config.field);
    this.Duck = null;
    this.Score = new Score();
  }

  startRound() {
    this.Duck = new Duck(this.config.duck, this.Field);
    this.Duck.startRound(this.config.roundTime, this.endRound.bind(this));
  }

  endRound({hit}) {
    console.log('hit', hit);
    this.Score.changeScore(hit);
  }
}

class Field {
  constructor(cfg){
    this.width = cfg.width;
    this.height = cfg.height;
    this.element = document.querySelector('#game');
    this.element.style.width = this.width+'px';
    this.element.style.height = this.height+'px';
  }
}

class Score {
  constructor() {
    this.element = document.querySelector('.scores');
    this.totalGames = 0;
    this.hits = 0;
  }

  changeScore(hit){
    this.totalGames += 1;
    this.hits = hit? this.hits+1: this.hits;
    this.render();    
  }

  render() {
    const hits = this.element.querySelector('.hits b');
    const attempts = this.element.querySelector('.attempts b');
    hits.innerText = this.hits;
    attempts.innerText = this.totalGames;
  }
}

class Duck {
  constructor(cfg, field){
    this.element = document.querySelector('#game .spriteWrapper');
    this.timer = null;
    this.stepX = cfg.stepX;
    this.stepY = cfg.stepY;
    this.speed = cfg.speed;
    this.position = cfg.position||this.getRandomPosition();
    this.direction = '';
    this.endRoundCb = function(){};
  }

  startRound(roundTime, endRound) {
    this.endRoundCb = endRound;
    this.element.addEventListener('click',  this.shootDuck);
    this.roundTimer = setTimeout(()=>{
      this.stopRound();
      this.hideDuck();
      this.endRoundCb({hit:false});
    }, roundTime);
    audioDuck.play();
    this.moveDuck();
  }

  stopRound() {
    console.log('timer',this.timer)
    if(this.timer){
      this.element.removeEventListener('click', this.shootDuck);
      clearInterval(this.timer);
      this.timer = null;
      audioDuck.pause();
    }
  }

  hideDuck() {
    this.element.classList.remove('duckAnimation1', 'shootAnimation');
  }

  shootDuck = () => {
    clearTimeout(this.roundTimer);
    this.element.classList.add('shootAnimation');
    audioShoot.play();
    this.stopRound();
    this.endRoundCb({hit:true});
    setTimeout(()=>{
      this.hideDuck();
    }, 3000);
  }

  moveDuck() {
    const {x,y} = this.position;
    this.element.style.transform = `translate(${x}px, ${y}px)`;
    this.element.classList.add('duckAnimation1');
    this.timer = setInterval(()=>{
      const {x,y} = this.position;
      this.position = {
        x: x+this.stepX,
        y: y+this.stepY,
      }
      this.render();
    }, TICK/this.speed)
  }

  getRandomPosition() {
    return {
      x: getRandomNumber(0, WIDTH - MIN_RIGHT_BORDER),
      y: getRandomNumber(0, HEIGHT-GRASS_LEVEL),
    }
  }

  render() {
    const {x, y} = this.position;
    this.element.classList.toggle('duckAnimation2');
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }
}

const game = new DuckHunt();
const startButton = document.querySelector('.gameWrapper .actionPanel button');
startButton.addEventListener('click', init, false);


function getRandomNumber(min, max) {
  return min + Math.round(Math.random()*(max-min))
}

function init(){
  startButton.disabled = true;
  startButton.removeEventListener('click', init);
  let timer = null;
  function randomStart(){
    clearTimeout(timer);
    const randomMs = getRandomNumber(9000, 20000);
    timer = setTimeout(()=>{
      game.startRound();
      randomStart();
    }, randomMs);
  }
  game.startRound();
  randomStart();
}
