(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
          slide.classList.toggle("is-active", current === index);
        });
        dots.forEach(function (dot, current) {
          dot.classList.toggle("is-active", current === index);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          play();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          play();
        });
      });
      show(0);
      play();
    }

    var panel = document.querySelector("[data-filter-panel]");
    if (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-result]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (input && q) {
        input.value = q;
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matched = false;
          }
          if (typeValue && card.getAttribute("data-type") !== typeValue) {
            matched = false;
          }
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
      applyFilter();
    }
  });

  window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;
    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function start() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        loaded = true;
      }
      video.controls = true;
      overlay.classList.add("is-hidden");
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!loaded) {
        start();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
