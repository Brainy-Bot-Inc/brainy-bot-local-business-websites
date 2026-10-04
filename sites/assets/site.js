/* Local business site behaviour: mobile nav, contact form. */
(function () {
  "use strict";

  /* ---------------------------------------------------- mobile navigation -- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------------------------------------------------------- contact form -- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var out = form.querySelector("[data-form-status]");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (out) {
        out.hidden = false;
        out.textContent =
          "Thanks - this is a preview site, so nothing was sent. Call or email us directly and we will reply right away.";
        out.focus();
      }
      form.reset();
    });
  }

  /* --------------------------------------------------- live open/closed -- */
  var body = document.body;
  var statusEl = document.querySelector("[data-hours-status]");

  function toMin(t) {
    var p = t.split(":");
    return +p[0] * 60 + +p[1];
  }
  function fmt(t) {
    var p = t.split(":").map(Number);
    var h = p[0];
    var m = p[1];
    if (h === 24) return "midnight";
    var ap = h >= 12 ? "pm" : "am";
    var hh = h % 12;
    if (hh === 0) hh = 12;
    return hh + ":" + String(m).padStart(2, "0") + " " + ap;
  }
  function dayName(d) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d];
  }

  // Pure function so it can be tested with any day/minute.
  function statusAt(sched, day, minutes) {
    var i, s, o, c;
    for (i = 0; i < sched.length; i++) {
      s = sched[i];
      if (s.d.indexOf(day) !== -1) {
        if (s.o === "00:00" && s.c === "24:00") return { open: true, text: "Open 24 hours" };
        o = toMin(s.o);
        c = toMin(s.c);
        if (c > o) {
          if (minutes >= o && minutes < c) return { open: true, text: "Open now - closes " + fmt(s.c) };
        } else if (minutes >= o || minutes < c) {
          return { open: true, text: "Open now - closes " + fmt(s.c) };
        }
        if (minutes < o) return { open: false, text: "Closed - opens " + fmt(s.o) + " today" };
      }
    }
    for (var j = 1; j <= 7; j++) {
      var d = (day + j) % 7;
      for (i = 0; i < sched.length; i++) {
        if (sched[i].d.indexOf(d) !== -1) {
          return {
            open: false,
            text: "Closed - opens " + fmt(sched[i].o) + (j === 1 ? " tomorrow" : " " + dayName(d)),
          };
        }
      }
    }
    return { open: false, text: "See hours below" };
  }

  // Current day/time in the BUSINESS's timezone, not the visitor's.
  function businessNow(tz) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var day = 0;
    var hour = 0;
    var minute = 0;
    parts.forEach(function (p) {
      if (p.type === "weekday") day = map[p.value];
      else if (p.type === "hour") hour = +p.value % 24;
      else if (p.type === "minute") minute = +p.value;
    });
    return { day: day, minutes: hour * 60 + minute };
  }

  function renderStatus() {
    if (!statusEl || !body) return;
    var raw = body.getAttribute("data-schedule");
    if (!raw) return;
    var sched;
    try {
      sched = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!sched || !sched.length) return;
    var now = businessNow(body.getAttribute("data-tz") || "America/Los_Angeles");
    var st = statusAt(sched, now.day, now.minutes);
    var text = statusEl.querySelector(".hours-live-text");
    if (!text) return;
    statusEl.setAttribute("data-state", st.open ? "open" : "closed");
    text.textContent = st.text;
  }

  if (statusEl && body && body.getAttribute("data-schedule")) {
    renderStatus();
    setInterval(renderStatus, 60000);
    window.__statusAt = statusAt; // exposed for tests
  }
})();
