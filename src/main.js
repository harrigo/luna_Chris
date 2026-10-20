// Lunachris - starter scene.
// Tap/drag anywhere to move the moon; collect stars, dodge the red rocks.
// Replace this with the real game. Keep everything in plain files so AI edits deploy instantly.

const BUILD = 'v0.1';
document.getElementById('ver').textContent = BUILD;

class MainScene extends Phaser.Scene {
  constructor() { super('main'); }

  create() {
    const { width, height } = this.scale;
    this.score = 0;
    this.alive = true;

    // Placeholder art generated at runtime (no asset files needed).
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xf5f0c8).fillCircle(24, 24, 24).generateTexture('moon', 48, 48); g.clear();
    g.fillStyle(0xffd23f).fillCircle(10, 10, 10).generateTexture('star', 20, 20); g.clear();
    g.fillStyle(0xe5383b).fillCircle(16, 16, 16).generateTexture('rock', 32, 32); g.destroy();

    this.player = this.physics.add.image(width / 2, height * 0.8, 'moon').setCollideWorldBounds(true);
    this.player.body.setCircle(22, 2, 2);
    this.targetX = this.player.x;
    this.targetY = this.player.y;

    this.stars = this.physics.add.group();
    this.rocks = this.physics.add.group();

    this.scoreText = this.add.text(12, 10, 'Score: 0', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' }).setDepth(5);
    this.fps = this.add.text(12, 36, '', { fontFamily: 'monospace', fontSize: '12px', color: '#6b7390' }).setDepth(5);

    this.input.on('pointerdown', p => { this.targetX = p.x; this.targetY = p.y; if (!this.alive) this.scene.restart(); });
    this.input.on('pointermove', p => { if (p.isDown) { this.targetX = p.x; this.targetY = p.y; } });

    this.time.addEvent({ delay: 700, loop: true, callback: () => this.spawn(this.stars, 'star', 140) });
    this.time.addEvent({ delay: 900, loop: true, callback: () => this.spawn(this.rocks, 'rock', 180) });

    this.physics.add.overlap(this.player, this.stars, (_, s) => { s.destroy(); this.score++; this.scoreText.setText('Score: ' + this.score); });
    this.physics.add.overlap(this.player, this.rocks, () => this.gameOver());
  }

  spawn(group, key, speed) {
    if (!this.alive) return;
    const x = Phaser.Math.Between(20, this.scale.width - 20);
    const o = group.create(x, -20, key);
    o.setVelocityY(speed + Phaser.Math.Between(0, 80));
    o.setData('spawned', true);
  }

  gameOver() {
    if (!this.alive) return;
    this.alive = false;
    this.physics.pause();
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game over\nTap to restart', {
      fontFamily: 'monospace', fontSize: '28px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setDepth(10);
  }

  update(_, delta) {
    this.fps.setText(Math.round(this.game.loop.actualFps) + ' fps');
    if (!this.alive) return;
    // Smoothly follow the finger.
    const k = Math.min(1, delta / 80);
    this.player.x += (this.targetX - this.player.x) * k;
    this.player.y += (this.targetY - this.player.y) * k;
    [this.stars, this.rocks].forEach(grp => grp.children.each(o => { if (o && o.y > this.scale.height + 40) o.destroy(); }));
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1020',
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { activePointers: 3 },
  scene: [MainScene]
});
