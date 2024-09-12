// Redirect to index if logged in
if (window.location.pathname.endsWith('index.html') && !localStorage.getItem('authenticated')) {
    window.location.href = 'login.html';
}

// Handle login form submission
if (window.location.pathname.endsWith('login.html')) {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === 'user' && password === 'password') {
            localStorage.setItem('authenticated', 'true');
            window.location.href = 'index.html';
        } else {
            document.getElementById('error-message').textContent = 'Invalid credentials';
        }
    });
}

// Fetch and display items after login
if (window.location.pathname.endsWith('index.html') && localStorage.getItem('authenticated')) {
    const itemsContainer = document.getElementById('items');

    // Fetch the list from the API
    fetch('http://localhost:1234/get_list')
        .then(response => response.json())
        .then(data => {
            const items = data.items;
            items.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.textContent = item;
                itemsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching items:', error);
            itemsContainer.textContent = 'Failed to load items.';
        });

    // Web scrape Kworb YouTube page using a CORS proxy
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = 'https://kworb.net/youtube/';
    const youtubeDataContainer = document.createElement('div');
    youtubeDataContainer.setAttribute('id', 'youtube-data');
    document.body.appendChild(youtubeDataContainer);

    fetch(proxyUrl + encodeURIComponent(targetUrl))
        .then(response => response.json())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');

            // Extract a section of the page (e.g., top YouTube videos)
            const youtubeTable = doc.querySelector('.views-table tbody');
            if (youtubeTable) {
                youtubeDataContainer.innerHTML = '<h3>Top YouTube Videos</h3>' + youtubeTable.outerHTML;
            } else {
                youtubeDataContainer.textContent = 'Failed to load YouTube data.';
            }
        })
        .catch(error => {
            console.error('Error scraping YouTube data:', error);
            youtubeDataContainer.textContent = 'Error loading YouTube data.';
        });
}
