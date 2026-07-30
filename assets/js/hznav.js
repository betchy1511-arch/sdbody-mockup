/* SD Body — hormones in-page section nav.
   Reveals a sticky tab bar once the visitor scrolls past the HRT Guide section,
   smooth-scrolls to each section group, and highlights the active tab (scrollspy).
   Progressive enhancement: with JS off, the anchors still work as plain links. */
(function () {
  "use strict";
  var bar = document.getElementById("hz-subnav");
  if (!bar) return;

  var header = document.querySelector(".header");
  var links = Array.prototype.slice.call(bar.querySelectorAll("a"));
  // show bar once we pass this section (configurable via data-reveal-after; falls back sensibly)
  var revealSel = bar.getAttribute("data-reveal-after");
  var sections = links.map(function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  var reveal = (revealSel && document.querySelector(revealSel)) ||
               document.getElementById("sec-guide") || sections[0];

  function headerH() { return header ? header.offsetHeight : 76; }

  function setHeaderVar() {
    document.documentElement.style.setProperty("--hz-header-h", headerH() + "px");
  }

  function update() {
    var hH = headerH();

    // 1. reveal / hide the bar
    if (reveal) {
      var passed = reveal.getBoundingClientRect().bottom <= hH + 4;
      bar.classList.toggle("show", passed);
    }

    // 2. scrollspy — active tab = last section whose top has crossed the bar
    var offset = hH + bar.offsetHeight + 10;
    var active = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top <= offset) active = i;
    }
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle("active", j === active);
    }
    // keep the active tab in view on the mobile strip
    var cur = links[active];
    if (cur && bar.classList.contains("show")) {
      var r = cur.getBoundingClientRect(), w = bar.querySelector(".wrap");
      if (r.left < 0) w.scrollLeft += r.left - 16;
      else if (r.right > window.innerWidth) w.scrollLeft += r.right - window.innerWidth + 16;
    }
  }

  function scrollTo(target) {
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.pageYOffset - (headerH() + bar.offsetHeight);
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); scrollTo(t); }
    });
  });

  setHeaderVar();
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", function () { setHeaderVar(); update(); });
})();
