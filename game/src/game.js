// Game state for Twin Tides: levels, timer, score, combo, hints, win/lose.
// The scenes themselves live in scenes.js; this file owns everything about
// playing them: which level is open, what has been found, how much time is
// left, and what the player has scored.

import { SCENES, SCENE_WIDTH, SCENE_HEIGHT } from './scenes.js';
import { SoundBank } from './audio.js';
import { ParticleLayer } from './particles.js';

const HINT_COOLDOWN_MS = 8000;
const HINT_SHOW_MS = 3000;
const WRONG_CLICK_PENALTY = 25;
const FIND_BASE_POINTS = 100;
const COMBO_BONUS_PER_STEP = 20;

export class TwinTidesGame {
  constructor(elements) {
    this.elements = elements;
    this.leftCtx = elements.leftCanvas.getContext('2d');
    this.rightCtx = elements.rightCanvas.getContext('2d');
    this.particles = new ParticleLayer(elements.overlayCanvas);
    this.sounds = new SoundBank();
    this.state = 'menu';
    this.levelIndex = 0;
    this.found = new Set();
    this.hintsLeft = 3;
    this.hintReadyAt = 0;
    this.hintDiff = null;
    this.hintUntil = 0;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.timeLeftMs = 0;
    this.lastTickSecond = -1;
    this.totalClicks = 0;
    this.correctClicks = 0;
    this.levelScores = [];
    this.unlocked = 0;
    this.lastFrameAt = 0;
    this.geometry = { leftX: 0, leftY: 0, rightX: 0, rightY: 0, scale: 1 };
    this.muted = false;
    this.shakeUntil = 0;
    this.onLevelClear = null;
    this.onGameOver = null;
    this.onWin = null;
  }

  currentScene() {
    return SCENES[this.levelIndex];
  }

  updateGeometry() {
    const container = this.elements.panels;
    const leftRect = this.elements.leftCanvas.getBoundingClientRect();
    const rightRect = this.elements.rightCanvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    this.geometry = {
      leftX: leftRect.left - containerRect.left,
      leftY: leftRect.top - containerRect.top,
      rightX: rightRect.left - containerRect.left,
      rightY: rightRect.top - containerRect.top,
      scale: leftRect.width / SCENE_WIDTH,
    };
    const overlay = this.elements.overlayCanvas;
    overlay.style.width = `${containerRect.width}px`;
    overlay.style.height = `${containerRect.height}px`;
    this.particles.resize(
      Math.max(1, Math.round(containerRect.width)),
      Math.max(1, Math.round(containerRect.height)),
    );
  }

  toOverlay(panel, x, y) {
    const g = this.geometry;
    const baseX = panel === 'left' ? g.leftX : g.rightX;
    const baseY = panel === 'left' ? g.leftY : g.rightY;
    return { x: baseX + x * g.scale, y: baseY + y * g.scale };
  }

  renderPanels() {
    const scene = this.currentScene();
    const changed = new Set(scene.differences.map((d) => d.id));
    scene.draw(this.leftCtx, new Set());
    scene.draw(this.rightCtx, changed);
  }

  startLevel(index, preFoundIds = []) {
    this.levelIndex = index;
    const scene = this.currentScene();
    this.found = new Set(preFoundIds);
    this.hintsLeft = 3;
    this.hintReadyAt = 0;
    this.hintDiff = null;
    this.combo = 0;
    this.timeLeftMs = scene.timeLimit * 1000;
    this.lastTickSecond = -1;
    this.state = 'play';
    this.renderPanels();
    this.updateGeometry();
    this.updateHud();
    this.showScreen(null);
    this.elements.levelName.textContent = `${index + 1}. ${scene.name}`;
    this.elements.levelSubtitle.textContent = scene.subtitle;
    this.renderLevelDots();
  }

  startCampaign() {
    this.score = 0;
    this.levelScores = [];
    this.totalClicks = 0;
    this.correctClicks = 0;
    this.bestCombo = 0;
    this.unlocked = 0;
    this.startLevel(0);
    this.sounds.startMusic();
  }

  quitToMenu() {
    this.state = 'menu';
    this.sounds.stopMusic();
    this.showScreen('menu');
    this.updateHud();
  }

  showLevelSelect() {
    this.state = 'select';
    this.renderSelectGrid();
    this.showScreen('select');
  }

  showScreen(name) {
    for (const [key, element] of Object.entries(this.elements.screens)) {
      element.classList.toggle('visible', key === name);
    }
  }

  renderSelectGrid() {
    const grid = this.elements.selectGrid;
    grid.innerHTML = '';
    SCENES.forEach((scene, index) => {
      const button = document.createElement('button');
      button.className = 'select-card';
      button.type = 'button';
      const locked = index > this.unlocked;
      button.disabled = locked;
      button.innerHTML = `<span class="select-number">${locked ? '🔒' : index + 1}</span>`
        + `<span class="select-name">${scene.name}</span>`
        + `<span class="select-meta">${scene.differences.length} differences · ${scene.timeLimit}s</span>`;
      button.addEventListener('click', () => {
        this.sounds.unlock();
        this.startLevel(index);
      });
      grid.appendChild(button);
    });
  }

  renderLevelDots() {
    const dots = this.elements.levelDots;
    dots.innerHTML = '';
    SCENES.forEach((scene, index) => {
      const dot = document.createElement('span');
      dot.className = 'level-dot' + (index === this.levelIndex ? ' current' : '')
        + (index < this.levelIndex ? ' done' : '');
      dot.textContent = index + 1;
      dots.appendChild(dot);
    });
  }

  updateHud() {
    const scene = this.currentScene();
    this.elements.foundCounter.textContent = `Found ${this.found.size} / ${scene.differences.length}`;
    this.elements.scoreValue.textContent = String(this.score);
    this.elements.comboValue.textContent = this.combo > 1 ? `x${this.combo} combo` : '';
    this.elements.hintsValue.textContent = `Hints: ${this.hintsLeft}`;
    const seconds = Math.max(0, Math.ceil(this.timeLeftMs / 1000));
    this.elements.timerText.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    const fraction = Math.max(0, this.timeLeftMs / (scene.timeLimit * 1000));
    this.elements.timerFill.style.width = `${fraction * 100}%`;
    this.elements.timerFill.classList.toggle('low', fraction < 0.25);
    const hintCooldown = Math.max(0, this.hintReadyAt - performance.now());
    this.elements.hintButton.disabled = this.state !== 'play'
      || this.hintsLeft <= 0 || hintCooldown > 0;
    this.elements.hintButton.textContent = hintCooldown > 0
      ? `Hint (${Math.ceil(hintCooldown / 1000)}s)` : '💡 Hint (H)';
  }

  scenePointFromEvent(event, panel) {
    const canvas = panel === 'left' ? this.elements.leftCanvas : this.elements.rightCanvas;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SCENE_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * SCENE_HEIGHT,
    };
  }

  handlePanelClick(event, panel) {
    if (this.state !== 'play') return;
    this.sounds.unlock();
    const point = this.scenePointFromEvent(event, panel);
    this.totalClicks += 1;
    const scene = this.currentScene();
    const hit = scene.differences.find((diff) => {
      if (this.found.has(diff.id)) return false;
      const dx = point.x - diff.x;
      const dy = point.y - diff.y;
      return dx * dx + dy * dy <= diff.r * diff.r;
    });
    if (hit) this.registerFind(hit, panel, point);
    else this.registerMiss(point, panel);
    this.updateHud();
  }

  registerFind(diff, panel, point) {
    this.found.add(diff.id);
    this.correctClicks += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const points = FIND_BASE_POINTS + (this.combo - 1) * COMBO_BONUS_PER_STEP;
    this.score += points;
    this.sounds.playFind(this.combo);
    for (const side of ['left', 'right']) {
      const at = this.toOverlay(side, diff.x, diff.y);
      this.particles.burst(at.x, at.y, '#ffd54a');
      this.particles.addPulse(at.x, at.y, '#ffffff');
    }
    const at = this.toOverlay(panel, point.x, point.y);
    this.particles.addFloater(at.x, at.y - 20, `+${points}`, '#ffd54a');
    this.elements.foundToast.textContent = diff.label;
    this.elements.foundToast.classList.add('show');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.elements.foundToast.classList.remove('show');
    }, 1800);
    if (this.found.size === this.currentScene().differences.length) {
      this.completeLevel();
    }
  }

  registerMiss(point, panel) {
    this.combo = 0;
    this.score = Math.max(0, this.score - WRONG_CLICK_PENALTY);
    this.sounds.playMiss();
    const at = this.toOverlay(panel, point.x, point.y);
    this.particles.addPulse(at.x, at.y, '#ff5a5a');
    this.particles.addFloater(at.x, at.y - 16, `-${WRONG_CLICK_PENALTY}`, '#ff8a80');
    this.shakeUntil = performance.now() + 250;
  }

  useHint() {
    if (this.state !== 'play' || this.hintsLeft <= 0) return;
    if (performance.now() < this.hintReadyAt) return;
    const scene = this.currentScene();
    const remaining = scene.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return;
    this.sounds.unlock();
    this.hintsLeft -= 1;
    this.hintReadyAt = performance.now() + HINT_COOLDOWN_MS;
    this.hintDiff = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintUntil = performance.now() + HINT_SHOW_MS;
    this.sounds.playHint();
    this.updateHud();
  }

  completeLevel() {
    const scene = this.currentScene();
    const timeBonus = Math.round((this.timeLeftMs / 1000) * 5);
    this.score += timeBonus;
    const levelScore = this.score - (this.levelScores.reduce((a, b) => a + b, 0));
    this.levelScores.push(levelScore);
    this.unlocked = Math.max(this.unlocked, Math.min(SCENES.length - 1, this.levelIndex + 1));
    this.state = 'levelClear';
    this.sounds.playLevelClear();
    this.elements.clearTitle.textContent = `${scene.name} — cleared!`;
    this.elements.clearStats.textContent =
      `Found ${scene.differences.length}/${scene.differences.length} differences · `
      + `Time bonus +${timeBonus} · Best combo x${this.bestCombo}`;
    this.elements.clearScore.textContent = `Score: ${this.score}`;
    this.elements.nextButton.textContent = this.levelIndex + 1 < SCENES.length
      ? 'Next scene →' : 'See results →';
    this.showScreen('levelClear');
    this.updateHud();
  }

  advanceLevel() {
    if (this.levelIndex + 1 < SCENES.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.finishCampaign();
    }
  }

  failLevel() {
    this.state = 'gameOver';
    this.sounds.playGameOver();
    const scene = this.currentScene();
    this.elements.overTitle.textContent = 'Out of time!';
    this.elements.overStats.textContent =
      `${scene.name}: found ${this.found.size} of ${scene.differences.length} differences. `
      + 'The tide took this one — try the scene again.';
    this.showScreen('gameOver');
    this.updateHud();
  }

  finishCampaign() {
    this.state = 'win';
    this.sounds.playWin();
    this.sounds.stopMusic();
    const accuracy = this.totalClicks === 0 ? 100
      : Math.round((this.correctClicks / this.totalClicks) * 100);
    const stars = this.score >= 5200 ? 3 : this.score >= 4200 ? 2 : 1;
    this.elements.winStats.textContent =
      `Final score ${this.score} · ${this.correctClicks} differences found · `
      + `${accuracy}% accuracy · Best combo x${this.bestCombo}`;
    this.elements.winStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    this.showScreen('win');
    this.updateHud();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.sounds.setMuted(this.muted);
    this.elements.muteButton.textContent = this.muted ? '🔇 Muted (M)' : '🔊 Sound (M)';
    return this.muted;
  }

  restartLevel() {
    if (this.state === 'play' || this.state === 'gameOver') {
      this.startLevel(this.levelIndex);
    }
  }

  frame(now) {
    const deltaSeconds = this.lastFrameAt ? Math.min(0.05, (now - this.lastFrameAt) / 1000) : 0.016;
    this.lastFrameAt = now;
    if (this.state === 'play') {
      this.timeLeftMs -= deltaSeconds * 1000;
      const secondsLeft = Math.ceil(this.timeLeftMs / 1000);
      if (secondsLeft <= 5 && secondsLeft !== this.lastTickSecond && secondsLeft > 0) {
        this.lastTickSecond = secondsLeft;
        this.sounds.playTick();
      }
      if (this.timeLeftMs <= 0) {
        this.timeLeftMs = 0;
        this.updateHud();
        this.failLevel();
      } else {
        this.updateHud();
      }
    }
    if (this.hintDiff && now > this.hintUntil) this.hintDiff = null;
    const shake = now < this.shakeUntil;
    this.elements.panels.classList.toggle('shake', shake);
    this.particles.update(deltaSeconds);
    this.particles.draw(now);
    if (this.state === 'play' || this.state === 'levelClear' || this.state === 'gameOver') {
      const scene = this.currentScene();
      for (const diff of scene.differences) {
        if (!this.found.has(diff.id)) continue;
        for (const side of ['left', 'right']) {
          const at = this.toOverlay(side, diff.x, diff.y);
          this.particles.drawFoundRing(at.x, at.y, diff.r * this.geometry.scale, '#ffcf3f');
        }
      }
    }
    if (this.hintDiff && this.state === 'play') {
      for (const side of ['left', 'right']) {
        const at = this.toOverlay(side, this.hintDiff.x, this.hintDiff.y);
        this.particles.drawHintRing(at.x, at.y, this.hintDiff.r * this.geometry.scale, now);
      }
    }
    window.requestAnimationFrame((t) => this.frame(t));
  }

  startLoop() {
    window.addEventListener('resize', () => this.updateGeometry());
    window.requestAnimationFrame((t) => this.frame(t));
  }
}
