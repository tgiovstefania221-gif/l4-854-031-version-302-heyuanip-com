(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var cards = Array.prototype.slice.call(searchResults.querySelectorAll('[data-search]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards(value) {
      var query = normalize(value);

      cards.forEach(function (card) {
        var content = card.getAttribute('data-search') || '';
        card.hidden = query ? content.indexOf(query) === -1 : false;
      });
    }

    searchInput.value = initialQuery;
    filterCards(initialQuery);

    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value);
    });
  }
})();
