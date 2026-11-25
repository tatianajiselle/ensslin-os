(() => {
  const screen = document.getElementById("screen");
  const term = document.getElementById("term");
  const promptLine = document.getElementById("prompt-line");
  const typed = document.getElementById("typed");
  const sink = document.getElementById("sink");
  const wake = document.getElementById("wake");
  const powerBtn = document.getElementById("power");
  const powerLed = document.getElementById("power-led");
  const driveLed = document.getElementById("drive-led");
  const keyboard = document.getElementById("keyboard");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");

  const EMAIL = "tatianaensslin@gmail.com";
  const LINKS = {
    resume: "img/Tatiana.Ensslin.Resume.pdf",
    linkedin: "https://www.linkedin.com/in/tatianaensslin",
    medium: "https://medium.com/@tatianaensslin",
    github: "https://github.com/tatianajiselle",
    saveabunny: "https://www.saveabunny.org/",
  };
  const FILES = ["now.log", "projects/", "community.txt", "offline.mp3", "contact.sh", "fib.lu", "resume.pdf"];
  const THEMES = ["pink", "cyan", "mint", "amber"];

  let on = false;
  let busy = false;
  let history = [];
  let cursor = 0;
  let theme = 0;
  let stageVisible = true;

  const wait = (ms) => new Promise((r) => setTimeout(r, still.matches ? 0 : ms));
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

  function out(html = "", cls = "") {
    const div = document.createElement("div");
    div.className = `line ${cls}`.trim();
    div.innerHTML = html;
    term.append(div);
    term.scrollTop = term.scrollHeight;
    return div;
  }

  const gap = () => out("", "gap");

  async function blinkDrive(ms = 500) {
    driveLed.classList.add("on");
    await wait(ms);
    driveLed.classList.remove("on");
  }

  function sunArt() {
    return [
      "      ▄▄██████▄▄      ",
      "   ▄████████████▄▄   ",
      "  ██████████████████  ",
      " ████████████████████ ",
      " ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ ",
      " ████████████████████ ",
      "  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ",
      "   ▀████████████▀   ",
      "      ▀▀▀▀▀▀▀▀      ",
    ].join("\n");
  }

  const commands = {
    help() {
      const list = [
        ["whoami", "who's this"],
        ["now", "current work"],
        ["projects", "what I'm building"],
        ["lucid", "my language"],
        ["community", "talks, writing"],
        ["offline", "away from keys"],
        ["contact", "say hello"],
        ["resume", "open resume.pdf"],
        ["tfetch", "system info"],
        ["music", "speaker on / off"],
        ["tracks", "techno playlist"],
        ["next / prev", "skip tracks"],
        ["theme", "change phosphor"],
        ["sky", "day or night"],
        ["bunny", "important"],
        ["ls / cat", "browse files"],
        ["clear", "clean screen"],
        ["shutdown", "power off"],
      ];
      out("available commands:", "hi");
      out(`<div class="help">${list.map(([c, d]) => `<span><b>${c}</b> <span class="d">${d}</span></span>`).join("")}</div>`);
      gap();
      out("tip: ↑ ↓ for history, tab to complete. or click a floppy.", "d");
    },

    whoami() {
      out(`<div class="who-row"><span class="photo-wrap"><img class="photo" src="img/newMe.png" alt="Tatiana Ensslin"></span><div class="chrome"><span>Tatiana</span><span>Ensslin</span></div></div>`);
      out("backend engineer · distributed systems · ai engineer", "c");
      gap();
      out("Backend engineer and tech lead with 9+ years building distributed systems. At Zillow I co-architected our messaging platform from 0 to 1, and right now I'm building an LLM-based risk engine on Jev. As an AI Champion, I also help people across the company learn to work with AI.");
      gap();
      out("San Francisco Bay Area. Raised in New York.", "d");
    },

    now() {
      out("[zillow] senior software engineer · messaging", "g");
      out("Co-architected Zillow's in-app messaging platform from 0 to 1, then scaled it nationally.");
      gap();
      out("users        <span class='c'>~4.2M a month</span>");
      out("traffic      <span class='c'>~1.3B requests a month at 128ms p95</span>");
      out("reliability  <span class='c'>no P1 incidents caused by the platform</span>");
      gap();
      out("Now building an LLM-based merge risk engine on Jev. It auto-approves 30-45% of low-risk merge requests, and median time-to-merge fell 76% in its first month, 17h → 4h.");
      gap();
      out("since 2024   <span class='c'>AI Champion: org power users went from 48% to 83%</span>");
      out("2024, 2025   <span class='c'>Exceptional Performance Rating, highest tier</span>");
      out("2017         <span class='c'>B.S. Computer Engineering, cum laude, Syracuse</span>");
      gap();
      out("stack  <span class='d'>Java · Spring · Kafka · Kubernetes · PostgreSQL · GraphQL · PubNub</span>");
    },

    projects() {
      out("drwxr-xr-x  <span class='hi'>lucid/</span>          a language agents write and humans read");
      out("drwxr-xr-x  <span class='hi'>merge-risk/</span>     LLM code review that cut time-to-merge 76%");
      out("drwxr-xr-x  <span class='hi'>messaging/</span>      Zillow's messaging platform, 1.3B req/month");
      out("drwxr-xr-x  <span class='hi'>claude-skills/</span>  a skills plugin installed across my org");
      gap();
      out("try: <span class='m'>lucid run fib.lu</span>", "d");
    },

    async lucid(args) {
      if (args[0] === "run") {
        const file = args[1] || "fib.lu";
        if (file !== "fib.lu") return out(`lucid: ${esc(file)}: no such file`, "err");
        out("compiling fib.lu → C → native", "d");
        await blinkDrive(400);
        out("<span class='ok'>ok</span> <span class='d'>0.04s</span>");
        out("[832040, 1346269, 2178309]", "m");
        return;
      }
      out("lucid: a programming language that agents write and humans read.", "hi");
      out("Compiles to native code through C. No comments, every argument named, every effect declared.");
      gap();
      commands.cat(["fib.lu"]);
      gap();
      out("usage: <span class='m'>lucid run fib.lu</span>", "d");
    },

    community() {
      out("150K+", "g");
      out(`views on my Medium stories. ${link(LINKS.medium, "read them")}`);
      gap();
      out("talks", "hi");
      out("2026  <span class='c'>Zillow AI Workshop</span> · Research-Plan-Implement + Spec-Driven Development");
      out("2025  <span class='c'>Zillow AI Workshop</span> · AI-Assisted Development for Greenfield Projects");
      out("2023  <span class='c'>Latinas in Tech</span> · Thriving in Remote Work");
      out("2021  <span class='c'>Zillow Summit</span> · Designing Distributed Streaming Apps");
      out("2019  <span class='c'>Datadog DASH</span> · A GraphQL Journey: How Zillow Overcame Production Chaos");
      gap();
      out("giving back", "hi");
      out("recruiting  <span class='c'>Grace Hopper, Latinas in Tech, RenderATL</span>");
      out("ongoing     <span class='c'>volunteering with SaveABunny</span>");
      out("2019-21     <span class='c'>Zillow Women in Tech, committee lead</span>");
      out("2019        <span class='c'>mentor, Hackbright Academy</span>");
    },

    async writing() {
      out("A:\\WRITING.LNK → medium.com/@tatianaensslin", "d");
      await blinkDrive(500);
      out(`150K+ views and counting. ${link(LINKS.medium, "open medium")}`);
      window.open(LINKS.medium, "_blank", "noopener");
    },

    offline() {
      out("now playing: offline.mp3", "hi");
      out("01  rock climbing");
      out("02  hiking the bay area");
      out("03  techno, loud");
      out("04  tech meetups");
      out("05  rabbits, always <span class='d'>(try: bunny)</span>");
    },

    bunny() {
      out(" (\\(\\", "hi");
      out(" ( -.-)", "hi");
      out(' o_(")(")', "hi");
      gap();
      out(`I volunteer with SaveABunny, a Bay Area rabbit rescue. ${link(LINKS.saveabunny, "adopt one")}`);
    },

    contact() {
      out("./contact.sh", "d");
      out(`email     <a href="mailto:${EMAIL}">${EMAIL}</a>`);
      out(`linkedin  ${link(LINKS.linkedin, "in/tatianaensslin")}`);
      out(`medium    ${link(LINKS.medium, "@tatianaensslin")}`);
      out(`github    ${link(LINKS.github, "tatianajiselle")}`);
      gap();
      out("Talks, mentoring, interesting backend problems, or rabbits. My inbox is open.", "c");
    },

    async resume() {
      out("A:\\RESUME.PDF", "d");
      await blinkDrive(600);
      out(`opening resume... ${link(LINKS.resume, "resume.pdf")}`);
      window.open(LINKS.resume, "_blank", "noopener");
    },

    linkedin() {
      window.open(LINKS.linkedin, "_blank", "noopener");
      out(`opening ${link(LINKS.linkedin, "linkedin")}`);
    },

    medium() {
      return commands.writing();
    },

    github() {
      window.open(LINKS.github, "_blank", "noopener");
      out(`opening ${link(LINKS.github, "github")}`);
    },

    tfetch() {
      const info = [
        "<span class='hi'>tatiana</span>@<span class='hi'>ensslin</span>",
        "<span class='d'>────────────────</span>",
        "<span class='c'>os</span>        ensslin/os 2026",
        "<span class='c'>role</span>      senior swe @ zillow",
        "<span class='c'>shell</span>     lucid",
        "<span class='c'>uptime</span>    since 2017 (syracuse ce)",
        "<span class='c'>location</span>  sf bay area",
        "<span class='c'>stack</span>     java, kafka, k8s",
        "<span class='c'>hobbies</span>   climbing, hiking, techno",
      ];
      const swatches = ["#ff71ce", "#ff3d9a", "#ff8a5c", "#ffd36e", "#3dffb0", "#2de2ff", "#b967ff", "#f2e9ff"];
      out(`<div class="fetch"><pre class="sun-art">${sunArt()}</pre><div>${info.map((l) => `<div>${l}</div>`).join("")}<div class="swatches">${swatches.map((c) => `<i style="background:${c}"></i>`).join("")}</div></div></div>`);
    },

    music() {
      if (!window.synthwave) return out("music: audio not available", "err");
      const playing = window.synthwave.toggle();
      if (playing) nowPlaying();
      else out("♪ paused. type music to resume", "d");
    },

    tracks() {
      if (!window.synthwave) return out("tracks: audio not available", "err");
      const now = window.synthwave.now;
      const list = window.synthwave.tracks;
      out("tracks", "hi");
      const width = Math.max(...list.map((tr) => tr.name.length)) + 2;
      list.forEach((tr, i) => {
        const mark = now.playing && now.index === i ? "<span class='m'>▶</span>" : " ";
        out(`${mark} ${String(i + 1).padStart(2)}  <span class='c'>${esc(tr.name).padEnd(width)}</span>${esc(tr.style)}${tr.bpm ? ` <span class='d'>${tr.bpm} bpm</span>` : ""}`);
      });
      gap();
      out(`play 1-${list.length}, next, prev, stop`, "d");
    },

    next() {
      if (!window.synthwave) return out("next: audio not available", "err");
      window.synthwave.next();
      nowPlaying();
    },

    prev() {
      if (!window.synthwave) return out("prev: audio not available", "err");
      window.synthwave.prev();
      nowPlaying();
    },

    stop() {
      if (!window.synthwave) return out("stop: audio not available", "err");
      window.synthwave.stop();
      out("♪ stopped", "d");
    },

    theme(args) {
      const pick = args[0] ? THEMES.indexOf(args[0]) : (theme + 1) % THEMES.length;
      if (pick < 0) return out(`theme: pick one of ${THEMES.join(", ")}`, "err");
      screen.classList.remove(`ph-${THEMES[theme]}`);
      theme = pick;
      screen.classList.add(`ph-${THEMES[theme]}`);
      out(`phosphor set to ${THEMES[theme]}`, "hi");
    },

    sky(args) {
      if (!window.setMode) return out("sky: not available", "err");
      const map = { day: "day", dusk: "day", sun: "day", night: "night", moon: "night" };
      const want = args[0] ? map[args[0]] : window.getMode() === "day" ? "night" : "day";
      if (!want) return out("sky: pick day or night", "err");
      const now = window.setMode(want);
      out(now === "night" ? "☾ night over potrero hill" : "☀ golden hour over potrero hill", "hi");
    },

    moon() {
      return commands.sky(["night"]);
    },

    sun() {
      return commands.sky(["day"]);
    },

    ls() {
      out(FILES.map((f) => (f.endsWith("/") ? `<span class='hi'>${f}</span>` : f)).join("   "));
    },

    cat(args) {
      const f = args[0];
      if (!f) return out("cat: which file? try ls", "err");
      if (f === "now.log") return commands.now();
      if (f === "community.txt") return commands.community();
      if (f === "contact.sh") return commands.contact();
      if (f === "resume.pdf") return commands.resume();
      if (f === "projects" || f === "projects/") return out("cat: projects/: is a directory. try: projects", "err");
      if (f === "offline.mp3") return out("cat: offline.mp3: binary file. try: play offline.mp3", "err");
      if (f === "fib.lu") {
        return out(`<pre class="code"><b>fn</b> fib(of n: Int) -&gt; Int
  <i>effects: none</i>
  <b>if</b> n &lt; 2
    <b>return</b> n
  <b>return</b> fib(of: n - 1) + fib(of: n - 2)

<b>fn</b> main()
  <i>effects: console</i>
  <b>let</b> counts = <b>parallel map</b> [30, 31, 32]: n =&gt; fib(of: n)
  print(line: "{counts}")</pre>`);
      }
      out(`cat: ${esc(f)}: no such file`, "err");
    },

    play(args) {
      if (!window.synthwave) return out("play: audio not available", "err");
      const arg = (args[0] || "").toLowerCase();
      if (arg === "offline.mp3") {
        commands.offline();
        if (!window.synthwave.playing) window.synthwave.play(0);
        return nowPlaying();
      }
      const list = window.synthwave.tracks;
      let index = arg ? Number(arg) - 1 : 0;
      if (Number.isNaN(index)) index = list.findIndex((tr) => tr.name.toLowerCase().includes(arg));
      if (index < 0 || index >= list.length) return out(`play: pick 1-${list.length}, or type tracks`, "err");
      window.synthwave.play(index);
      nowPlaying();
    },

    date() {
      out(new Date().toString());
    },

    echo(args) {
      out(esc(args.join(" ")));
    },

    history() {
      history.forEach((h, i) => out(`${String(i + 1).padStart(3)}  ${esc(h)}`));
    },

    clear() {
      term.innerHTML = "";
    },

    async sudo(args) {
      if (args.join(" ") === "hire tatiana") {
        out("[sudo] password for recruiter: ********", "d");
        await wait(600);
        out("access granted ✓", "ok");
        gap();
        return commands.contact();
      }
      out("nice try. this incident will be reported to the bunny.", "err");
    },

    hi() {
      out("hi there. type help to look around.", "hi");
    },

    vim() {
      out("you're stuck now. just kidding. :q", "d");
    },

    rm(args) {
      if (args.includes("-rf")) return out("nope. the bunny is protecting this system.", "err");
      out("rm: permission denied", "err");
    },

    async shutdown() {
      out("goodbye ✿", "hi");
      await wait(500);
      powerOff();
    },
  };

  const aliases = { skip: "next", back: "prev", pause: "stop", playlist: "tracks", techno: "tracks", night: "moon", day: "sun", dusk: "sun", light: "sun", dark: "moon", hello: "hi", work: "now", about: "whoami", exit: "shutdown", emacs: "vim", fetch: "tfetch", neofetch: "tfetch", hobbies: "offline", email: "contact", talks: "community", cd: "ls" };

  function nowPlaying() {
    const n = window.synthwave.now;
    const meta = [n.style, n.bpm ? `${n.bpm} bpm` : ""].filter(Boolean).join(" · ");
    out(`♪ now playing <span class='c'>${esc(n.name)}</span>  ${esc(meta)} <span class='d'>(next, prev, tracks)</span>`, "m");
  }

  async function run(raw) {
    const line = raw.trim();
    const echo = out(`<span class="ps1">tatiana@ensslin:~$</span> ${esc(line)}`, "echo");
    if (!line) return;
    history.push(line);
    cursor = history.length;
    const [name, ...args] = line.split(/\s+/);
    const key = aliases[name.toLowerCase()] || name.toLowerCase();
    const fn = commands[key];
    if (!fn) {
      out(`command not found: ${esc(name)}. try help`, "err");
      return;
    }
    driveLed.classList.add("on");
    setTimeout(() => driveLed.classList.remove("on"), 120);
    await fn(args);
    const em = parseFloat(getComputedStyle(term).fontSize);
    const overflow = term.scrollHeight - echo.offsetTop - term.clientHeight;
    term.scrollTop = overflow > em * 3 ? echo.offsetTop - em * 0.6 : term.scrollHeight;
  }

  function setTyped(v) {
    typed.textContent = v;
  }

  async function submit() {
    const v = sink.value;
    sink.value = "";
    setTyped("");
    busy = true;
    await run(v);
    busy = false;
  }

  function complete() {
    const v = sink.value;
    const parts = v.split(/\s+/);
    const pool = parts.length > 1 ? FILES.map((f) => f.replace(/\/$/, "")) : [...Object.keys(commands), ...Object.keys(aliases)];
    const last = parts[parts.length - 1].toLowerCase();
    const hits = [...new Set(pool.filter((p) => p.startsWith(last)))];
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      sink.value = parts.join(" ") + (parts.length === 1 ? " " : "");
    } else if (hits.length > 1) {
      out(`<span class="ps1">tatiana@ensslin:~$</span> ${esc(v)}`, "echo");
      out(hits.join("   "), "d");
    }
    setTyped(sink.value);
  }

  sink.addEventListener("input", () => {
    if (busy || !on) {
      sink.value = "";
      return;
    }
    setTyped(sink.value);
  });

  sink.addEventListener("keydown", (e) => {
    if (!on || busy) {
      if (e.key !== "Tab") e.preventDefault();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      cursor = Math.max(0, cursor - 1);
      sink.value = history[cursor] || "";
      setTyped(sink.value);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      sink.value = history[cursor] || "";
      setTyped(sink.value);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      commands.clear();
    }
  });

  sink.addEventListener("focus", () => screen.classList.add("focused"));
  sink.addEventListener("blur", () => screen.classList.remove("focused"));

  screen.addEventListener("click", (e) => {
    if (e.target.closest("a, .wake, [data-cmd]")) return;
    if (on) sink.focus({ preventScroll: true });
  });

  new IntersectionObserver(([entry]) => (stageVisible = entry.isIntersecting && entry.intersectionRatio > 0.4), { threshold: [0, 0.4, 1] }).observe(document.getElementById("rig"));

  document.addEventListener("keydown", (e) => {
    pressKey(e.key, true);
    if (document.activeElement === sink || !on || !stageVisible) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest("a, button, input, textarea")) return;
    if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter" || e.key === "ArrowUp") {
      sink.focus({ preventScroll: true });
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    }
  });

  document.addEventListener("keyup", (e) => pressKey(e.key, false));
  window.addEventListener("blur", () => keyboard.querySelectorAll(".down").forEach((k) => k.classList.remove("down")));

  const rows = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", { k: "backspace", l: "del", c: "w2" }],
    [{ k: "tab", l: "tab", c: "w15" }, "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    [{ k: "capslock", l: "caps", c: "w2" }, "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", { k: "enter", l: "enter", c: "w2" }],
    [{ k: "shift", l: "shift", c: "w2" }, "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", { k: "shift", l: "shift", c: "w2" }],
    [{ k: "control", l: "ctrl", c: "w15" }, { k: "alt", l: "alt", c: "w15" }, { k: " ", l: "", c: "space" }, { k: "arrowleft", l: "◀" }, { k: "arrowup", l: "▲" }, { k: "arrowdown", l: "▼" }, { k: "arrowright", l: "▶" }],
  ];
  const keyMap = new Map();
  const shifted = { "~": "`", "!": "1", "@": "2", "#": "3", $: "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0", _: "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/" };

  for (const row of rows) {
    const r = document.createElement("div");
    r.className = "krow";
    for (const spec of row) {
      const s = typeof spec === "string" ? { k: spec, l: spec } : spec;
      const el = document.createElement("span");
      el.className = `key ${s.c || ""}`.trim();
      el.textContent = s.l;
      r.append(el);
      if (!keyMap.has(s.k)) keyMap.set(s.k, []);
      keyMap.get(s.k).push(el);
    }
    keyboard.append(r);
  }

  function pressKey(key, down) {
    if (!key) return;
    let k = key.toLowerCase();
    k = shifted[k] || k;
    const els = keyMap.get(k);
    if (els) els.forEach((el) => el.classList.toggle("down", down));
  }

  async function flashKey(ch) {
    pressKey(ch, true);
    await wait(45);
    pressKey(ch, false);
  }

  async function typeAndRun(cmd) {
    if (!on) await powerOn();
    while (busy) await wait(50);
    busy = true;
    sink.value = "";
    setTyped("");
    for (const ch of cmd) {
      setTyped(typed.textContent + ch);
      await flashKey(ch);
      await wait(still.matches ? 0 : 28);
    }
    await flashKey("Enter");
    setTyped("");
    await run(cmd);
    busy = false;
  }

  async function insertDisk(disk) {
    const slot = document.querySelector(".slot");
    if (still.matches || !slot || !disk.animate) {
      blinkDrive(700);
      return;
    }
    const from = disk.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const ghost = disk.cloneNode(true);
    ghost.classList.add("disk-ghost");
    ghost.removeAttribute("style");
    ghost.style.setProperty("--label", disk.style.getPropertyValue("--label"));
    ghost.style.setProperty("--disk", `${from.width}px`);
    Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
    document.body.append(ghost);
    disk.classList.add("away");

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const lift = -from.height * 1.1;
    const flight = ghost.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
        { transform: `translate(0, ${lift}px) rotate(-4deg)`, offset: 0.22, easing: "cubic-bezier(.3,.7,.4,1)" },
        { transform: `translate(${dx}px, ${dy - from.height * 0.75}px) rotate(0deg) scale(0.95)`, offset: 0.68, easing: "ease-in-out" },
        { transform: `translate(${dx}px, ${dy - from.height * 0.5}px) perspective(300px) rotateX(55deg) scale(0.92)`, offset: 0.82 },
        { transform: `translate(${dx}px, ${dy}px) perspective(300px) rotateX(86deg) scale(0.86, 0.6)`, opacity: 0.2, offset: 1 },
      ],
      { duration: 1050, easing: "linear", fill: "forwards" }
    );
    await Promise.race([flight.finished, new Promise((r) => setTimeout(r, 1400))]);
    ghost.remove();
    blinkDrive(700);
    setTimeout(() => {
      disk.classList.remove("away");
      disk.animate(
        [
          { transform: `translateY(${-from.height}px)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: 420, easing: "cubic-bezier(.2,.8,.3,1.2)" }
      );
    }, 900);
  }

  document.querySelectorAll("[data-run]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.classList.contains("disk")) {
        if (btn.classList.contains("away")) return;
        await insertDisk(btn);
      }
      typeAndRun(btn.dataset.run);
    });
  });

  async function boot() {
    busy = true;
    on = true;
    term.innerHTML = "";
    screen.classList.remove("off", "powering-off");
    screen.classList.add("booting");
    wake.hidden = true;
    powerLed.classList.add("on");
    powerBtn.setAttribute("aria-label", "Power off");
    setTimeout(() => screen.classList.remove("booting"), 500);
    const post = [
      ["ENSSLIN BIOS v20.26   (c) 1995-2026", "hi"],
      ["cpu: computer engineering, syracuse '17 .... <span class='ok'>ok</span>"],
      ["memory: 4 engineers, 1 messaging platform .. <span class='ok'>ok</span>"],
      ["drives: A: floppy   B: bunny ............... <span class='ok'>ok</span>"],
      ["loading lucid kernel ...................... <span class='ok'>ok</span>"],
      ["mounting /home/tatiana .................... <span class='ok'>ok</span>"],
    ];
    await wait(350);
    for (const [l, c] of post) {
      out(l, c);
      driveLed.classList.toggle("on");
      await wait(170);
    }
    driveLed.classList.remove("on");
    await wait(380);
    term.innerHTML = "";
    commands.tfetch();
    gap();
    out("welcome. type <span class='hi'>help</span>, or click a floppy disk.", "c");
    if (window.synthwave) out("♪ the speaker's ready. <span class='hi'>click anywhere</span> or press <span class='hi'>enter</span> to turn it on", "m");
    promptLine.hidden = false;
    term.scrollTop = 0;
    busy = false;
    if (window.synthwave && !window.synthwave.playing) await suggest("music");
  }

  async function suggest(cmd) {
    for (const ch of cmd) {
      if (busy || !on || sink.value.length >= cmd.length) return;
      sink.value += ch;
      setTyped(sink.value);
      await flashKey(ch);
      await wait(still.matches ? 0 : 70);
    }
  }

  document.addEventListener("click", (e) => {
    if (!on || busy || !window.synthwave || window.synthwave.playing) return;
    if (sink.value.trim() !== "music") return;
    if (e.target.closest("a, button, input, .disk, [data-cmd]")) return;
    submit();
  });

  term.addEventListener("click", (e) => {
    const link = e.target.closest("[data-cmd]");
    if (!link || busy || !on) return;
    e.stopPropagation();
    const cmd = link.dataset.cmd;
    if (sink.value.trim() === cmd) submit();
    else typeAndRun(cmd);
  });

  function powerOn() {
    return boot();
  }

  function powerOff() {
    on = false;
    busy = false;
    sink.blur();
    promptLine.hidden = true;
    screen.classList.add("powering-off");
    powerLed.classList.remove("on");
    powerBtn.setAttribute("aria-label", "Power on");
    if (window.synthwave?.playing) window.synthwave.toggle();
    setTimeout(() => {
      screen.classList.add("off");
      screen.classList.remove("powering-off");
      term.innerHTML = "";
      wake.hidden = false;
    }, still.matches ? 0 : 520);
  }

  powerBtn.addEventListener("click", () => (on ? powerOff() : powerOn()));
  wake.addEventListener("click", () => powerOn());

  boot();
})();
