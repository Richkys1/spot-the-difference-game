// Bootstrap for Twin Tides: wires the DOM to the game, binds mouse and
// keyboard input, and honours the ?stage= query used to stage screenshots
// (a real render of a real game state — menu, level select, mid-game with
// some differences already found, or the win screen).

import { SCENES } from './scenes.js';
import { TwinTidesGame } from './game.js';

function collectElements() {
  const byId = (id) => document.getElementById(id);
  return {
    leftCanvas: byId('panel-left'),
    rightCanvas: byId('panel-right'),
    overlayCanvas: byId('overlay'),
    panels: byId('panels'),
    levelName: byId('level-name'),
    levelSubtitle: byId('level-subtitle'),
    foundCounter: byId('found-counter'),
    scoreValue: byId('score-value'),
    comboValue: byId('combo-value'),
    hintsValue: byId('hints-value'),
    timerText: byId('timer-text'),
    timerFill: byId('timer-fill'),
    hintButton: byId('hint-button'),
    restartButton: byId('restart-button'),
    muteButton: byId('mute-button'),
    menuButton: byId('menu-button'),
    foundToast: byId('found-toast'),
    levelDots: byId('level-dots'),
    selectGrid: byId('select-grid'),
    clearTitle: byId('clear-title'),
    clearStats: byId('clear-stats'),
    clearScore: byId('clear-score'),
    nextButton: byId('next-button'),
    overTitle: byId('over-title'),
    overStats: byId('over-stats'),
    winStats: byId('win-stats'),
    winStars: byId('win-stars'),
    screens: {
      menu: byId('screen-menu'),
      select: byId('screen-select'),
      levelClear: byId('screen-level-clear'),
      gameOver: byId('screen-game-over'),
      win: byId('screen-win'),
    },
  };
}

function stageGame(game, params) {
  const stage = params.get('stage') || 'menu';
  const level = Math.min(SCENES.length - 1, Math.max(0, Number(params.get('level') || 0)));
  const foundCount = Math.max(0, Number(params.get('found') || 0));
  if (stage === 'play') {
    game.score = Number(params.get('score') || 0);
    game.totalClicks = Number(params.get('clicks') || foundCount);
    game.correctClicks = foundCount;
    const scene = SCENES[level];
    const preFound = scene.differences.slice(0, foundCount).map((d) => d.id);
    game.startLevel(level, preFound);
    game.sounds.unlock();
  } else if (stage === 'select') {
    game.unlocked = SCENES.length - 1;
    game.startLevel(0);
    game.showLevelSelect();
  } else if (stage === 'win') {
    game.score = Number(params.get('score') || 4860);
    game.totalClicks = 61;
    game.correctClicks = 52;
    game.bestCombo = 6;
    const last = SCENES[SCENES.length - 1];
    game.startLevel(SCENES.length - 1, last.differences.map((d) => d.id));
    game.finishCampaign();
  } else {
    game.showScreen('menu');
  }
}

function boot() {
  const game = new TwinTidesGame(collectElements());
  const params = new URLSearchParams(window.location.search);

  game.elements.leftCanvas.addEventListener('click', (event) => game.handlePanelClick(event, 'left'));
  game.elements.rightCanvas.addEventListener('click', (event) => game.handlePanelClick(event, 'right'));
  game.elements.hintButton.addEventListener('click', () => game.useHint());
  game.elements.restartButton.addEventListener('click', () => game.restartLevel());
  game.elements.muteButton.addEventListener('click', () => game.toggleMute());
  game.elements.menuButton.addEventListener('click', () => game.quitToMenu());

  document.getElementById('play-button').addEventListener('click', () => {
    game.sounds.unlock();
    game.startCampaign();
  });
  document.getElementById('select-button').addEventListener('click', () => {
    game.sounds.unlock();
    game.unlocked = game.unlocked;
    game.showLevelSelect();
  });
  document.getElementById('how-button').addEventListener('click', () => {
    document.getElementById('how-panel').classList.toggle('visible');
  });
  game.elements.nextButton.addEventListener('click', () => game.advanceLevel());
  document.getElementById('retry-button').addEventListener('click', () => game.restartLevel());
  document.getElementById('over-menu-button').addEventListener('click', () => game.quitToMenu());
  document.getElementById('win-menu-button').addEventListener('click', () => game.quitToMenu());
  document.getElementById('play-again-button').addEventListener('click', () => game.startCampaign());
  document.getElementById('select-back-button').addEventListener('click', () => game.quitToMenu());

  window.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') game.useHint();
    if (event.key === 'r' || event.key === 'R') game.restartLevel();
    if (event.key === 'm' || event.key === 'M') game.toggleMute();
    if (event.key === 'Escape' && game.state === 'play') game.quitToMenu();
  });

  game.updateGeometry();
  game.startLoop();
  stageGame(game, params);
}

document.addEventListener('DOMContentLoaded', boot);
