// pests.js - Pest Detective specific code

// Pest data structure
const pestData = {
    // This would come from backend during setup
    // But for now, we'll have mock data
    maize: [
        {
            id: 'pest_faw_001',
            name: 'Fall Armyworm',
            localName: 'Kitumbe',
            symptoms: ['holes', 'caterpillar'],
            description: 'A destructive caterpillar that eats maize leaves and cobs',
            quickTreatment: 'Apply ash or neem oil immediately. Remove affected leaves.',
            image: '🐛',
            hasFullDetails: true
        },
        {
            id: 'pest_stemborer_001',
            name: 'Stem Borer',
            localName: 'Mtobvu',
            symptoms: ['sawdust', 'holes'],
            description: 'Bores into the stem, causing dead hearts',
            quickTreatment: 'Remove and destroy affected stems. Burn them.',
            image: '🪱',
            hasFullDetails: true
        }
    ],
    beans: [
        {
            id: 'pest_aphid_001',
            name: 'Aphids',
            localName: 'Nyungu',
            symptoms: ['holes', 'sticky'],
            description: 'Small insects that suck sap from leaves',
            quickTreatment: 'Spray with soapy water or neem solution',
            image: '🐜',
            hasFullDetails: true
        }
    ]
};

// Full details for pests (for online mode)
const pestFullDetails = {
    pest_faw_001: {
        id: 'pest_faw_001',
        name: 'Fall Armyworm',
        scientificName: 'Spodoptera frugiperda',
        description: 'A destructive pest that attacks maize, sorghum, and other crops. The larvae feed on leaves and can completely defoliate plants.',
        lifecycle: [
            'Eggs: Laid in clusters on leaves',
            'Larvae: Feed for 14-21 days - most damaging stage',
            'Pupa: In soil for 8-30 days',
            'Adult: Moth that flies at night'
        ],
        identification: [
            'Inverted Y-shape on head',
            'Four spots on back end',
            'Rough skin texture'
        ],
        treatment: {
            immediate: [
                'Handpick and destroy caterpillars',
                'Apply wood ash mixed with soil',
                'Spray neem solution'
            ],
            chemical: [
                'Emamectin benzoate - 2ml per liter',
                'Spinetoram - follow label instructions'
            ],
            organic: [
                'Introduce natural predators',
                'Plant repellent crops like coriander'
            ]
        },
        prevention: [
            'Early planting',
            'Regular scouting',
            'Crop rotation'
        ],
        images: [
            '/images/faw-larva.jpg',
            '/images/faw-damage.jpg'
        ]
    }
};

// Current selected options
let selectedCrop = null;
let selectedSymptoms = [];

/**
 * Initialize the pest page
 */
async function initPestPage() {
    console.log('🐛 Initializing Pest Detective');
    
    // Check if we have pest data in IndexedDB
    let pests = await Klimat.getFromDB('pests');
    
    if (!pests || pests.length === 0) {
        console.log('No pest data found, using mock data');
        // In real app, you'd fetch from API during setup
        await loadMockPestData();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Update connection status display
    updateOnlineStatusDisplay();
}

/**
 * Load mock pest data into IndexedDB (for testing)
 */
async function loadMockPestData() {
    const allPests = [];
    
    // Flatten pest data
    for (const [crop, pests] of Object.entries(pestData)) {
        pests.forEach(p => {
            allPests.push({
                ...p,
                crops: [crop]
            });
        });
    }
    
    await Klimat.saveToDB('pests', allPests);
    console.log('✅ Mock pest data loaded');
}

/**
 * Set up event listeners for crop and symptom buttons
 */
function setupEventListeners() {
    // Crop buttons
    document.querySelectorAll('.crop-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const crop = e.target.dataset.crop;
            selectCrop(crop);
        });
    });
    
    // Symptom buttons
    document.querySelectorAll('.symptom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const symptom = e.target.dataset.symptom;
            toggleSymptom(symptom, e.target);
        });
    });
    
    // "Get Full Details" buttons (will be added dynamically)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('full-details-btn')) {
            const pestId = e.target.dataset.pestId;
            showFullDetails(pestId);
        }
    });
}

/**
 * Select a crop
 */
function selectCrop(crop) {
    selectedCrop = crop;
    
    // Update UI
    document.querySelectorAll('.crop-btn').forEach(btn => {
        if (btn.dataset.crop === crop) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    // If we have symptoms selected, search
    if (selectedSymptoms.length > 0) {
        searchPests();
    }
}

/**
 * Toggle a symptom
 */
function toggleSymptom(symptom, button) {
    const index = selectedSymptoms.indexOf(symptom);
    
    if (index === -1) {
        // Add symptom
        selectedSymptoms.push(symptom);
        button.classList.add('selected');
    } else {
        // Remove symptom
        selectedSymptoms.splice(index, 1);
        button.classList.remove('selected');
    }
    
    // If we have crop selected, search
    if (selectedCrop) {
        searchPests();
    }
}

/**
 * Search for pests based on selected crop and symptoms
 */
async function searchPests() {
    if (!selectedCrop || selectedSymptoms.length === 0) {
        return;
    }
    
    // Show loading
    document.getElementById('results').innerHTML = '<p class="loading">🔍 Searching...</p>';
    
    // Get pests from IndexedDB
    const allPests = await Klimat.getFromDB('pests');
    
    // Filter by crop and symptoms
    const matches = allPests.filter(pest => {
        // Check if pest affects this crop
        if (!pest.crops || !pest.crops.includes(selectedCrop)) {
            return false;
        }
        
        // Check if pest matches ANY selected symptom
        return selectedSymptoms.some(symptom => 
            pest.symptoms && pest.symptoms.includes(symptom)
        );
    });
    
    // Display results
    displayResults(matches);
}

/**
 * Display search results
 */
function displayResults(pests) {
    const resultsDiv = document.getElementById('results');
    
    if (pests.length === 0) {
        resultsDiv.innerHTML = `
            <div class="no-results">
                <p>😕 No pests found matching your selection</p>
                <p>Try different symptoms or check with local extension officer</p>
            </div>
        `;
        return;
    }
    
    let html = '<h3>Possible Pests:</h3>';
    
    pests.forEach(pest => {
        const isOnline = Klimat.isOnline();
        
        html += `
            <div class="pest-card">
                <div class="pest-header">
                    <span class="pest-icon">${pest.image || '🐛'}</span>
                    <div class="pest-title">
                        <h4>${pest.name}</h4>
                        ${pest.localName ? `<span class="local-name">(${pest.localName})</span>` : ''}
                    </div>
                </div>
                
                <p class="pest-description">${pest.description || pest.quickTreatment}</p>
                
                <div class="pest-treatment">
                    <strong>Quick Action:</strong>
                    <p>${pest.quickTreatment}</p>
                </div>
                
                ${!isOnline ? `
                    <div class="offline-notice">
                        ⚠️ Limited info offline. Connect to internet for photos and detailed treatment.
                    </div>
                ` : ''}
                
                ${isOnline && pest.hasFullDetails ? `
                    <button class="full-details-btn" data-pest-id="${pest.id}">
                        📖 View Full Details
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

/**
 * Show full pest details (online only)
 */
async function showFullDetails(pestId) {
    if (!Klimat.isOnline()) {
        Klimat.showToast('Connect to internet to view full details', 'warning');
        return;
    }
    
    // In real app, fetch from API
    // For demo, use mock data
    const details = pestFullDetails[pestId];
    
    if (!details) {
        Klimat.showToast('Details not available', 'error');
        return;
    }
    
    // Create modal or expand view
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${details.name}</h2>
                <button class="close-btn">&times;</button>
            </div>
            
            <div class="modal-body">
                <p><em>${details.scientificName}</em></p>
                
                <h4>Description</h4>
                <p>${details.description}</p>
                
                <h4>Lifecycle</h4>
                <ul>
                    ${details.lifecycle.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h4>Identification</h4>
                <ul>
                    ${details.identification.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h4>Treatment</h4>
                
                <h5>Immediate Actions:</h5>
                <ul>
                    ${details.treatment.immediate.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h5>Chemical Control:</h5>
                <ul>
                    ${details.treatment.chemical.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h5>Organic Methods:</h5>
                <ul>
                    ${details.treatment.organic.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h4>Prevention</h4>
                <ul>
                    ${details.prevention.map(item => `<li>${item}</li>`).join('')}
                </ul>
                
                <h4>Images</h4>
                <div class="image-gallery">
                    ${details.images.map(img => `
                        <img src="${img}" alt="Pest image" onerror="this.src='https://via.placeholder.com/150'">
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Update online status display
 */
function updateOnlineStatusDisplay() {
    const badge = document.getElementById('onlineBadge');
    if (badge) {
        if (Klimat.isOnline()) {
            badge.className = 'online-badge';
            badge.textContent = '🟢 Online';
        } else {
            badge.className = 'offline-badge';
            badge.textContent = '🔴 Offline';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPestPage();
    
    // Update online status when it changes
    window.addEventListener('online', updateOnlineStatusDisplay);
    window.addEventListener('offline', updateOnlineStatusDisplay);
});