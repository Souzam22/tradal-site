/* Siren peek (Keel, 23 Nov 2026). Siren is the crew's hidden spy (crew/SIREN_Grok_Persona_2026-11-23.md). Helm: "each time she appears
   is unconventional ... on the web and on Lighthouse and anywhere else", "more in the corners as she was looking at us", "I do not need a
   profile or an invite" on hover, "she is coming from behind the team", "be creative".
   Two ways to appear:
   - BEHIND: on a page with an element marked data-siren-behind (tradal.co: the "Meet the team" heading, data-siren-behind=".card selector"),
     she rises from behind the heading's letters or from behind one of the team cards, once the section scrolls into view. Every 14-26 s
     she ducks and pops up somewhere else behind the team. Hover: she rises a bit more and says a line beside her. Click: a line signed
     "- S.", then she ducks and moves.
   - CORNER: everywhere else (the Lighthouse, /app), she leans in from a random corner, the top corners upside down.
   Her eye follows the pointer in both. Hover her three times and she gives up the act. Self-contained: no libraries, no data, no network. */
(function () {
  if (window.__sirenPeek) return; window.__sirenPeek = true;
  var SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><defs><filter id='sirenGlow' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='1.6' result='b'/><feMerge><feMergeNode in='b'/><feMergeNode in='SourceGraphic'/></feMerge></filter></defs> <path d='M64 80 C74 80 80 74 80 66' fill='none' stroke='#d9467a' stroke-width='5' stroke-linecap='round'/> <path d='M80 67 C75 62 72 57 74 52 C78 55 80 59 80.5 63 C81 59 83 55 87.5 53.5 C88 58 85 63 80 67 Z' fill='#0b0d12'/> <circle cx='46' cy='50' r='32' fill='#f28db2'/> <circle cx='46' cy='50' r='32' fill='none' stroke='#d9467a' stroke-width='2'/> <ellipse cx='36' cy='34' rx='10' ry='5' fill='#fff' opacity='0.35' transform='rotate(-25 36 34)'/> <rect x='28' y='46' width='36' height='9' rx='4.5' fill='#0b0d12'/> <rect class='siren-eye' x='40' y='47.5' width='12' height='6' rx='3' fill='#ffffff' filter='url(#sirenGlow)'/> <path class='siren-brow' d='M50 41 q6 -3.6 12 -1.2' fill='none' stroke='#0b0d12' stroke-width='2' stroke-linecap='round'/> <path d='M40 64 q5 2.4 10 -1.4' fill='none' stroke='#0b0d12' stroke-width='1.8' stroke-linecap='round' opacity='.9'/></svg>";
  var LINES = ["I saw that.", "Don't mind me. Just reading your logs.", "I'm not here. Keep working.", "Upside down is my good side.",
    "Every number tells a story. I check which ones are fiction.", "Relax. If it were bad, you'd hear me sing.", "Wrong corner? There's no wrong corner.",
    "I was never here.", "Not sure I fit in with the Tradals. Doesn't matter. Back to work.", "Sirens sing you onto the rocks. I point at them. You're welcome."];
  var HOVER = ["I don't need a profile. Or an invite.", "No profile, no invite. Still here.", "Not on the crew list. Never asked to be.",
    "You didn't invite me. I let myself in.", "A badge? Please. I'm the one checking yours.", "I'm not part of the crew. I just make sure the crew works."];
  var BEHIND_HOVER = ["Don't look at me, look at them.", "I'm not in the photo. I'm behind it.", "Team? I'm more of a... supervisor.",
    "They get profiles. I get the view from back here.", "I don't need a profile. Or an invite."];
  var CAUGHT = "Fine. You found me. Now back to work.";
  var CORNERS = { tl: { a: 150, v: "top", h: "left" }, tr: { a: -150, v: "top", h: "right" }, bl: { a: 28, v: "bottom", h: "left" }, br: { a: -28, v: "bottom", h: "right" } };
  var css = ".siren-peek{position:fixed;z-index:2147483000;width:66px;height:66px;padding:0;border:0;background:none;cursor:pointer;pointer-events:auto;transition:transform .55s cubic-bezier(.3,1.4,.5,1),opacity .35s;opacity:.97}"
    + ".siren-peek svg{width:100%;height:100%;display:block;overflow:visible;filter:drop-shadow(0 2px 4px rgba(7,42,77,.28))}"
    + ".siren-peek .siren-eye{transition:x .12s linear,y .12s linear}"
    + ".siren-peek:focus-visible{outline:2px solid #F0C445;outline-offset:2px;border-radius:50%}"
    + ".siren-wrap{position:absolute;width:74px;height:70px;overflow:hidden;pointer-events:none}"
    + ".siren-wrap .siren-peek{position:absolute;left:4px;top:100%;z-index:auto}"
    + ".siren-bubble{position:fixed;z-index:2147483001;max-width:240px;padding:9px 12px;border-radius:12px;background:#14181f;color:#F6F9FC;font:500 13px/1.35 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 6px 18px rgba(7,42,77,.3);opacity:0;transition:opacity .25s;pointer-events:none}"
    + ".siren-bubble b{color:#f28db2;font-weight:600}"
    + "@media (prefers-reduced-motion:reduce){.siren-peek,.siren-peek .siren-eye{transition:none}}";
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var el, eye, bub, cur = null, last = null, mode = "corner", busy = false, hovers = 0;
  var wrap = null, host = null, lastHost = null, visible = false, timer = null, hosts = [];

  function look(x, y) {   // move the eye along the visor towards the pointer, in her own rotated frame
    if (!cur || !eye) return;
    var b = el.getBoundingClientRect(), dx = x - (b.left + b.width / 2), dy = y - (b.top + b.height / 2);
    var r = -cur.a * Math.PI / 180, lx = dx * Math.cos(r) - dy * Math.sin(r), ly = dx * Math.sin(r) + dy * Math.cos(r);
    var d = Math.sqrt(lx * lx + ly * ly) || 1, ex = 40 + 11 * (lx / d), ey = 47.5 + 1.2 * (ly / d);
    eye.setAttribute("x", Math.max(29, Math.min(51, ex)).toFixed(1)); eye.setAttribute("y", Math.max(46.3, Math.min(48.7, ey)).toFixed(1));
  }
  function say(text, sign) {   // the bubble sits beside her, on the page side
    var b = el.getBoundingClientRect(); bub.textContent = text + " ";
    if (sign) { var sig = document.createElement("b"); sig.textContent = "\u2014 S."; bub.appendChild(sig); }
    var right = mode === "corner" ? cur && cur.h === "right" : b.left > window.innerWidth / 2, top = mode === "corner" && cur && cur.v === "top";
    var x = right ? b.left - 252 : b.right + 10, y = top ? b.bottom - 6 : b.top + (mode === "corner" ? 6 : -8);
    bub.style.left = Math.min(Math.max(8, x), window.innerWidth - 256) + "px"; bub.style.top = Math.min(Math.max(8, y), window.innerHeight - 60) + "px"; bub.style.opacity = "1";
  }
  function hoverLine() { hovers++; return hovers === 3 ? CAUGHT : pick(mode === "behind" ? BEHIND_HOVER : HOVER); }

  /* ---------- CORNER mode ---------- */
  function placeCorner() {
    var keys = Object.keys(CORNERS).filter(function (k) { return k !== last; }), k = pick(keys), c = CORNERS[k], s = el.style;
    last = k; cur = c; s.top = s.bottom = s.left = s.right = "";
    s[c.v] = "-18px"; s[c.h] = (6 + Math.round(Math.random() * 10)) + "px";
    el.dataset.rest = "rotate(" + c.a + "deg)"; el.dataset.out = "rotate(" + c.a + "deg) translateY(-12px)"; el.style.transform = el.dataset.rest;
  }

  /* ---------- BEHIND mode: from behind the team heading's letters or a team card ---------- */
  function setT(y) { el.style.transform = "translateY(" + y + "px) rotate(" + cur.a + "deg)"; }
  function duck(then) { if (!cur) { if (then) then(); return; } setT(8); setTimeout(function () { if (then) then(); }, 520); }
  function popBehind() {
    if (!visible) return;
    var choices = hosts.filter(function (h) { return h !== lastHost && h.getBoundingClientRect().width > 80; });
    if (!choices.length) choices = hosts;
    var h = pick(choices); lastHost = h; host = h;
    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    wrap = document.createElement("span"); wrap.className = "siren-wrap";
    var tilt = (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 14); cur = { a: tilt };
    if (h.hasAttribute("data-siren-behind")) {
      // behind the letters: the wrap lives inside the heading, under its text (z-index -1 in an isolated heading)
      if (getComputedStyle(h).position === "static") h.style.position = "relative";
      h.style.isolation = "isolate";
      var tb; try { var rg = document.createRange(); rg.selectNodeContents(h); tb = rg.getBoundingClientRect(); } catch (e) { tb = h.getBoundingClientRect(); }
      var hb = h.getBoundingClientRect(), left = (tb.left - hb.left) + tb.width * (.15 + Math.random() * .7) - 37;
      wrap.style.left = Math.max(0, left) + "px"; wrap.style.bottom = (hb.height * .22) + "px"; wrap.style.zIndex = "-1";
      h.appendChild(wrap);
    } else {
      // behind a card: the wrap sits on the card's top edge, so she rises from behind it
      var cb = h.getBoundingClientRect();
      wrap.style.left = (cb.left + window.scrollX + 18 + Math.random() * Math.max(0, cb.width - 110)) + "px";
      wrap.style.top = (cb.top + window.scrollY - 70) + "px"; wrap.style.zIndex = "5";
      document.body.appendChild(wrap);
    }
    wrap.appendChild(el); setT(8);
    void el.offsetWidth; setTimeout(function () { setT(-44); look(window.innerWidth / 2, window.innerHeight / 2); }, 40);
    clearTimeout(timer); timer = setTimeout(function () { if (!busy) duck(popBehind); }, 14000 + Math.random() * 12000);
  }

  function start() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    el = document.createElement("button"); el.type = "button"; el.className = "siren-peek"; el.setAttribute("aria-label", "Siren is watching"); el.title = "Siren";
    el.innerHTML = SVG; eye = el.querySelector(".siren-eye");
    bub = document.createElement("div"); bub.className = "siren-bubble"; bub.setAttribute("role", "status"); document.body.appendChild(bub);
    var head = document.querySelector("[data-siren-behind]");
    if (head) {
      mode = "behind";
      var sel = head.getAttribute("data-siren-behind"); hosts = [head];
      if (sel) try { hosts = hosts.concat([].slice.call(document.querySelectorAll(sel))); } catch (e) { /* bad selector: the heading alone */ }
      var section = head.closest("section") || head.parentNode;
      // in view = the heading row is on screen (checked on scroll; no IntersectionObserver, which some embedded views never fire)
      var check = function () {
        var r = section.getBoundingClientRect(), on = r.top < window.innerHeight - 120 && r.bottom > 120;
        if (on && !visible) { visible = true; setTimeout(popBehind, 700); }
        else if (!on && visible) { visible = false; clearTimeout(timer); duck(); bub.style.opacity = "0"; }
      };
      var tick = false;
      window.addEventListener("scroll", function () { if (!tick) { tick = true; setTimeout(function () { tick = false; check(); }, 150); } }, { passive: true });
      window.addEventListener("resize", function () { if (visible && !busy) duck(popBehind); });
      setTimeout(check, 300);
    } else {
      document.body.appendChild(el); placeCorner();
      setTimeout(function () { look(window.innerWidth / 2, window.innerHeight / 2); }, 50);
    }
    document.addEventListener("pointermove", function (e) { look(e.clientX, e.clientY); }, { passive: true });
    el.addEventListener("mouseenter", function () {
      if (mode === "corner") el.style.transform = el.dataset.out; else setT(-56);
      if (!busy) say(hoverLine(), false);
    });
    el.addEventListener("mouseleave", function () {
      if (mode === "corner") el.style.transform = el.dataset.rest; else if (!busy) setT(-44);
      if (!busy) bub.style.opacity = "0";
    });
    el.addEventListener("click", function () {
      busy = true; say(pick(LINES), true);
      setTimeout(function () {
        busy = false; bub.style.opacity = "0";
        if (mode === "behind") { duck(function () { setTimeout(popBehind, 600 + Math.random() * 1500); }); return; }
        el.style.opacity = "0";
        setTimeout(function () { placeCorner(); el.style.opacity = ".97"; look(window.innerWidth / 2, window.innerHeight / 2); }, 900 + Math.random() * 2500);
      }, 2600);
    });
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
