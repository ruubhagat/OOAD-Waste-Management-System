document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const pickupForm = document.getElementById('pickupForm');
    const editForm = document.getElementById('editForm');
    const pickupList = document.getElementById('pickupList');
    const overlay = document.getElementById('overlay');
    const closeModal = document.getElementById('closeModal');
    const filterButtons = document.querySelectorAll('.btn-filter');
    
    // Current filter - default to "All"
    let currentFilter = 'all';
    
    // Base API URL
    const API_URL = '/api/waste-pickups';
    
    // Load pickup requests when page loads
    loadPickups();
    
    // Event Listeners
    pickupForm.addEventListener('submit', handleSubmitPickup);
    editForm.addEventListener('submit', handleUpdatePickup);
    closeModal.addEventListener('click', closeModalFunction);
    
    // Filter button event listeners
    document.getElementById('showAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('showPending').addEventListener('click', () => setFilter('Pending'));
    document.getElementById('showScheduled').addEventListener('click', () => setFilter('Scheduled'));
    document.getElementById('showCompleted').addEventListener('click', () => setFilter('Completed'));
    
    // Functions
    
    // Set active filter
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update active button
        filterButtons.forEach(button => {
            button.classList.remove('active');
            
            // Match button ID with filter
            if ((filter === 'all' && button.id === 'showAll') || 
                (button.id === 'show' + filter)) {
                button.classList.add('active');
            }
        });
        
        // Reload pickups with filter
        loadPickups();
    }
    
    // Load pickup requests from server
    function loadPickups() {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(pickups => {
                // Filter pickups based on current selection
                let filteredPickups = pickups;
                if (currentFilter !== 'all') {
                    filteredPickups = pickups.filter(pickup => pickup.status === currentFilter);
                }
                
                // Check for scheduled pickups with passed times and update them
                updatePassedPickups(pickups);
                
                // Display pickups
                displayPickups(filteredPickups);
            })
            .catch(error => {
                console.error('Error loading pickups:', error);
                showError('Failed to load pickup requests. Please try again later.');
            });
    }
    
    // Update pickups with passed times to "Completed"
    function updatePassedPickups(pickups) {
        const now = new Date();
        
        pickups.forEach(pickup => {
            const pickupTime = new Date(pickup.pickupDateTime);
            
            if (pickupTime < now && pickup.status !== 'Completed') {
                // Update status to completed
                fetch(`${API_URL}/${pickup.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...pickup,
                        status: 'Completed'
                    })
                })
                .then(response => {
                    if (response.ok) {
                        console.log(`Automatically updated pickup #${pickup.id} to Completed`);
                    }
                })
                .catch(error => {
                    console.error('Error updating pickup status:', error);
                });
            }
        });
    }
    
    // Display pickups in the list
    function displayPickups(pickups) {
        if (pickups.length === 0) {
            pickupList.innerHTML = '<p class="no-pickups">No pickup requests found.</p>';
            return;
        }
        
        pickupList.innerHTML = '';
        
        pickups.forEach(pickup => {
            const pickupDate = new Date(pickup.pickupDateTime);
            const formattedDate = pickupDate.toLocaleDateString();
            const formattedTime = pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Create pickup card
            const card = document.createElement('div');
            card.className = `pickup-card ${pickup.status.toLowerCase()}`;
            
            card.innerHTML = `
                <div class="pickup-header">
                    <span class="pickup-type">${pickup.wasteType || 'N/A'}</span>
                    <span class="pickup-status ${pickup.status.toLowerCase()}">${pickup.status}</span>
                </div>
                <div class="pickup-body">
                    <div class="pickup-detail">
                        <strong>Location:</strong>
                        <span>${pickup.location}</span>
                    </div>
                    <div class="pickup-detail">
                        <strong>Pickup Date:</strong>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="pickup-detail">
                        <strong>Pickup Time:</strong>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="pickup-detail">
                        <strong>Requested by:</strong>
                        <span>${pickup.userName || 'Anonymous'}</span>
                    </div>
                </div>
                <div class="pickup-actions">
                    <button class="btn-edit" data-id="${pickup.id}">Edit</button>
                    <button class="btn-delete" data-id="${pickup.id}">Cancel</button>
                </div>
            `;
            
            pickupList.appendChild(card);
            
            // Add event listeners for edit and delete buttons
            card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(pickup));
            card.querySelector('.btn-delete').addEventListener('click', () => deletePickup(pickup.id));
        });
    }
    
    // Handle form submission for creating a new pickup
    function handleSubmitPickup(event) {
        event.preventDefault();
        
        const wasteType = document.getElementById('wasteType').value;
        const location = document.getElementById('location').value;
        const pickupDateTime = document.getElementById('pickupDateTime').value;
        const userName = document.getElementById('userName').value;
        
        // Validate form
        if (!wasteType || !location || !pickupDateTime || !userName) {
            showError('Please fill in all required fields.');
            return;
        }
        
        // Create pickup object
        const pickup = {
            wasteType,
            location,
            pickupDateTime,
            userName,
            status: 'Pending'
        };
        
        // Send POST request
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pickup)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create pickup request');
            }
            return response.json();
        })
        .then(data => {
            // Reset form
            pickupForm.reset();
            
            // Reload pickups
            loadPickups();
            
            // Show success message
            alert('Pickup request scheduled successfully!');
        })
        .catch(error => {
            console.error('Error creating pickup:', error);
            showError('Failed to schedule pickup. Please try again.');
        });
    }
    
    // Open edit modal with pickup data
    function openEditModal(pickup) {
        // Fill form with pickup data
        document.getElementById('editId').value = pickup.id;
        document.getElementById('editWasteType').value = pickup.wasteType || '';
        document.getElementById('editLocation').value = pickup.location || '';
        document.getElementById('editUserName').value = pickup.userName || '';
        document.getElementById('editStatus').value = pickup.status || 'Pending';
        
        // Format date for datetime-local input
        if (pickup.pickupDateTime) {
            const date = new Date(pickup.pickupDateTime);
            const formattedDate = date.toISOString().slice(0, 16);
            document.getElementById('editPickupDateTime').value = formattedDate;
        } else {
            document.getElementById('editPickupDateTime').value = '';
        }
        
        // Show modal
        overlay.style.display = 'flex';
    }
    
    // Close modal function
    function closeModalFunction() {
        overlay.style.display = 'none';
    }
    
    // Handle update pickup form submission
    function handleUpdatePickup(event) {
        event.preventDefault();
        
        const id = document.getElementById('editId').value;
        const wasteType = document.getElementById('editWasteType').value;
        const location = document.getElementById('editLocation').value;
        const pickupDateTime = document.getElementById('editPickupDateTime').value;
        const userName = document.getElementById('editUserName').value;
        const status = document.getElementById('editStatus').value;
        
        // Validate form
        if (!wasteType || !location || !pickupDateTime || !userName || !status) {
            showError('Please fill in all required fields.');
            return;
        }
        
        // Create updated pickup object
        const updatedPickup = {
            wasteType,
            location,
            pickupDateTime,
            userName,
            status
        };
        
        // Send PUT request
        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPickup)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update pickup request');
            }
            return response.json();
        })
        .then(data => {
            // Close modal
            closeModalFunction();
            
            // Reload pickups
            loadPickups();
            
            // Show success message
            alert('Pickup request updated successfully!');
        })
        .catch(error => {
            console.error('Error updating pickup:', error);
            showError('Failed to update pickup. Please try again.');
        });
    }
    
    // Delete pickup function
    function deletePickup(id) {
        if (confirm('Are you sure you want to cancel this pickup request?')) {
            fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete pickup request');
                }
                
                // Reload pickups
                loadPickups();
                
                // Show success message
                alert('Pickup request cancelled successfully!');
            })
            .catch(error => {
                console.error('Error deleting pickup:', error);
                showError('Failed to cancel pickup. Please try again.');
            });
        }
    }
    
    // Show error message
    function showError(message) {
        alert(message);
    }
    
    // Set up auto-refresh every minute to update status
    setInterval(loadPickups, 60000);
});