(function() {

  var growHeart = function(trigger, target) {
    var app = window.app;
    var completed = false;
    var timer;

    trigger.onmouseover = function() {
      if (completed) return;
      target.className += ' icon--grow';
      timer = setTimeout(function() {
        completed = true;
        trigger.className += ' done';
        app.socket.emit('light it up', 'I AM HERE');
      }, 1000);
    };

    trigger.onmouseout = function() {
      if (!completed) {
        target.className = target.className.replace(' icon--grow', '');
        target.className += ' icon--bounce';
        clearTimeout(timer);
      }
    };
  };

  var increaseCount = function() {
    var counter = document.querySelector('.counter');
    var count = counter.querySelector('.count');
    var current = Number(count.innerHTML);
    current++;
    count.innerHTML = current;
    count.className += ' flash';
    setTimeout(function() {
      count.className = count.className.replace(/flash/g, '');
    }, 100);
  };

  var initializeLights = function() {
    var container = document.querySelector('.lights');
    var dotSize = 5;
    var maxSearchIterations = 10;
    var min_x = 0;
    var max_x = window.innerWidth;
    var min_y = 0;
    var max_y = window.innerHeight;
    var filled_areas = [];

    var calc_overlap = function(a1) {
      var overlap = 0;
      for (var i = 0; i < filled_areas.length; i++) {
        var a2 = filled_areas[i];

        // no intersection cases
        if (a1.x + a1.width < a2.x) {
          continue;
        }
        if (a2.x + a2.width < a1.x) {
          continue;
        }
        if (a1.y + a1.height < a2.y) {
          continue;
        }
        if (a2.y + a2.height < a1.y) {
          continue;
        }

        // intersection exists : calculate it !
        var x1 = Math.max(a1.x, a2.x);
        var y1 = Math.max(a1.y, a2.y);
        var x2 = Math.min(a1.x + a1.width, a2.x + a2.width);
        var y2 = Math.min(a1.y + a1.height, a2.y + a2.height);

        var intersection = ((x1 - x2) * (y1 - y2));

        overlap += intersection;
      }

      return overlap;
    };

    var makeItPulse = function(el) {
      return setTimeout(function() {
        el.className += ' light--pulse';
      }, Math.floor(Math.random() * 2000) + 1);
    };

    var add = function(max, className) {
      max = max || 1;
      filled_areas.splice(0, filled_areas.length);

      var index = 0;
      for (var x = 0; x < max; ++x) {
        var rand_x = 0;
        var rand_y = 0;
        var smallest_overlap = 9007199254740992;
        var best_choice;
        var area;
        for (var i = 0; i < maxSearchIterations; ++i) {
          rand_x = Math.round(min_x + ((max_x - min_x) * (Math.random() % 1)));
          rand_y = Math.round(min_y + ((max_y - min_y) * (Math.random() % 1)));
          area = {
            x: rand_x,
            y: rand_y,
            width: dotSize,
            height: dotSize
          };

          var overlap = calc_overlap(area);
          if (overlap < smallest_overlap) {
            smallest_overlap = overlap;
            best_choice = area;
          }
          if (overlap === 0) {
            break;
          }
        }

        filled_areas.push(best_choice);

        var el = document.createElement('span');
        el.innerHTML = '&nbsp';
        el.className = 'light' + ' ' + className;
        el.style.top = rand_y + 'px';
        el.style.left = rand_x + 'px';

        makeItPulse(el);
        increaseCount();
        container.appendChild(el);
      }
    };

    var init = function(lightMax) {
      add(lightMax);
    };

    return {
      init: init,
      add: add
    };
  };

  var init = function() {
    var app = window.app;
    var heartEl = document.querySelector('.heartButton');
    var heartFill = heartEl.querySelector('.icon--filled');
    var social = document.querySelector('.social');
    var lighter = initializeLights();

    app.socket.on('init', function(data) {
      var numberOfLights = data.length;
      lighter.init(numberOfLights);
    });

    app.socket.on('already lit up', function(data) {
      heartEl.className += ' done';
      heartFill.className += ' icon--grow';
      social.className = social.className.replace('hide', '');
      lighter.add(1, 'light--local');
    });

    app.socket.on('lit up', function(data) {
      social.className = social.className.replace('hide', '');
      lighter.add(1, 'light--local');
    });

    app.socket.on('someone lit it up', function(ip) {
      lighter.add(1, 'light--remote');
    });

    growHeart(heartEl, heartFill);
  };

  var createApp = function(prototype) {
    return prototype;
  };

  /* global io */
  var appPrototype = {
    init: init,
    socket: io()
  };
  var app = createApp(appPrototype);
  window.app = app;

  window.addEventListener('load', app.init, false);

})();
