/* SD Body — reveal-on-scroll, class-based only.
   No inline styles: JavaScript only toggles the `.in` class; every animation
   lives in site.css. Progressive enhancement — with no JS, content is visible. */
(function () {
  "use strict";

  var targets = document.querySelectorAll(".reveal, .unmask");
  if (!targets.length) return;

  // No IntersectionObserver (or reduced motion handled in CSS): just show everything.
  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add("in");
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });

  targets.forEach(function (el) { io.observe(el); });
})();
