(() => {
  const canvas = document.querySelector(".sky");
  const stage = document.querySelector(".stage");
  const ctx = canvas.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  let W = 0;
  let H = 0;
  let ratio = 1;
  let world = null;
  let last = 0;
  const PAL = {
    night: {
      sky: [[0, "#060219"], [0.4, "#170b3f"], [0.72, "#341862"], [0.9, "#6c2476"], [1, "#a8367f"]],
      stars: 6, starSpread: 0.72, starBase: 0.3,
      cloud: () => [Math.random() < 0.5 ? "170, 140, 230" : "255, 120, 200", rand(0.03, 0.07)],
      haze: ["rgba(255, 80, 170, 0)", "rgba(255, 80, 170, 0.3)"],
      hills: "rgba(58, 34, 104, 0.9)",
      win: 1.7, winColors: ["#ffd36e", "#ffe9b0", "#ffc27a", "#ff9ad9", "#ffe9b0", "#9fe8ff"], winAlpha: 0.75,
      tower: ["#1c0f3e", "#2c1858", "#6a3487"], back: ["#2a1a5c", "#3a2470"], front: ["#170b33", "#21124a"],
      rim: "rgba(255, 150, 205, 0.6)",
      ground: ["#2b1452", "#0d061c"], rows: ["#2a1450", "#1d0d3a", "#130828"], rowRim: "rgba(255, 150, 200, 0.35)",
      fw: ["#1a0c36", "rgba(255, 140, 200, 0.6)", "#170b30"],
      bridge: "#24134a", bayLights: 1, deckLights: "rgba(255, 211, 110, 0.85)",
      tree: ["#0c0619", "rgba(255, 113, 206, 0.5)", "rgba(255, 140, 210, 0.22)"],
      wood: "#0b0519", frameRim: "rgba(255, 113, 206, 0.28)",
      sill: ["#2b1453", "#150a2c"], sillLine: "rgba(255, 140, 210, 0.6)",
      desk: ["#22103f", "#07030f"], deskEdge: "rgba(255, 79, 184, 0.75)",
      curtain: ["rgba(58, 22, 110, 0)", "rgba(58, 22, 110, 0.85)", "rgba(34, 12, 70, 0.95)", "rgba(70, 28, 130, 0.9)", "rgba(20, 8, 44, 1)"],
      obj: "#0a0418", objRim: "rgba(255, 113, 206, 0.95)", plantRim: "rgba(61, 255, 176, 0.55)", steam: "rgba(239, 230, 255, 0.22)",
      crownBase: [46, 28, 92], crownGlow: 0.55,
    },
    day: {
      sky: [[0, "#86b4ff"], [0.34, "#b5a9ff"], [0.64, "#f1a7d9"], [0.88, "#ffc4b4"], [1, "#ffe2ad"]],
      stars: 0, starSpread: 0, starBase: 0,
      cloud: () => [Math.random() < 0.55 ? "255, 255, 255" : "255, 205, 232", rand(0.1, 0.2)],
      haze: ["rgba(255, 226, 205, 0)", "rgba(255, 226, 205, 0.5)"],
      hills: "rgba(176, 156, 222, 0.7)",
      win: 0.45, winColors: ["#fff6e6", "#d9ecff", "#ffe1f1"], winAlpha: 0.55,
      tower: ["#5f4c9c", "#7f6bbd", "#ffd9ea"], back: ["#a08fd6", "#b3a4e4"], front: ["#58468f", "#6a57a3"],
      rim: "rgba(255, 245, 250, 0.85)",
      ground: ["#a48ad2", "#6f56a2"], rows: ["#9781c9", "#8169b6", "#6a539f"], rowRim: "rgba(255, 245, 250, 0.6)",
      fw: ["#5c4892", "rgba(255, 255, 255, 0.7)", "#6a56a0"],
      bridge: "#6c5fa6", bayLights: 0.25, deckLights: "rgba(255, 255, 255, 0.5)",
      tree: ["#3f2f6c", "rgba(255, 255, 255, 0.45)", "rgba(255, 255, 255, 0.3)"],
      wood: "#cdbdf0", frameRim: "rgba(255, 255, 255, 0.8)",
      sill: ["#efe6ff", "#d3c3f5"], sillLine: "rgba(255, 255, 255, 0.95)",
      desk: ["#dccdfb", "#a993d9"], deskEdge: "rgba(255, 113, 206, 0.7)",
      curtain: ["rgba(255, 180, 222, 0)", "rgba(255, 180, 222, 0.75)", "rgba(244, 150, 205, 0.9)", "rgba(255, 196, 228, 0.85)", "rgba(230, 140, 196, 1)"],
      obj: "#4a3683", objRim: "rgba(255, 255, 255, 0.9)", plantRim: "rgba(255, 255, 255, 0.7)", steam: "rgba(90, 70, 150, 0.3)",
      crownBase: [150, 130, 205], crownGlow: 0.2,
    },
  };
  const stored = (() => {
    try {
      return localStorage.getItem("ensslin-mode");
    } catch {
      return null;
    }
  })();
  let mode = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "day" : "night");
  let P = PAL[mode];
  document.body.dataset.mode = mode;

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[(Math.random() * list.length) | 0];

  function windowsFor(L, T, w, h, density) {
    density *= P.win;
    const out = [];
    for (let y = T + 4; y < T + h - 3; y += 5) {
      for (let x = L + 2.5; x < L + w - 3; x += 4) {
        if (Math.random() < density) out.push([x, y, pick(P.winColors)]);
      }
    }
    return out;
  }

  function layer() {
    const c = document.createElement("canvas");
    c.width = canvas.width;
    c.height = canvas.height;
    const g = c.getContext("2d");
    g.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { c, g };
  }

  function layout() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const narrow = W < 700;
    const box = stage.getBoundingClientRect();
    const caseBox = document.querySelector(".case").getBoundingClientRect();
    const rowBox = document.querySelector(".desk-row").getBoundingClientRect();
    const monBox = document.querySelector(".monitor").getBoundingClientRect();
    const U = Math.min(H, Math.max(window.innerHeight, 600));
    const deskTop = caseBox.bottom - box.top - 2;
    const frame = {
      top: U * 0.035,
      left: W * 0.025,
      right: W * 0.975,
      bottom: deskTop - U * 0.035,
      mullion: Math.max(10, W * 0.009),
    };
    const horizon = frame.top + (frame.bottom - frame.top) * 0.6;
    const side = Math.max(0, rowBox.left - box.left);
    const rel = (el) => {
      if (!el || !el.offsetParent) return null;
      const b = el.getBoundingClientRect();
      return { l: b.left - box.left, r: b.right - box.left, t: b.top - box.top, b: b.bottom - box.top };
    };
    const props = {
      caseBox: rel(document.querySelector(".case")),
      keys: rel(document.querySelector(".keyboard")),
      disks: rel(document.querySelector(".disk-box")),
    };
    const monL = narrow ? W * 0.5 : Math.max(frame.left + 140, monBox.left - box.left);
    const monR = narrow ? W * 0.5 : Math.min(frame.right - 140, monBox.right - box.left);
    const sfH = Math.min((horizon - frame.top) * 0.66, U * 0.38);
    const k = sfH / 10;
    const left = { a: frame.left, b: monL + 40 };
    const right = { a: monR - 40, b: frame.right };
    const lw = left.b - left.a;
    const rw = right.b - right.a;
    const d = frame.bottom - horizon;

    const stars = Array.from({ length: P.stars ? Math.round(W / P.stars) : 0 }, () => ({
      x: rand(0, W),
      y: rand(frame.top, frame.top + (horizon - frame.top) * P.starSpread),
      r: rand(0.4, 1.2),
      p: rand(0, Math.PI * 2),
      s: rand(600, 1500),
    }));

    const clouds = Array.from({ length: 22 }, () => {
      const w = rand(0.12, 0.38) * W;
      const puffs = Array.from({ length: 7 }, () => ({ dx: rand(-0.4, 0.4) * w, dy: rand(-4, 4), rx: rand(0.15, 0.35) * w, ry: rand(2, 7) }));
      const [cc, ca] = P.cloud();
      return {
        x: rand(-0.3, 1.1) * W,
        y: frame.top + rand(0.04, 0.82) * (horizon - frame.top),
        w,
        puffs,
        a: ca,
        s: rand(3, 9),
        c: cc,
      };
    });

    const deckY = horizon - sfH * 0.07;
    const towerH = sfH * 0.44;
    const t1 = right.a + rw * 0.32;
    const t2 = right.a + rw * 0.74;
    const sun = { x: (t1 + t2) / 2 + rw * 0.04, y: deckY + sfH * 0.02, r: Math.min(rw * 0.3, sfH * 0.5) };
    const moon = { x: (t1 + t2) / 2 + rw * 0.08, y: deckY - towerH - sfH * 0.42, r: Math.min(rw * 0.12, sfH * 0.17) };

    const hills = [];
    for (let x = right.a - 80, i = 0; x <= frame.right + 80; x += rw / 7, i++) {
      hills.push([x, horizon - sfH * rand(0.05, 0.15)]);
    }

    world = { narrow, U, side, props, frame, horizon, deskTop, stars, clouds, sun, moon, hills, deckY, towerH, t1, t2, right, left, sfH, d };

    const sky = layer();
    const g = sky.g;
    const haze = g.createLinearGradient(0, horizon - sfH * 0.5, 0, horizon);
    haze.addColorStop(0, P.haze[0]);
    haze.addColorStop(1, P.haze[1]);
    g.fillStyle = haze;
    g.fillRect(0, horizon - sfH * 0.5, W, sfH * 0.5);

    const back = [];
    for (let x = left.a - 20; x < left.b; ) {
      const w = rand(k * 0.9, k * 1.8);
      back.push({ x: x + w / 2, w, h: sfH * rand(0.18, 0.46), top: Math.random() < 0.3 ? "step" : "flat", dark: P.back[0], mid: P.back[1], layer: "back" });
      x += w + rand(0, k * 0.4);
    }
    const landmarks = [
      { x: left.a + lw * 0.12, w: k * 1.6, h: sfH * 0.4, top: "step" },
      { x: left.a + lw * 0.32, w: k * 1.75, h: sfH, top: "dome" },
      { x: left.a + lw * 0.47, w: k * 1.35, h: sfH * 0.72, top: "slant" },
      { x: left.a + lw * 0.58, w: k * 1.5, h: sfH * 0.58, top: "flat", gold: true },
      { x: left.a + lw * 0.68, w: k * 1.4, h: sfH * 0.5, top: "step" },
      { x: left.a + lw * 0.8, w: k * 1.3, h: sfH * 0.42, top: "flat" },
      { x: left.a + lw * 0.9, w: k * 1.15, h: sfH * 0.74, top: "tier" },
    ];
    const front = [];
    for (let x = left.a - 20; x < left.b; ) {
      const w = rand(k * 1.2, k * 2.6);
      front.push({ x: x + w / 2, w, h: sfH * rand(0.08, 0.22), top: "flat", dark: P.front[0], mid: P.front[1] });
      x += w + rand(0, k * 0.3);
    }
    for (let x = right.a - 20; x < right.b + 20; ) {
      const w = rand(k * 1.2, k * 2.8);
      front.push({ x: x + w / 2, w, h: sfH * rand(0.04, 0.12), top: "flat", dark: P.front[0], mid: P.front[1] });
      x += w + rand(0, k * 0.5);
    }
    for (const b of [...back, ...landmarks, ...front]) {
      const skip = b.top === "dome" ? b.w * 0.6 + b.h * 0.1 : b.top === "tier" ? b.h * 0.1 : 0;
      b.win = windowsFor(b.x - b.w / 2, horizon - b.h + skip, b.w, b.h - skip, b.layer === "back" ? 0.08 : 0.14);
    }
    world.sf = { ...landmarks[1], base: horizon };
    back.forEach((b) => tower(g, b, horizon));
    landmarks.forEach((b) => tower(g, b, horizon));
    front.forEach((b) => tower(g, b, horizon));
    world.skyline = sky.c;

    const mid = layer();
    const m = mid.g;
    const ground = m.createLinearGradient(0, horizon, 0, frame.bottom);
    ground.addColorStop(0, P.ground[0]);
    ground.addColorStop(1, P.ground[1]);
    m.fillStyle = ground;
    m.fillRect(0, horizon, W, frame.bottom - horizon);

    const fw = {
      p0: [frame.left - 40, horizon + d * 0.36],
      p1: [W * 0.5, horizon + d * 0.12],
      p2: [frame.right + 40, horizon + d * 0.3],
      lw: Math.max(5, d * 0.05),
    };
    world.freeway = fw;
    world.cars = Array.from({ length: Math.round(W / 26) }, () => ({ u: Math.random(), v: rand(0.00004, 0.00007), dir: Math.random() < 0.5 ? 1 : -1 }));

    const rows = [0.16, 0.5, 0.86];
    rows.forEach((f, i) => {
      if (i === 1) freewayStructure(m, fw, horizon + d * 0.5);
      const base = horizon + d * f;
      const shade = P.rows[i];
      for (let x = frame.left - 30; x < frame.right + 30; ) {
        const w = rand(16, 44) * (1 + i * 0.4);
        const h = d * rand(0.1, 0.22) * (1 + i * 0.35);
        m.fillStyle = shade;
        m.fillRect(x, base - h, w, h);
        if (i === 0) {
          m.fillStyle = P.rowRim;
          m.fillRect(x, base - h, w, 1);
        }
        for (const [wx, wy, c] of windowsFor(x, base - h, w, h, 0.1 + i * 0.03)) {
          m.fillStyle = c;
          m.globalAlpha = 0.8;
          m.fillRect(wx, wy, 2, 2.5);
        }
        m.globalAlpha = 1;
        x += w + rand(0, 6);
      }
    });
    world.midground = mid.c;

    const trees = layer();
    const tg = trees.g;
    if (!narrow) {
      eucalyptus(tg, right.b - rw * 0.06, frame.bottom + 6, Math.min(d * 1.05 + sfH * 0.2, U * 0.46), rw * 0.22);
    }
    world.trees = trees.c;
  }

  function tower(g, b, base) {
    const { x, w, h, top } = b;
    const L = x - w / 2;
    const R = x + w / 2;
    const T = base - h;
    g.beginPath();
    if (top === "dome") {
      g.moveTo(L, base);
      g.lineTo(L + w * 0.07, T + w * 0.6);
      g.quadraticCurveTo(x, T - w * 0.3, R - w * 0.07, T + w * 0.6);
      g.lineTo(R, base);
    } else if (top === "slant") {
      g.moveTo(L, base);
      g.lineTo(L, T + h * 0.09);
      g.lineTo(R, T);
      g.lineTo(R, base);
    } else if (top === "tier") {
      g.moveTo(L, base);
      g.lineTo(L, T + h * 0.1);
      g.lineTo(L + w * 0.16, T + h * 0.1);
      g.lineTo(L + w * 0.16, T + h * 0.04);
      g.lineTo(R - w * 0.16, T + h * 0.04);
      g.lineTo(R - w * 0.16, T + h * 0.1);
      g.lineTo(R, T + h * 0.1);
      g.lineTo(R, base);
    } else if (top === "step") {
      g.moveTo(L, base);
      g.lineTo(L, T + h * 0.07);
      g.lineTo(L + w * 0.22, T + h * 0.07);
      g.lineTo(L + w * 0.22, T);
      g.lineTo(R, T);
      g.lineTo(R, base);
    } else {
      g.rect(L, T, w, h);
    }
    g.closePath();
    const face = g.createLinearGradient(L, 0, R, 0);
    face.addColorStop(0, b.dark || P.tower[0]);
    face.addColorStop(0.62, b.mid || P.tower[1]);
    face.addColorStop(1, P.tower[2]);
    g.fillStyle = face;
    g.fill();
    if (b.gold) {
      g.save();
      g.clip();
      const gold = g.createLinearGradient(0, T, 0, base);
      gold.addColorStop(0, "rgba(255, 214, 140, 0.75)");
      gold.addColorStop(0.5, "rgba(255, 160, 120, 0.35)");
      gold.addColorStop(1, "rgba(255, 160, 120, 0)");
      g.fillStyle = gold;
      g.fillRect(L, T, w * 0.62, h);
      g.restore();
    }
    for (const [wx, wy, c] of b.win) {
      g.fillStyle = c;
      g.globalAlpha = P.winAlpha;
      g.fillRect(wx, wy, 1.6, 2.2);
    }
    g.globalAlpha = 1;
    if (top === "dome") {
      g.strokeStyle = P.rim;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R - w * 0.07 - 0.5, T + w * 0.6);
      g.lineTo(R - 0.5, base);
      g.stroke();
    } else {
      g.fillStyle = P.rim;
      g.fillRect(R - 1, T, 1, h);
    }
    g.strokeStyle = P.tower[1];
    g.lineWidth = 1.2;
    if (top === "slant") {
      g.beginPath();
      g.moveTo(R - w * 0.18, T + h * 0.015);
      g.lineTo(R - w * 0.18, T - h * 0.13);
      g.stroke();
    }
    if (top === "tier") {
      g.beginPath();
      g.moveTo(x, T + h * 0.04);
      g.lineTo(x, T - h * 0.06);
      g.stroke();
    }
    if (top === "dome") {
      g.fillStyle = "rgba(255, 220, 245, 0.18)";
      for (let i = 1; i < 4; i++) g.fillRect(L + (w * i) / 4, T + w * 0.7, 0.8, h - w * 0.7);
    }
  }

  function quad(fw, u) {
    const [x0, y0] = fw.p0;
    const [x1, y1] = fw.p1;
    const [x2, y2] = fw.p2;
    const a = (1 - u) * (1 - u);
    const b = 2 * (1 - u) * u;
    const c = u * u;
    return [a * x0 + b * x1 + c * x2, a * y0 + b * y1 + c * y2];
  }

  function freewayStructure(g, fw, ground) {
    g.fillStyle = P.fw[2];
    for (let u = 0.02; u < 1; u += 0.045) {
      const [x, y] = quad(fw, u);
      g.fillRect(x - 2, y, 4, ground - y);
    }
    g.lineCap = "butt";
    g.strokeStyle = P.fw[0];
    g.lineWidth = fw.lw;
    g.beginPath();
    g.moveTo(...fw.p0);
    g.quadraticCurveTo(...fw.p1, ...fw.p2);
    g.stroke();
    g.strokeStyle = P.fw[1];
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(fw.p0[0], fw.p0[1] - fw.lw / 2);
    g.quadraticCurveTo(fw.p1[0], fw.p1[1] - fw.lw / 2, fw.p2[0], fw.p2[1] - fw.lw / 2);
    g.stroke();
  }

  function eucalyptus(g, x, base, h, spread) {
    const clusters = Array.from({ length: 7 }, (_, i) => ({
      cx: x + rand(-spread * 0.5, spread * 0.5),
      cy: base - h * (0.35 + (i / 7) * 0.6),
      rx: spread * rand(0.25, 0.45),
      ry: h * rand(0.08, 0.14),
    }));
    const leaves = [];
    for (const c of clusters) {
      for (let i = 0; i < 160; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        leaves.push([c.cx + Math.cos(a) * c.rx * r, c.cy + Math.sin(a) * c.ry * r, rand(-2, 2), rand(9, 20)]);
      }
    }
    const branches = clusters.map((c) => [c.cx, c.cy]);
    const paint = (color, dx, dy) => {
      g.strokeStyle = color;
      g.lineWidth = Math.max(3, h * 0.016);
      g.beginPath();
      g.moveTo(x + dx, base + dy);
      g.quadraticCurveTo(x + spread * 0.1 + dx, base - h * 0.5 + dy, x - spread * 0.05 + dx, base - h * 0.95 + dy);
      g.stroke();
      g.lineWidth = Math.max(1.2, h * 0.006);
      for (const [bx, by] of branches) {
        g.beginPath();
        g.moveTo(x + spread * 0.04 + dx, by + h * 0.12 + dy);
        g.quadraticCurveTo((x + bx) / 2 + dx, by + dy, bx + dx, by + dy);
        g.stroke();
      }
      g.lineWidth = 1.6;
      g.beginPath();
      for (const [lx, ly, sx, sy] of leaves) {
        g.moveTo(lx + dx, ly + dy);
        g.lineTo(lx + sx + dx, ly + sy + dy);
      }
      g.stroke();
    };
    paint(P.tree[2], 1.2, -0.8);
    paint(P.tree[0], 0, 0);
  }

  function drawSky(t) {
    const { frame, horizon } = world;
    const fill = ctx.createLinearGradient(0, frame.top, 0, horizon);
    for (const [o, c] of P.sky) fill.addColorStop(o, c);
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, W, horizon);

    for (const s of world.stars) {
      const a = P.starBase + 0.5 * (0.5 + 0.5 * Math.sin(t / s.s + s.p));
      ctx.fillStyle = `rgba(255, 245, 255, ${a})`;
      ctx.fillRect(s.x, s.y, s.r * 1.5, s.r * 1.5);
    }

    for (const c of world.clouds) {
      const span = W + c.w * 2;
      const x = ((((c.x + (still.matches ? 0 : (t / 1000) * c.s)) + c.w) % span) + span) % span - c.w;
      ctx.fillStyle = `rgba(${c.c}, ${c.a})`;
      for (const p of c.puffs) {
        for (const grow of [1.6, 1.25, 1]) {
          ctx.beginPath();
          ctx.ellipse(x + p.dx, c.y + p.dy, p.rx * grow, p.ry * grow, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    return fill;
  }

  function drawMoon(fill, t) {
    const { x, y, r } = world.moon;
    if (r < 5) return;
    const breathe = still.matches ? 0.5 : 0.5 + 0.5 * Math.sin(t / 2200);
    const halo = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 5);
    halo.addColorStop(0, `rgba(255, 140, 220, ${0.28 + breathe * 0.12})`);
    halo.addColorStop(0.35, `rgba(185, 120, 255, ${0.1 + breathe * 0.06})`);
    halo.addColorStop(1, "rgba(185, 120, 255, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255, 113, 206, ${0.3 + breathe * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(45, 226, 255, ${0.14 + (1 - breathe) * 0.14})`;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = "rgba(255, 120, 210, 0.95)";
    ctx.shadowBlur = r * 1.1;
    const body = ctx.createLinearGradient(0, y - r, 0, y + r);
    body.addColorStop(0, "#fff6fc");
    body.addColorStop(0.45, "#ffc9ec");
    body.addColorStop(0.75, "#e2a6f5");
    body.addColorStop(1, "#a993ff");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r + 0.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = fill;
    for (let i = 0; i < 5; i++) {
      const gy = y + r * (0.2 + i * 0.165);
      ctx.fillRect(x - r - 2, gy, r * 2 + 4, 1 + i * r * 0.026);
    }
    ctx.restore();
  }

  function drawSun(fill, t) {
    if (mode === "night") return drawMoon(fill, t);
    const { x, y, r } = world.sun;
    if (r < 8) return;
    ctx.save();
    ctx.shadowColor = "rgba(255, 90, 160, 0.9)";
    ctx.shadowBlur = r * 0.5;
    const g = ctx.createLinearGradient(0, y - r, 0, y);
    g.addColorStop(0, "#fff0a8");
    g.addColorStop(0.55, "#ff9a7a");
    g.addColorStop(1, "#ff5fa2");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = fill;
    for (let i = 0; i < 6; i++) {
      const gy = y - r * 0.55 + i * r * 0.1;
      ctx.fillRect(x - r - 2, gy, r * 2 + 4, 1 + i * r * 0.016);
    }
  }

  function drawHills() {
    const { hills, horizon } = world;
    ctx.fillStyle = P.hills;
    ctx.beginPath();
    ctx.moveTo(hills[0][0], horizon);
    ctx.lineTo(hills[0][0], hills[0][1]);
    for (let i = 1; i < hills.length; i++) {
      const [px, py] = hills[i - 1];
      const [x, y] = hills[i];
      ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
    }
    ctx.lineTo(hills[hills.length - 1][0], horizon);
    ctx.closePath();
    ctx.fill();
  }

  function drawBridge(t) {
    const { deckY, towerH, t1, t2, right, horizon } = world;
    if (right.b - right.a < 60) return;
    const topY = deckY - towerH;
    const x0 = right.a - 60;
    const x3 = right.b + 60;
    const sag = deckY - 3;
    const cy = 2 * sag - topY;
    const sideL = { c: [(x0 + t1) / 2, deckY - towerH * 0.15] };
    const sideR = { c: [(t2 + x3) / 2, deckY - towerH * 0.15] };
    const curves = [
      [[x0, deckY - 2], sideL.c, [t1, topY]],
      [[t1, topY], [(t1 + t2) / 2, cy], [t2, topY]],
      [[t2, topY], sideR.c, [x3, deckY - 2]],
    ];
    const at = (cv, u) => {
      const [[ax, ay], [bx, by], [cx, cyy]] = cv;
      const a = (1 - u) * (1 - u);
      const b = 2 * (1 - u) * u;
      const c = u * u;
      return [a * ax + b * bx + c * cx, a * ay + b * by + c * cyy];
    };

    ctx.lineWidth = 1;
    for (const cv of curves) {
      const steps = Math.max(8, Math.round((cv[2][0] - cv[0][0]) / 5));
      for (let i = 1; i < steps; i++) {
        const [x, y] = at(cv, i / steps);
        const wave = still.matches ? 0.5 : Math.pow(0.5 + 0.5 * Math.sin(x * 0.045 - t / 260), 6);
        const a = (0.18 + 0.75 * wave) * P.bayLights;
        ctx.strokeStyle = `rgba(235, 245, 255, ${a})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, deckY);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = P.bridge;
    ctx.lineWidth = 1.6;
    for (const cv of curves) {
      ctx.beginPath();
      ctx.moveTo(...cv[0]);
      ctx.quadraticCurveTo(...cv[1], ...cv[2]);
      ctx.stroke();
    }

    for (const tx of [t1, t2]) {
      const leg = Math.max(2, towerH * 0.035);
      const gapW = Math.max(5, towerH * 0.11);
      ctx.fillStyle = P.bridge;
      ctx.fillRect(tx - gapW / 2 - leg, topY, leg, horizon - topY);
      ctx.fillRect(tx + gapW / 2, topY, leg, horizon - topY);
      for (const f of [0.02, 0.3, 0.6]) ctx.fillRect(tx - gapW / 2 - leg, topY + towerH * f, gapW + leg * 2, leg * 0.8);
      ctx.fillStyle = P.rim;
      ctx.fillRect(tx + gapW / 2 + leg - 1, topY, 1, horizon - topY);
      if (Math.sin(t / 600 + tx) > 0) {
        ctx.fillStyle = "#ff3d5a";
        ctx.fillRect(tx - 1.5, topY - 3, 3, 3);
      }
    }

    ctx.fillStyle = P.bridge;
    ctx.fillRect(x0, deckY, x3 - x0, Math.max(3, towerH * 0.05));
    ctx.fillStyle = P.deckLights;
    for (let x = x0; x < x3; x += 7) ctx.fillRect(x, deckY + 1, 1.5, 1.2);
  }

  const LED_COLS = 24;
  const LED_ROWS = 13;
  const led = document.createElement("canvas");
  led.width = LED_COLS;
  led.height = LED_ROWS;
  const lg = led.getContext("2d");
  const ledData = lg.createImageData(LED_COLS, LED_ROWS);

  function seg(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const u = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(px - ax - dx * u, py - ay - dy * u);
  }

  function walkers(c, r, t) {
    let v = 0;
    const px = c + 0.5;
    const py = r + 0.5;
    for (const [speed, offset, scale] of [[0.0016, 0, 1], [0.0011, 11, 0.8]]) {
      const span = LED_COLS + 10;
      const x = ((t * speed + offset) % span) - 5;
      const step = Math.sin(t * speed * 7 + offset) * 2.2 * scale;
      const top = LED_ROWS - 10.5 * scale;
      const s = scale;
      const d = Math.min(
        Math.hypot(px - x, py - (top + 1.4 * s)) - 1.25 * s,
        seg(px, py, x, top + 3 * s, x, top + 6.3 * s) - 0.9 * s,
        seg(px, py, x, top + 6.3 * s, x + step, top + 10.5 * s) - 0.55 * s,
        seg(px, py, x, top + 6.3 * s, x - step, top + 10.5 * s) - 0.55 * s,
        seg(px, py, x, top + 3.4 * s, x - step * 0.7, top + 6.4 * s) - 0.45 * s,
        seg(px, py, x, top + 3.4 * s, x + step * 0.7, top + 6.4 * s) - 0.45 * s
      );
      v = Math.max(v, Math.max(0, Math.min(1, 1 - d / 0.7)));
    }
    const bg = [90, 70, 150, 0.45 + 0.2 * Math.sin(c * 0.4 + t / 2000)];
    return v > 0.02 ? [255, 244, 228, Math.max(bg[3], v)] : bg;
  }

  function waves(c, r, t) {
    const v = 0.5 + 0.5 * Math.sin(c * 0.7 + t / 420 + Math.sin(r * 0.55 + t / 900) * 1.6);
    const crest = Math.pow(v, 3);
    return [120 + 135 * crest, 200 + 55 * crest, 255, 0.25 + 0.75 * v];
  }

  function clouds(c, r, t) {
    const v = 0.5 + 0.25 * Math.sin(c * 0.45 + t / 1300) + 0.25 * Math.sin(r * 0.7 - c * 0.2 + t / 1700);
    const puff = Math.max(0, v - 0.35) / 0.65;
    return [150 + 105 * puff, 140 + 115 * puff, 230 + 25 * puff, 0.35 + 0.65 * puff];
  }

  function drawCrown(t) {
    const sf = world.sf;
    if (!sf || sf.w < 14) return;
    const scenes = [walkers, waves, walkers, clouds];
    const period = 9000;
    const idx = Math.floor(t / period) % scenes.length;
    const next = (idx + 1) % scenes.length;
    const phase = (t % period) / period;
    const mix = phase > 0.85 ? (phase - 0.85) / 0.15 : 0;
    const base = P.crownBase;
    for (let r = 0; r < LED_ROWS; r++) {
      for (let c = 0; c < LED_COLS; c++) {
        const a = scenes[idx](c, r, t);
        const b = scenes[next](c, r, t);
        const i = (r * LED_COLS + c) * 4;
        for (let k = 0; k < 3; k++) {
          const ca = base[k] + (a[k] - base[k]) * a[3];
          const cb = base[k] + (b[k] - base[k]) * b[3];
          ledData.data[i + k] = ca + (cb - ca) * mix;
        }
        ledData.data[i + 3] = 255;
      }
    }
    lg.putImageData(ledData, 0, 0);

    const { x, w, h, base: ground } = sf;
    const T = ground - h;
    const L = x - w / 2;
    const R = x + w / 2;
    const apex = T + w * 0.15;
    const bottom = T + w * 0.6 + h * 0.09;
    const wallTop = T + w * 0.6;
    const inset = (w * 0.07 * (ground - bottom)) / (ground - wallTop) + 0.5;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(L + inset, bottom);
    ctx.lineTo(L + w * 0.07 + 0.5, wallTop);
    ctx.quadraticCurveTo(x, T - w * 0.3 + 0.5, R - w * 0.07 - 0.5, wallTop);
    ctx.lineTo(R - inset, bottom);
    ctx.closePath();
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(led, L, apex, w, bottom - apex);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(20, 10, 40, 0.35)";
    for (let i = 1; i < 6; i++) ctx.fillRect(L, apex + ((bottom - apex) * i) / 6, w, 0.7);
    ctx.restore();

    let rs = 0;
    let gs = 0;
    let bs = 0;
    const n = LED_COLS * LED_ROWS;
    for (let i = 0; i < n * 4; i += 4) {
      rs += ledData.data[i];
      gs += ledData.data[i + 1];
      bs += ledData.data[i + 2];
    }
    const cx = x;
    const cy = (apex + bottom) / 2;
    const radius = w * 1.4;
    const glow = ctx.createRadialGradient(cx, cy, w * 0.2, cx, cy, radius);
    glow.addColorStop(0, `rgba(${rs / n | 0}, ${gs / n | 0}, ${bs / n | 0}, ${P.crownGlow})`);
    glow.addColorStop(1, `rgba(${rs / n | 0}, ${gs / n | 0}, ${bs / n | 0}, 0)`);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCars(t) {
    const fw = world.freeway;
    for (const c of world.cars) {
      const u = still.matches ? c.u : (c.u + t * c.v) % 1;
      const [x, y] = quad(fw, c.dir > 0 ? u : 1 - u);
      ctx.fillStyle = c.dir > 0 ? "rgba(255, 250, 230, 0.95)" : "rgba(255, 70, 100, 0.95)";
      ctx.fillRect(x, y + (c.dir > 0 ? -fw.lw * 0.25 : fw.lw * 0.05), 3, 1.6);
    }
  }

  function room(t) {
    const { frame, deskTop } = world;
    const wood = P.wood;
    ctx.fillStyle = wood;
    ctx.fillRect(0, 0, W, frame.top);
    ctx.fillRect(0, 0, frame.left, H);
    ctx.fillRect(frame.right, 0, W - frame.right, H);
    ctx.fillRect(0, frame.bottom, W, H - frame.bottom);
    ctx.fillRect(W / 2 - frame.mullion / 2, frame.top, frame.mullion, frame.bottom - frame.top);

    ctx.fillStyle = P.frameRim;
    ctx.fillRect(frame.left, frame.top, 1.5, frame.bottom - frame.top);
    ctx.fillRect(W / 2 + frame.mullion / 2 - 1.5, frame.top, 1.5, frame.bottom - frame.top);
    ctx.fillRect(frame.left, frame.top, frame.right - frame.left, 1.5);

    const sill = ctx.createLinearGradient(0, frame.bottom, 0, deskTop);
    sill.addColorStop(0, P.sill[0]);
    sill.addColorStop(1, P.sill[1]);
    ctx.fillStyle = sill;
    ctx.fillRect(0, frame.bottom, W, deskTop - frame.bottom);
    ctx.fillStyle = P.sillLine;
    ctx.fillRect(0, frame.bottom, W, 1.5);

    const desk = ctx.createLinearGradient(0, deskTop, 0, H);
    desk.addColorStop(0, P.desk[0]);
    desk.addColorStop(1, P.desk[1]);
    ctx.fillStyle = desk;
    ctx.fillRect(0, deskTop, W, H - deskTop);
    ctx.fillStyle = P.deskEdge;
    ctx.fillRect(0, deskTop, W, 2);

    const curtain = ctx.createLinearGradient(frame.right - W * 0.06, 0, W, 0);
    [0, 0.3, 0.55, 0.75, 1].forEach((o, i) => curtain.addColorStop(o, P.curtain[i]));
    ctx.fillStyle = curtain;
    ctx.fillRect(frame.right - W * 0.06, 0, W * 0.06 + (W - frame.right), frame.bottom);

    const { U, props } = world;
    const cb = props.caseBox;
    const leftGap = cb ? cb.l - frame.left : 0;
    const rightGap = cb ? frame.right - cb.r : 0;
    const pad = 10;

    const bunnyCounter = Math.min(U * 0.11, (leftGap - pad * 2) / 1.2);
    const speakerCounter = Math.min(U * 0.17, (rightGap - pad * 2) / 0.62);

    const front = props.disks ? props.disks.b : deskTop + Math.min(U * 0.11, 90);
    const leftEdge = props.keys ? props.keys.l : props.disks ? props.disks.l : W * 0.35;
    const rightEdge = props.disks ? props.disks.r : W * 0.65;
    const frontLeft = leftEdge - frame.left;
    const frontRight = frame.right - rightEdge;

    const bunnyUp = bunnyCounter >= 40;
    const speakerUp = speakerCounter >= 46;
    const speakerRight = !speakerUp && frontRight > 50;
    const speakerLeft = !speakerUp && !speakerRight;

    if (bunnyUp) {
      const bx = frame.left + pad + bunnyCounter * 0.62;
      bunny(bx, deskTop, bunnyCounter, t);
      const mugSize = Math.min(U * 0.05, bunnyCounter * 0.45);
      const mx = cb.l - pad - mugSize * 0.6;
      if (mx - mugSize * 0.5 > bx + bunnyCounter * 0.7) mug(mx, deskTop, mugSize, t);
    }

    const leftItems = (bunnyUp ? 0 : 1) + (speakerLeft ? 1 : 0);
    if (leftItems && frontLeft > 44) {
      const slot = (frontLeft - pad) / leftItems;
      let x = frame.left + pad / 2;
      if (!bunnyUp) {
        const s = Math.min(U * 0.08, (slot - pad) / 1.2);
        bunny(x + slot / 2, front, s, t);
        x += slot;
      }
      if (speakerLeft && slot > 34) {
        const s = Math.min(U * 0.11, (slot - pad) / 0.62);
        speaker(x + slot / 2, front, s, t);
      }
    }

    if (speakerUp) {
      speaker(cb.r + rightGap / 2, deskTop, speakerCounter, t);
    } else if (speakerRight) {
      const s = Math.min(U * 0.11, (frontRight - pad * 2) / 0.62);
      speaker(rightEdge + frontRight / 2, front, s, t);
    }
  }

  function silhouette(draw, rim) {
    ctx.save();
    ctx.translate(2, -1);
    ctx.fillStyle = rim;
    draw();
    ctx.restore();
    ctx.fillStyle = P.obj;
    draw();
  }

  function bunny(x, base, s, t) {
    const twitch = still.matches ? 0 : Math.max(0, Math.sin(t / 900)) ** 30 * 0.12;
    const shape = () => {
      ctx.beginPath();
      ctx.ellipse(x, base - s * 0.32, s * 0.46, s * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + s * 0.34, base - s * 0.64, s * 0.23, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + s * 0.26, base - s * 1.02, s * 0.075, s * 0.27, -0.25 - twitch, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + s * 0.42, base - s * 1.0, s * 0.075, s * 0.27, 0.2 + twitch, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - s * 0.46, base - s * 0.36, s * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + s * 0.18, base - s * 0.04, s * 0.2, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    silhouette(shape, P.objRim);
    ctx.fillStyle = "rgba(45, 226, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(x + s * 0.42, base - s * 0.68, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  function mug(x, base, s, t) {
    silhouette(() => {
      ctx.fillRect(x - s * 0.35, base - s, s * 0.7, s);
      ctx.beginPath();
      ctx.arc(x + s * 0.38, base - s * 0.55, s * 0.2, -Math.PI / 2, Math.PI / 2);
      ctx.lineWidth = s * 0.1;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
    }, P.objRim);
    if (still.matches) return;
    ctx.strokeStyle = P.steam;
    ctx.lineWidth = 2;
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const p = i / 20;
        const sx = x - s * 0.1 + k * s * 0.2 + Math.sin(p * 5 + t / 500 + k * 2) * s * 0.12;
        const sy = base - s * 1.1 - p * s * 1.4;
        i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
      }
      ctx.stroke();
    }
  }

  function speaker(x, base, s, t) {
    const h = s * 0.92;
    const w = h * 0.64;
    const left = x - w / 2;
    const top = base - h;
    const playing = document.body.classList.contains("playing");
    const thump = playing && !still.matches && window.synthwave ? window.synthwave.beat() : 0;

    ctx.fillStyle = P.objRim;
    ctx.beginPath();
    ctx.roundRect(left + 1.5, top - 1, w, h, w * 0.08);
    ctx.fill();
    ctx.fillStyle = "#17131d";
    ctx.beginPath();
    ctx.roundRect(left, top, w, h, w * 0.08);
    ctx.fill();
    ctx.fillStyle = "#0e0b13";
    ctx.beginPath();
    ctx.roundRect(left + w * 0.06, top + w * 0.06, w * 0.88, h - w * 0.12, w * 0.05);
    ctx.fill();

    const tx = x;
    const ty = top + h * 0.2;
    const tr = w * 0.15;
    ctx.fillStyle = "#2a2433";
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
    const dome = ctx.createRadialGradient(tx - tr * 0.2, ty - tr * 0.2, 0, tx, ty, tr * 0.6);
    dome.addColorStop(0, "#d8d4e0");
    dome.addColorStop(1, "#4a4456");
    ctx.fillStyle = dome;
    ctx.beginPath();
    ctx.arc(tx, ty, tr * 0.55, 0, Math.PI * 2);
    ctx.fill();

    const wx = x;
    const wy = top + h * 0.58;
    const wr = w * 0.37;
    ctx.fillStyle = "#2a2433";
    ctx.beginPath();
    ctx.arc(wx, wy, wr, 0, Math.PI * 2);
    ctx.fill();
    const cr = wr * (0.84 + thump * 0.06);
    const cone = ctx.createRadialGradient(wx - cr * 0.25, wy - cr * 0.25, cr * 0.1, wx, wy, cr);
    cone.addColorStop(0, "#ffe45c");
    cone.addColorStop(0.7, "#f5c400");
    cone.addColorStop(1, "#b88a00");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.arc(wx, wy, cr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c99a00";
    ctx.beginPath();
    ctx.arc(wx, wy, cr * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(wx - cr * 0.08, wy - cr * 0.08, cr * 0.12, 0, Math.PI * 2);
    ctx.fill();
    if (thump > 0.05) {
      ctx.strokeStyle = `rgba(255, 228, 92, ${thump * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wx, wy, wr + 3 + (1 - thump) * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.roundRect(x - w * 0.24, top + h * 0.88, w * 0.48, h * 0.035, h * 0.02);
    ctx.fill();

    ctx.fillStyle = playing ? "#3dffb0" : "#3a3344";
    ctx.beginPath();
    ctx.arc(left + w * 0.82, top + h * 0.06 + w * 0.04, Math.max(1.5, w * 0.025), 0, Math.PI * 2);
    ctx.fill();
  }

  function frameDraw(t) {
    ctx.clearRect(0, 0, W, H);
    const fill = drawSky(t);
    drawSun(fill, t);
    drawHills();
    drawBridge(t);
    ctx.drawImage(world.skyline, 0, 0, W, H);
    drawCrown(t);
    ctx.drawImage(world.midground, 0, 0, W, H);
    drawCars(t);
    ctx.drawImage(world.trees, 0, 0, W, H);
    room(t);
  }

  function loop(t) {
    if (t - last > 33) {
      frameDraw(t);
      last = t;
    }
    if (!still.matches) requestAnimationFrame(loop);
  }

  const refresh = () => {
    layout();
    frameDraw(performance.now());
  };
  window.setMode = (next) => {
    mode = next === "day" ? "day" : "night";
    P = PAL[mode];
    document.body.dataset.mode = mode;
    try {
      localStorage.setItem("ensslin-mode", mode);
    } catch {}
    const btn = document.getElementById("mode-toggle");
    if (btn) {
      btn.textContent = mode === "day" ? "☾ night" : "☀ day";
      btn.setAttribute("aria-label", mode === "day" ? "Switch to night" : "Switch to day");
    }
    refresh();
    return mode;
  };
  window.getMode = () => mode;
  document.getElementById("mode-toggle")?.addEventListener("click", () => window.setMode(mode === "day" ? "night" : "day"));
  window.setMode(mode);
  refresh();
  if (!still.matches) requestAnimationFrame(loop);
  window.addEventListener("resize", refresh);
  document.fonts?.ready.then(refresh);
  new ResizeObserver(refresh).observe(stage);
})();
