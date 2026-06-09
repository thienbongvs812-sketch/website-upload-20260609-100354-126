(function () {
  var currentHls = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });
    restart();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="search"]');
        var value = input ? input.value.trim() : '';
        var action = form.getAttribute('action') || 'search.html';
        var target = value ? action + '?q=' + encodeURIComponent(value) : action;
        window.location.href = target;
      });
    });
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var type = 'all';
      var region = 'all';
      var year = 'all';

      var params = new URLSearchParams(window.location.search);
      if (input && params.get('q')) {
        input.value = params.get('q');
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category'),
            card.getAttribute('data-keywords')
          ].join(' '));
          var passQuery = !query || haystack.indexOf(query) !== -1;
          var passType = type === 'all' || card.getAttribute('data-type') === type;
          var passRegion = region === 'all' || card.getAttribute('data-region') === region;
          var passYear = year === 'all' || card.getAttribute('data-year') === year;
          var visible = passQuery && passType && passRegion && passYear;
          card.classList.toggle('is-hidden', !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]')).forEach(function (button) {
        button.addEventListener('click', function () {
          var nextType = button.getAttribute('data-filter-type');
          var nextRegion = button.getAttribute('data-filter-region');
          if (nextType !== null) {
            type = nextType;
            Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]')).forEach(function (item) {
              item.classList.toggle('is-active', item === button);
            });
          }
          if (nextRegion !== null) {
            region = nextRegion;
            Array.prototype.slice.call(scope.querySelectorAll('[data-filter-region]')).forEach(function (item) {
              item.classList.toggle('is-active', item === button);
            });
          }
          apply();
        });
      });

      var selectRegion = scope.querySelector('[data-select-region]');
      var selectType = scope.querySelector('[data-select-type]');
      var selectYear = scope.querySelector('[data-select-year]');
      if (selectRegion) {
        selectRegion.addEventListener('change', function () {
          region = selectRegion.value;
          apply();
        });
      }
      if (selectType) {
        selectType.addEventListener('change', function () {
          type = selectType.value;
          apply();
        });
      }
      if (selectYear) {
        selectYear.addEventListener('change', function () {
          year = selectYear.value;
          apply();
        });
      }
      apply();
    });
  }

  function attachSource(video, source, afterAttach) {
    if (currentHls) {
      currentHls.destroy();
      currentHls = null;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
      afterAttach();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      currentHls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      currentHls.loadSource(source);
      currentHls.attachMedia(video);
      currentHls.on(window.Hls.Events.MANIFEST_PARSED, afterAttach);
      return;
    }
    if (!video.src) {
      video.src = source;
    }
    afterAttach();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-button]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-hls');
      var started = false;

      function play() {
        if (!source) {
          return;
        }
        button.classList.add('is-hidden');
        video.controls = true;
        if (started) {
          var replay = video.play();
          if (replay && replay.catch) {
            replay.catch(function () {});
          }
          return;
        }
        started = true;
        attachSource(video, source, function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              button.classList.remove('is-hidden');
            });
          }
        });
      }

      button.addEventListener('click', play);
      player.addEventListener('click', function (event) {
        if (event.target === video && video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayers();
  });
})();
