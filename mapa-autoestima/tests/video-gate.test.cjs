const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'video-gate.js'), 'utf8');

function setup() {
  const player = Object.assign(new EventTarget(), {
    played: true,
    inSmartAutoPlay: false,
    duration: 400,
    currentTime: 0,
  });
  const classes = new Set(['video-pending']);
  const window = new EventTarget();
  let revealCount = 0;
  window.addEventListener('video:content-revealed', () => revealCount++);

  vm.runInNewContext(source, {
    Event,
    window,
    document: {
      getElementById: id => id === 'vid-6a831b98d46da2e77f9cb8d8' ? player : null,
      body: { classList: { remove: name => classes.delete(name) } },
    },
  });

  return {
    player,
    pending: () => classes.has('video-pending'),
    revealCount: () => revealCount,
    emit(type, time) {
      const event = new Event(type);
      if (time !== undefined) event.detail = { time };
      player.dispatchEvent(event);
    },
  };
}

test('keeps content hidden until exactly 50% for different video lengths', () => {
  for (const duration of [90, 400, 1800]) {
    const gate = setup();
    gate.player.duration = duration;
    gate.emit('player:ready');
    assert.equal(gate.pending(), true);
    gate.emit('video:timeupdate', duration * 0.4999);
    assert.equal(gate.pending(), true);
    gate.emit('video:timeupdate', duration * 0.5);
    assert.equal(gate.pending(), false);
  }
});

test('does not count the muted preview or a video that has not started', () => {
  const gate = setup();
  gate.emit('smartautoplay:timeupdate', 300);
  assert.equal(gate.pending(), true);
  gate.player.inSmartAutoPlay = true;
  gate.emit('video:timeupdate', 300);
  assert.equal(gate.pending(), true);
  gate.player.inSmartAutoPlay = false;
  gate.player.played = false;
  gate.emit('video:timeupdate', 300);
  assert.equal(gate.pending(), true);
  gate.player.played = true;
  gate.emit('video:timeupdate', 300);
  assert.equal(gate.pending(), false);
});

test('waits for a valid duration when video metadata arrives later', () => {
  const gate = setup();
  for (const duration of [undefined, 0, -1, NaN, Infinity]) {
    gate.player.duration = duration;
    gate.emit('video:timeupdate', 250);
    assert.equal(gate.pending(), true);
  }
  gate.player.duration = 400;
  gate.emit('video:timeupdate', 250);
  assert.equal(gate.pending(), false);
});

test('ignores invalid playback times', () => {
  const gate = setup();
  for (const time of [NaN, Infinity, -1, '250']) {
    gate.emit('video:timeupdate', time);
    assert.equal(gate.pending(), true);
  }
});

test('handles playback resumed beyond the halfway point', () => {
  const gate = setup();
  gate.player.currentTime = 250;
  gate.player.played = false;
  gate.emit('player:ready');
  assert.equal(gate.pending(), true);
  gate.player.played = true;
  gate.emit('video:play');
  assert.equal(gate.pending(), false);
});

test('reveals once and stays visible after rewinding or pausing', () => {
  const gate = setup();
  gate.emit('video:timeupdate', 200);
  gate.emit('video:timeupdate', 10);
  gate.emit('video:pause');
  gate.emit('video:timeupdate', 300);
  assert.equal(gate.pending(), false);
  assert.equal(gate.revealCount(), 1);
});

test('hides content from the initial HTML and binds before the async player loads', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
  assert.match(html, /<body class="video-pending">/);
  assert.ok(html.indexOf('src="video-gate.js"') < html.indexOf('src="https://scripts.converteai.net/'));
  assert.match(css, /body\.video-pending main>\.section:not\(#inicio\)/);
  assert.match(css, /body\.video-pending footer/);
  assert.match(css, /body\.video-pending \.navcta/);
  assert.match(css, /body\.video-pending #inicio \.btn/);
});
