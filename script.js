let backHistory = [];
let forwardHistory = [];
let currentPath = '';

// Function to update the breadcrumb navigation
function updateBreadcrumb(path) {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    breadcrumbContainer.innerHTML = ''; // Clear previous breadcrumbs

    const pathParts = path ? path.split('/') : [];

    // Create breadcrumb links for each part of the path
    pathParts.forEach((part, index) => {
        const breadcrumb = document.createElement('span');
        breadcrumb.textContent = part || 'Root';
        breadcrumb.classList.add('breadcrumb');

        // Add click event to go to the clicked path part
        breadcrumb.addEventListener('click', () => {
            const newPath = pathParts.slice(0, index + 1).join('/');
            navigateToPath(newPath);
        });

        breadcrumbContainer.appendChild(breadcrumb);

        // Add a separator between breadcrumb links (if not the last part)
        if (index < pathParts.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' / ';
            breadcrumbContainer.appendChild(separator);
        }
    });
}

// Function to fetch and display directory contents
function fetchAndDisplayItems(path = '') {
    currentPath = path;
    updateBreadcrumb(path); // Update breadcrumb based on the new path

    const itemsContainer = document.getElementById('items');
    itemsContainer.innerHTML = ''; // Clear previous content

    fetch(`http://localhost:1234/get_list?path=${encodeURIComponent(path)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch directory contents');
            }
            return response.json();
        })
        .then(data => {
            const items = data.items;
            const currentPath = data.current_path;

            if (items && items.length > 0) {
                items.forEach(item => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.textContent = item.name;

                    // If it's a directory, make it clickable
                    if (item.is_directory) {
                        card.classList.add('clickable');
                        card.addEventListener('click', () => {
                            const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
                            navigateToPath(newPath);
                        });
                    } else {
                        // If it's a file, make it clickable to view its contents
                        card.classList.add('file-clickable');
                        card.addEventListener('click', () => {
                            fetchAndDisplayFileContent(`${currentPath}/${item.name}`);
                        });
                    }

                    itemsContainer.appendChild(card);
                });
            } else {
                itemsContainer.textContent = 'This directory is empty.';
            }
        })
        .catch(error => {
            console.error('Error fetching items:', error);
            itemsContainer.textContent = 'Failed to load items.';
        });
}

// Function to fetch and display file contents
function fetchAndDisplayFileContent(filePath) {
    const fileContentContainer = document.getElementById('file-content');
    fileContentContainer.innerHTML = 'Loading...';

    fetch(`http://localhost:1234/get_file_content?file=${encodeURIComponent(filePath)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }
            return response.json();
        })
        .then(data => {
            if (data.content) {
                fileContentContainer.textContent = data.content;
            } else {
                fileContentContainer.textContent = 'Failed to load file content.';
            }
        })
        .catch(error => {
            console.error('Error fetching file content:', error);
            fileContentContainer.textContent = 'Failed to load file content.';
        });
}

// Function to navigate to a specific path
function navigateToPath(path) {
    // Add current path to back history before navigating
    if (currentPath) {
        backHistory.push(currentPath);
        document.getElementById('back-button').disabled = false; // Enable back button
    }

    // Clear forward history whenever a new path is navigated to
    forwardHistory = [];
    document.getElementById('forward-button').disabled = true; // Disable forward button

    fetchAndDisplayItems(path);
}

// Back button functionality
document.getElementById('back-button').addEventListener('click', () => {
    if (backHistory.length > 0) {
        forwardHistory.push(currentPath);
        document.getElementById('forward-button').disabled = false; // Enable forward button

        const previousPath = backHistory.pop();
        fetchAndDisplayItems(previousPath);

        if (backHistory.length === 0) {
            document.getElementById('back-button').disabled = true; // Disable back button
        }
    }
});

// Forward button functionality
document.getElementById('forward-button').addEventListener('click', () => {
    if (forwardHistory.length > 0) {
        backHistory.push(currentPath);
        document.getElementById('back-button').disabled = false; // Enable back button

        const nextPath = forwardHistory.pop();
        fetchAndDisplayItems(nextPath);

        if (forwardHistory.length === 0) {
            document.getElementById('forward-button').disabled = true; // Disable forward button
        }
    }
});

// On page load, fetch and display items from the base path
if (window.location.pathname.endsWith('index.html') && localStorage.getItem('authenticated')) {
    fetchAndDisplayItems();  // Fetch items for base directory
}
