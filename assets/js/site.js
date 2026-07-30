/* SD Body — shared behaviour (progressive enhancement only) */
(function () {
  "use strict";
  var docEl = document.documentElement;
  docEl.classList.remove("no-js");
  docEl.classList.add("js");

  document.addEventListener("DOMContentLoaded", function () {
    /* ---- auto year ---- */
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    /* ---- Route form submissions to the Thank-you page (staging).
       In WordPress this is replaced by the Gravity Forms confirmation redirect. ---- */
    (function () {
      var css = document.querySelector('link[href$="assets/css/site.css"]');
      var prefix = css ? css.getAttribute("href").replace("assets/css/site.css", "") : "";
      var thankUrl = prefix + "thank-you.html";
      document.querySelectorAll(".sdb-form form, .gform_wrapper form").forEach(function (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          if (form.checkValidity && !form.checkValidity()) { form.reportValidity(); return; }
          window.location.href = thankUrl;
        });
      });
    })();

    /* ---- FAQ accordion: only one item open at a time (per group) ---- */
    (function () {
      var faqs = Array.prototype.filter.call(
        document.querySelectorAll("details"),
        function (d) { return d.querySelector(":scope > .faq-a"); }
      );
      faqs.forEach(function (d) {
        d.addEventListener("toggle", function () {
          if (!d.open) return;
          faqs.forEach(function (o) {
            if (o !== d && o.parentNode === d.parentNode && o.open) o.open = false;
          });
        });
      });
    })();

    /* ---- Gallery lightbox: click to zoom, prev/next, keyboard ---- */
    (function () {
      var links = Array.prototype.slice.call(document.querySelectorAll(".gallery-grid a"));
      if (!links.length) return;
      var items = links.map(function (a) {
        var cap = a.querySelector(".gallery-cap");
        return { src: a.getAttribute("href"), cap: cap ? cap.textContent : "" };
      });
      var idx = 0;
      var box = document.createElement("div");
      box.className = "lb";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-label", "Image viewer");
      box.innerHTML =
        '<button class="lb-close" aria-label="Close">×</button>' +
        '<button class="lb-btn lb-prev" aria-label="Previous image"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
        '<button class="lb-btn lb-next" aria-label="Next image"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
        '<figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption><div class="lb-count"></div></figure>';
      document.body.appendChild(box);
      var imgEl = box.querySelector(".lb-img"),
          capEl = box.querySelector(".lb-cap"),
          cntEl = box.querySelector(".lb-count");
      function show(i) {
        idx = (i + items.length) % items.length;
        imgEl.src = items[idx].src; imgEl.alt = items[idx].cap;
        capEl.textContent = items[idx].cap;
        cntEl.textContent = (idx + 1) + " / " + items.length;
      }
      function open(i) { show(i); box.classList.add("open"); document.body.style.overflow = "hidden"; }
      function close() { box.classList.remove("open"); document.body.style.overflow = ""; }
      links.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); open(i); }); });
      box.querySelector(".lb-close").addEventListener("click", close);
      box.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
      box.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
      box.addEventListener("click", function (e) { if (e.target === box) close(); });
      document.addEventListener("keydown", function (e) {
        if (!box.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") show(idx - 1);
        else if (e.key === "ArrowRight") show(idx + 1);
      });
    })();

    /* ---- Mobile menu: off-canvas panel + backdrop + accordion submenus ---- */
    (function () {
      var mb = document.querySelector(".menu-btn");
      var navEl = document.querySelector(".nav");
      if (!mb || !navEl) return;

      var CHEV = '<svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      // Animated hamburger -> X (3 bars)
      mb.innerHTML = '<span></span><span></span><span></span>';

      // Build the off-canvas nav items from the desktop WordPress-structure menu (ul.menu > li.menu-item)
      var items = "";
      var menuEl = navEl.querySelector(".menu");
      var topItems = menuEl ? menuEl.children : [];
      Array.prototype.forEach.call(topItems, function (li) {
        var link = li.querySelector(":scope > a");
        var sub = li.querySelector(":scope > .sub-menu");
        if (sub) {
          var label = link ? link.textContent.trim() : "Menu";
          var top = link ? link.getAttribute("href") : "#";
          var subHtml = "";
          sub.querySelectorAll(":scope > .menu-item > a").forEach(function (a) {
            subHtml += '<li><a href="' + a.getAttribute("href") + '">' + a.textContent.trim() + '</a></li>';
          });
          items += '<li class="has-sub"><div class="mobile-nav__row">' +
            '<a href="' + top + '">' + label + '</a>' +
            '<button type="button" class="mobile-nav__toggle" aria-expanded="false" aria-label="Toggle ' + label + ' submenu">' + CHEV + '</button>' +
            '</div><div class="mobile-nav__subwrap"><ul class="mobile-nav__sub">' + subHtml + '</ul></div></li>';
        } else if (link) {
          items += '<li><a href="' + link.getAttribute("href") + '">' + link.textContent.trim() + '</a></li>';
        }
      });

      // CTA row (clone the header's book/call intent)
      var bookBtn = document.querySelector('.header-cta a.btn[href$="contact.html"]');
      var bookHref = bookBtn ? bookBtn.getAttribute("href") : "contact.html";
      var phone = document.querySelector(".header-phone, .utility a[href^='tel:']");
      var phoneHref = phone ? phone.getAttribute("href") : "";
      var phoneTxt = phone ? phone.textContent.trim() : "";
      var ctaHtml = '<div class="mobile-menu__cta">' +
        '<a class="btn btn-primary" href="' + bookHref + '">Book now</a>' +
        (phoneHref ? '<a class="mm-call calllink" href="' + phoneHref + '">' + (phoneTxt || "Call now") + '</a>' : '') +
        '</div>';

      var backdrop = document.createElement("div");
      backdrop.className = "mobile-backdrop";
      var menu = document.createElement("aside");
      menu.className = "mobile-menu";
      menu.id = "mobileMenu";
      menu.setAttribute("aria-hidden", "true");
      menu.setAttribute("aria-label", "Mobile menu");
      menu.innerHTML =
        '<div class="mobile-menu__head"><span class="mobile-menu__brand">Menu</span>' +
        '<button class="mobile-menu__close" data-menu-close aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
        '<nav class="mobile-nav" aria-label="Mobile primary"><ul class="mobile-nav__list">' + items + '</ul></nav>' +
        ctaHtml;
      document.body.appendChild(backdrop);
      document.body.appendChild(menu);

      var closeSubs = function () {
        menu.querySelectorAll(".has-sub.open").forEach(function (li) {
          li.classList.remove("open");
          var t = li.querySelector(".mobile-nav__toggle");
          if (t) t.setAttribute("aria-expanded", "false");
        });
      };
      var setOpen = function (open) {
        mb.classList.toggle("open", open);
        mb.setAttribute("aria-expanded", String(open));
        mb.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        menu.classList.toggle("open", open);
        backdrop.classList.toggle("open", open);
        menu.setAttribute("aria-hidden", String(!open));
        document.body.style.overflow = open ? "hidden" : "";
        if (open) { var c = menu.querySelector("[data-menu-close]"); if (c) requestAnimationFrame(function () { c.focus(); }); }
        else { closeSubs(); mb.focus(); }
      };

      mb.addEventListener("click", function () { setOpen(!menu.classList.contains("open")); });
      backdrop.addEventListener("click", function () { setOpen(false); });
      menu.querySelector("[data-menu-close]").addEventListener("click", function () { setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) setOpen(false); });

      // Accordion submenus (one open at a time)
      menu.querySelectorAll(".mobile-nav__toggle").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          var li = btn.closest(".has-sub");
          if (!li) return;
          var willOpen = !li.classList.contains("open");
          closeSubs();
          li.classList.toggle("open", willOpen);
          btn.setAttribute("aria-expanded", String(willOpen));
        });
      });

      // Navigating via a real link closes the menu (toggle buttons unaffected)
      menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    })();

    /* Desktop dropdowns are pure CSS now (:hover / :focus-within on .menu-item-has-children);
       the parent link (e.g. Services) navigates to its hub on click. */

    /* ---- FAQ accordion: opening one closes the others in the same group ---- */
    document.querySelectorAll(".faq").forEach(function (group) {
      var items = group.querySelectorAll("details");
      items.forEach(function (d) {
        d.addEventListener("toggle", function () {
          if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
        });
      });
    });

    /* ---- Premium booking modal (Gravity Forms-classed form) ---- */
    (function () {
      function gfText(id, label, type, name, req) {
        return '<li class="gfield' + (req ? ' gfield_contains_required' : '') + '">' +
          '<label class="gfield_label" for="' + id + '">' + label +
          (req ? ' <span class="gfield_required"><span class="gfield_required_asterisk">*</span></span>' : '') + '</label>' +
          '<div class="ginput_container ginput_container_' + type + '">' +
          '<input type="' + type + '" name="' + name + '" id="' + id + '" autocomplete="' + name + '"' + (req ? ' required' : '') + '></div></li>';
      }
      function gfSelect(id, label, name, opts) {
        return '<li class="gfield"><label class="gfield_label" for="' + id + '">' + label + '</label>' +
          '<div class="ginput_container ginput_container_select"><select name="' + name + '" id="' + id + '">' +
          opts.map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select></div></li>';
      }
      var modal = document.createElement("div");
      modal.className = "modal";
      modal.id = "bookModal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-labelledby", "bookModalTitle");
      modal.innerHTML =
        '<div class="modal-overlay" data-close></div>' +
        '<div class="modal-dialog">' +
          '<button class="modal-close" type="button" data-close aria-label="Close">&times;</button>' +
          '<div class="modal-head"><span class="eyebrow">Book a consultation</span>' +
            '<h2 id="bookModalTitle">Request your visit</h2>' +
            '<p>Physician-led care at two San Diego locations. We\'ll follow up to schedule.</p></div>' +
          '<div class="sdb-form gform_wrapper" id="gform_wrapper_book">' +
            '<form method="post" novalidate>' +
              '<div class="gform-body gform_body"><ul class="gform_fields">' +
                gfText("book_name", "Full name", "text", "name", true) +
                gfText("book_phone", "Phone", "tel", "tel", true) +
                gfText("book_email", "Email", "email", "email", true) +
                gfSelect("book_location", "Preferred clinic", "location", ["Mission Hills", "La Jolla", "Either location"]) +
                gfSelect("book_interest", "I'm interested in", "interest", ["Hormone replacement therapy", "Medical weight loss", "Peptide therapy", "IV and NAD+ therapy", "Diagnostic labs", "Hyperbaric oxygen therapy (La Jolla)", "Recovery after surgery", "Not sure yet"]) +
              '</ul></div>' +
              '<div class="gform_footer"><button type="submit" class="gform_button button btn btn-primary">Request consultation</button></div>' +
              '<p class="lf-fine">By submitting, you agree to be contacted about your request. This form does not collect medical information. Connect to Gravity Forms before launch.</p>' +
            '</form></div></div>';
      document.body.appendChild(modal);

      var lastFocus = null;
      var openModal = function (e) {
        if (e) e.preventDefault();
        lastFocus = document.activeElement;
        modal.classList.add("open");
        document.body.classList.add("modal-open");
        var f = modal.querySelector("input, select");
        if (f) requestAnimationFrame(function () { f.focus(); });
      };
      var closeModal = function () {
        modal.classList.remove("open");
        document.body.classList.remove("modal-open");
        if (lastFocus) lastFocus.focus();
      };
      modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) closeModal(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

      // "Book" CTAs (styled buttons + mobile-bar) open the modal; no-JS falls back to contact.html.
      // Plain "Contact" nav/footer links are NOT intercepted, so they open the contact page.
      document.querySelectorAll('a.btn[href$="contact.html"], a.mb-book[href$="contact.html"]').forEach(function (a) {
        a.addEventListener("click", openModal);
      });

      // Placeholder submit -> friendly confirmation (until wired to Gravity Forms)
      var form = modal.querySelector("form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        form.parentNode.innerHTML =
          '<div class="modal-thanks" style="padding:8px 0"><h3 style="font-family:Prata,Georgia,serif;font-size:1.5rem;color:var(--navy);margin:0 0 10px">Thank you</h3>' +
          '<p style="color:var(--gray-sm)">Your request has been received. Our team will follow up during clinic hours to schedule your consultation.</p></div>';
      });
    })();

    /* ---- Symptom checker: Male/Female tabs + live "possible deficiency" results ---- */
    (function () {
      var chk = document.getElementById("symptom-checker");
      if (!chk) return;
      var MAP = {};
      var mapEl = chk.querySelector("#chk-map");
      if (mapEl) { try { MAP = JSON.parse(mapEl.textContent); } catch (e) { MAP = {}; } }
      var genderInput = chk.querySelector("#chk-gender-input");
      var defsInput = chk.querySelector("#chk-defs");

      // Two-step form: 1 Symptoms -> 2 Contact
      var section = document.getElementById("checker-section");
      var stepEls = chk.querySelectorAll(".chk-steps li");
      var stepPages = chk.querySelectorAll(".chk-step");
      function goTo(n, doScroll) {
        stepPages.forEach(function (p) { p.hidden = (parseInt(p.getAttribute("data-step"), 10) !== n); });
        stepEls.forEach(function (li, i) {
          li.classList.toggle("on", i === n - 1);
          li.classList.toggle("done", i < n - 1);
        });
        if (doScroll && section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Recompute the deduped deficiency messages for one gender
      function refresh(gender) {
        if (!MAP.male) return;
        var field = chk.querySelector('.chk-symfield[data-set="' + gender + '"]');
        var box = chk.querySelector('.chk-results[data-set="' + gender + '"]');
        if (!field || !box) return;
        var table = MAP[gender] || {}, order = MAP.order || [], msg = MAP.msg || {};
        var picked = {};   // hormone-key -> true (dedup)
        field.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
          (table[cb.value] || []).forEach(function (h) { picked[h] = true; });
        });
        var keys = order.filter(function (h) { return picked[h]; });
        box.querySelector(".chk-results-list").innerHTML =
          keys.map(function (h) { return "<li>" + msg[h] + "</li>"; }).join("");
        box.hidden = keys.length === 0;
        if (genderInput && genderInput.value === gender && defsInput) {
          defsInput.value = keys.map(function (h) { return msg[h]; }).join(" | ");
        }
      }

      // Tabs: show only the active gender's checkbox field + results
      var tabs = chk.querySelectorAll(".chk-tab");
      var toggles = chk.querySelectorAll(".chk-symfield[data-set], .chk-results[data-set]");
      function showGender(g) {
        toggles.forEach(function (el) { if (el.getAttribute("data-set") !== g) el.hidden = true; });
        var field = chk.querySelector('.chk-symfield[data-set="' + g + '"]');
        if (field) field.hidden = false;   // results visibility decided by refresh()
        if (genderInput) genderInput.value = g;
        refresh(g);
      }
      tabs.forEach(function (t) {
        t.addEventListener("click", function () {
          var g = t.getAttribute("data-tab");
          tabs.forEach(function (x) {
            var on = x === t;
            x.classList.toggle("sel", on);
            x.setAttribute("aria-selected", String(on));
          });
          showGender(g);
        });
      });

      // Live update as symptoms are toggled (both fields live in one form)
      chk.querySelectorAll(".chk-symfield[data-set]").forEach(function (field) {
        var g = field.getAttribute("data-set");
        field.addEventListener("change", function (e) {
          if (e.target.matches('input[type="checkbox"]')) refresh(g);
        });
      });
      // Step navigation
      chk.querySelectorAll("[data-next]").forEach(function (b) { b.addEventListener("click", function () { goTo(2, true); }); });
      chk.querySelectorAll("[data-back]").forEach(function (b) { b.addEventListener("click", function () { goTo(1, true); }); });
      showGender("male");
      goTo(1, false);

      // Placeholder submit -> friendly confirmation
      var cform = chk.querySelector("form");
      if (cform) cform.addEventListener("submit", function (e) {
        e.preventDefault();
        chk.innerHTML = '<div class="chk-thanks"><h3>Thank you</h3><p style="color:var(--gray-sm)">Your request has been received. A member of our team will follow up during clinic hours to help you take the next step.</p></div>';
      });
    })();

    /* ---- sticky header: add .stuck once scrolled ---- */
    var header = document.querySelector(".header");
    if (header) {
      var onScroll = function () { header.classList.toggle("stuck", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---- Back to top (desktop only; hidden on mobile via CSS) ---- */
    (function () {
      var btn = document.createElement("button");
      btn.className = "to-top";
      btn.type = "button";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      document.body.appendChild(btn);
      var toggle = function () { btn.classList.toggle("show", window.scrollY > 600); };
      toggle();
      window.addEventListener("scroll", toggle, { passive: true });
      btn.addEventListener("click", function () {
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    })();

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasIO = "IntersectionObserver" in window;

    /* ---- reveals + unmask are handled by motion.js (GSAP). Elements are visible
       by default via CSS, so no fallback class-toggling is needed here. ---- */

    /* ---- services editorial: sync figure + caption to hovered/focused row ---- */
    var svcList = document.getElementById("svcList");
    var svcFigure = document.querySelector(".svc-figure");
    if (svcList && svcFigure) {
      var imgs = svcFigure.querySelectorAll("img");
      var caption = document.getElementById("svcCaption");
      var rows = svcList.querySelectorAll(".svc-row");
      var activate = function (row) {
        var id = row.getAttribute("data-svc");
        rows.forEach(function (r) { r.classList.toggle("active", r === row); });
        imgs.forEach(function (im) { im.classList.toggle("active", im.getAttribute("data-svc") === id); });
        if (caption && row.getAttribute("data-caption")) caption.textContent = row.getAttribute("data-caption");
      };
      rows.forEach(function (row) {
        row.addEventListener("mouseenter", function () { activate(row); });
        row.addEventListener("focusin", function () { activate(row); });
      });
    }

    /* ---- ambient video: lazy-load, play, crossfade over still ----
       Works for any container with a video[data-src] child (.scene, .spread-figure, .specimen). */
    var vidHolders = document.querySelectorAll(".scene, .spread-figure, .specimen");
    if (vidHolders.length && !reduce) {
      var startVideo = function (holder) {
        var v = holder.querySelector("video[data-src]");
        if (!v || v.dataset.started) return;
        v.dataset.started = "1";
        v.src = v.getAttribute("data-src");
        var play = v.play();
        var live = function () { holder.classList.add("video-live"); };
        if (play && typeof play.then === "function") { play.then(live).catch(function () {}); }
        v.addEventListener("playing", live, { once: true });
      };
      if (hasIO) {
        var vio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { startVideo(e.target); vio.unobserve(e.target); }
          });
        }, { rootMargin: "200px 0px", threshold: 0.01 });
        vidHolders.forEach(function (s) { if (s.querySelector("video[data-src]")) vio.observe(s); });
      } else {
        vidHolders.forEach(startVideo);
      }
    }
  });
})();

/* ============================================================
   No hash in the URL, ever.
   - In-page anchor clicks: smooth-scroll, never touch the URL.
   - Cross-page anchor links: navigate to the CLEAN path and
     scroll to the target on arrival (via sessionStorage).
   - Any hash already in the URL on load is stripped silently.
   ============================================================ */
(function () {
  var KEY = "sdbScrollTarget";

  function scrollToId(id, smooth) {
    if (!id) return false;
    var el = document.getElementById(id);
    if (!el) return false;
    setTimeout(function () {
      el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }, 60);
    return true;
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a) return;
    if (a.target && a.target !== "" && a.target !== "_self") return; // new-tab etc.
    var raw = a.getAttribute("href");
    if (!raw || raw.charAt(0) === "?") return;
    var i = raw.indexOf("#");
    if (i === -1) return;
    var path = raw.slice(0, i);
    var id = raw.slice(i + 1);

    // Is the target on the page we're already on?
    var samePage = (path === "" || path === "#") ||
      (a.pathname === location.pathname && (a.search || "") === (location.search || ""));

    if (samePage) {
      e.preventDefault();
      scrollToId(id, true); // smooth scroll, URL untouched
    } else {
      // Different page: go to the clean path, remember where to scroll.
      e.preventDefault();
      try { if (id) sessionStorage.setItem(KEY, id); } catch (_) {}
      window.location.href = path; // no "#..." appended
    }
  });

  function onReady() {
    var stashed = null;
    try { stashed = sessionStorage.getItem(KEY); } catch (_) {}
    if (stashed) {
      try { sessionStorage.removeItem(KEY); } catch (_) {}
      scrollToId(stashed, true);
    } else if (location.hash && location.hash.length > 1) {
      var id = location.hash.slice(1);
      // Remove the hash from the address bar without a jump, then scroll.
      try {
        if (window.history && history.replaceState) {
          history.replaceState(null, "", location.pathname + location.search);
        }
      } catch (_) {}
      scrollToId(id, false);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
