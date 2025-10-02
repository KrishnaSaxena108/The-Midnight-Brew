document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'light') {
        body.classList.add('light-theme');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        body.classList.remove('light-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        if (newTheme === 'light') {
            body.classList.add('light-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            body.classList.remove('light-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        localStorage.setItem('theme', newTheme);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const faders = document.querySelectorAll(".fade-in");
    const appearOptions = { threshold: 0.2 };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("appear");
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    faders.forEach(fader => appearOnScroll.observe(fader));
});

function animateCounter(el, duration, startTime) {
  const target = parseFloat(el.getAttribute('data-target'));

  function update(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    let value = target * progress;

    if (el.id === 'satisfactionRate') {
      el.textContent = Math.floor(value) + '%';
    } else if (el.id === 'averageRating') {
      el.textContent = value.toFixed(1);
    } else {
      el.textContent = Math.floor(value);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // This ensures that it ends exactly at target
      if (el.id === 'satisfactionRate') el.textContent = target + '%';
      else if (el.id === 'averageRating') el.textContent = target.toFixed(1);
      else el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
}

let animated = false;
window.addEventListener('scroll', () => {
  if (!animated && isInViewport(document.querySelector('.review-stats'))) {
    animated = true;
    const duration = 800; // 0.8 seconds
    document.querySelectorAll('.review-stats h3').forEach(el => animateCounter(el, duration));
  }
});