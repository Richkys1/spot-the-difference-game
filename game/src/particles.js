// Find bursts, floating score text and pulsing hint rings for Twin Tides.
// All effects draw on one overlay canvas that sits above both scene panels,
// so a ring lands in exactly the same place on the left and the right panel.

export class ParticleLayer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.particles = [];
    this.floaters = [];
    this.pulses = [];
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  burst(x, y, color) {
    for (let i = 0; i < 26; i += 1) {
      const angle = (i / 26) * Math.PI * 2 + 0.2;
      const speed = 40 + (i % 5) * 28;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 1,
        decay: 0.02 + (i % 4) * 0.008,
        size: 2.5 + (i % 3),
        color,
      });
    }
  }

  addFloater(x, y, text, color) {
    this.floaters.push({ x, y, text, life: 1, color });
  }

  addPulse(x, y, color) {
    this.pulses.push({ x, y, life: 1, color });
  }

  update(deltaSeconds) {
    for (const particle of this.particles) {
      particle.x += particle.vx * deltaSeconds;
      particle.y += particle.vy * deltaSeconds;
      particle.vy += 140 * deltaSeconds;
      particle.life -= particle.decay;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const floater of this.floaters) {
      floater.y -= 34 * deltaSeconds;
      floater.life -= deltaSeconds * 0.9;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    for (const pulse of this.pulses) {
      pulse.life -= deltaSeconds * 0.55;
    }
    this.pulses = this.pulses.filter((p) => p.life > 0);
  }

  drawFoundRing(x, y, radius, color) {
    const ctx = this.context;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawHintRing(x, y, radius, timeMs) {
    const ctx = this.context;
    const breathe = 1 + Math.sin(timeMs / 220) * 0.12;
    ctx.save();
    ctx.strokeStyle = '#ffd54a';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    ctx.lineDashOffset = -timeMs / 40;
    ctx.beginPath();
    ctx.arc(x, y, radius * breathe, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  draw(timeMs) {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const pulse of this.pulses) {
      const radius = (1 - pulse.life) * 70 + 12;
      ctx.save();
      ctx.globalAlpha = Math.max(0, pulse.life);
      ctx.strokeStyle = pulse.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    for (const particle of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const floater of this.floaters) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, floater.life);
      ctx.fillStyle = floater.color;
      ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 4;
      ctx.strokeText(floater.text, floater.x, floater.y);
      ctx.fillText(floater.text, floater.x, floater.y);
      ctx.restore();
    }
  }
}
