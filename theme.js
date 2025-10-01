// ===== THEME TOGGLE FUNCTIONALITY ===== //

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check if theme toggle exists on this page
    if (!themeToggle) return;
    
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Check for saved theme preference or default to light
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply the saved theme
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

    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update data-theme attribute
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Update body class
        if (newTheme === 'light') {
            body.classList.add('light-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            body.classList.remove('light-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
    });
});
