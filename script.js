// Function to fetch and display directory contents
function fetchAndDisplayItems(path = '') {
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
                            fetchAndDisplayItems(newPath);
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

// On page load, fetch and display items from the base path
if (window.location.pathname.endsWith('index.html') && localStorage.getItem('authenticated')) {
    fetchAndDisplayItems();  // Fetch items for base directory
}
