let currentPath = '';

// Function to update the breadcrumb navigation
function updateBreadcrumb(path) {
    const breadcrumbContainer = document.getElementById('breadcrumb-container');
    breadcrumbContainer.innerHTML = ''; // Clear previous breadcrumbs

    // Split the path into parts for breadcrumb navigation
    const pathParts = path ? path.split('/') : [];

    // Create a clickable "Root" for the base path
    const rootBreadcrumb = document.createElement('span');
    rootBreadcrumb.textContent = 'Root';
    rootBreadcrumb.classList.add('breadcrumb');
    rootBreadcrumb.addEventListener('click', () => {
        navigateToPath(''); // Root path
    });
    breadcrumbContainer.appendChild(rootBreadcrumb);

    // Add a separator if there are path parts
    if (pathParts.length > 0) {
        const separator = document.createElement('span');
        separator.textContent = ' / ';
        breadcrumbContainer.appendChild(separator);
    }

    // Create breadcrumb links for each part of the path
    pathParts.forEach((part, index) => {
        const breadcrumb = document.createElement('span');
        breadcrumb.textContent = part;
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

            // Enable or disable the back button
            document.getElementById('back-button').disabled = currentPath === '';
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
    fetchAndDisplayItems(path);
}

// Back button functionality: navigate to parent directory
document.getElementById('back-button').addEventListener('click', () => {
    if (currentPath) {
        const parentPath = currentPath.split('/').slice(0, -1).join('/');
        navigateToPath(parentPath);
    }
});

// On page load, fetch and display items from the base path
if (window.location.pathname.endsWith('index.html') && localStorage.getItem('authenticated')) {
    fetchAndDisplayItems();  // Fetch items for base directory
}
