// markets.js - Market Prices specific code

// State
let selectedProduct = 'maize';
let selectedMarket = 'all';
let markets = [];
let prices = [];
let priceHistory = [];

/**
 * Initialize the markets page
 */
async function initMarketsPage() {
    console.log('💰 Initializing Markets page');
    
    // Load data from IndexedDB
    await loadMarketsFromDB();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update online status display
    updateOnlineStatusDisplay();
    
    // If online, fetch fresh data
    if (Klimat.isOnline()) {
        await refreshMarketData();
    }
}

/**
 * Load markets and prices from IndexedDB
 */
async function loadMarketsFromDB() {
    // Get markets
    markets = await Klimat.getFromDB('markets') || [];
    if (markets.length === 0) {
        // If no data, use mock for demo
        markets = [
            { id: 'market_001', name: 'Central Market', distance: 5 },
            { id: 'market_002', name: 'Town Market', distance: 12 },
            { id: 'market_003', name: 'Farmers Cooperative', distance: 8 }
        ];
        await Klimat.saveToDB('markets', markets);
    }
    
    // Get prices
    prices = await Klimat.getFromDB('prices') || [];
    
    // Get last update time
    const metadata = await Klimat.getFromDB('metadata', 'prices_last_updated');
    const lastUpdate = metadata ? new Date(metadata.value) : null;
    
    // Render markets dropdown
    renderMarketSelector();
    
    // Render prices
    renderPrices(prices, lastUpdate);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Product filter
    document.querySelectorAll('.product-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.product-filter-btn').forEach(b => 
                b.classList.remove('active'));
            e.target.classList.add('active');
            selectedProduct = e.target.dataset.product;
            filterAndRenderPrices();
        });
    });
    
    // Market filter
    const marketSelect = document.getElementById('marketSelect');
    if (marketSelect) {
        marketSelect.addEventListener('change', (e) => {
            selectedMarket = e.target.value;
            filterAndRenderPrices();
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshPrices');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => refreshMarketData());
    }
}

/**
 * Render market selector dropdown
 */
function renderMarketSelector() {
    const container = document.getElementById('marketSelect');
    if (!container) return;
    
    let html = '<option value="all">All Markets</option>';
    markets.forEach(market => {
        html += `<option value="${market.id}">${market.name} (${market.distance}km)</option>`;
    });
    
    container.innerHTML = html;
}

/**
 * Filter prices based on selected product and market
 */
function filterAndRenderPrices() {
    let filtered = prices;
    
    // Filter by product
    if (selectedProduct !== 'all') {
        filtered = filtered.filter(p => p.product === selectedProduct);
    }
    
    // Filter by market
    if (selectedMarket !== 'all') {
        filtered = filtered.filter(p => p.marketId === selectedMarket);
    }
    
    // Get last update time
    Klimat.getFromDB('metadata', 'prices_last_updated').then(metadata => {
        const lastUpdate = metadata ? new Date(metadata.value) : null;
        renderPrices(filtered, lastUpdate);
    });
}

/**
 * Render prices to the page
 */
function renderPrices(pricesToShow, lastUpdate) {
    const container = document.getElementById('pricesContainer');
    if (!container) return;
    
    if (!pricesToShow || pricesToShow.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <p>📭 No price data available</p>
                <p class="small">Pull down to refresh when online</p>
            </div>
        `;
        return;
    }
    
    // Group by market
    const byMarket = {};
    pricesToShow.forEach(price => {
        if (!byMarket[price.marketId]) {
            byMarket[price.marketId] = {
                marketId: price.marketId,
                marketName: price.marketName,
                prices: []
            };
        }
        byMarket[price.marketId].prices.push(price);
    });
    
    // Build HTML
    let html = '';
    
    // Last update info
    if (lastUpdate) {
        const isStale = (Date.now() - lastUpdate.getTime()) > 7 * 24 * 60 * 60 * 1000; // 7 days
        html += `
            <div class="update-info ${isStale ? 'stale' : 'fresh'}">
                <span>📅 Last updated: ${lastUpdate.toLocaleDateString()}</span>
                ${isStale ? '<span class="stale-badge">⚠️ Data may be old</span>' : ''}
                ${!Klimat.isOnline() ? '<span class="offline-badge">🔴 Offline - Showing cached</span>' : ''}
            </div>
        `;
    }
    
    // Prices by market
    Object.values(byMarket).forEach(market => {
        html += `
            <div class="market-card">
                <div class="market-header">
                    <h3>${market.marketName}</h3>
                </div>
                <div class="market-prices">
        `;
        
        market.prices.sort((a, b) => a.product.localeCompare(b.product));
        market.prices.forEach(price => {
            const trendIcon = price.trend === 'up' ? '📈' : price.trend === 'down' ? '📉' : '📊';
            html += `
                <div class="price-row" onclick="showPriceDetails('${price.id}')">
                    <span class="product-name">${price.productName || price.product}</span>
                    <span class="price-value">
                        ${price.currency} ${price.price.toFixed(2)}/${price.unit}
                        <span class="trend-icon">${trendIcon}</span>
                    </span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    // Add comparison note if online
    if (Klimat.isOnline()) {
        html += `
            <div class="comparison-note">
                <p>💡 Tap any price to see history and compare markets</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Show price details (history, comparison)
 */
async function showPriceDetails(priceId) {
    const price = prices.find(p => p.id === priceId);
    if (!price) return;
    
    // Get history from IndexedDB or API
    let history = [];
    if (Klimat.isOnline()) {
        try {
            const response = await fetch(`/api/prices/history?product=${price.product}&market=${price.marketId}`);
            history = await response.json();
        } catch (e) {
            console.log('Failed to fetch history, using cached');
        }
    }
    
    // Get prices from same product in other markets
    const otherMarkets = prices.filter(p => 
        p.product === price.product && p.marketId !== price.marketId
    );
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${price.productName} Price Details</h2>
                <button class="close-btn">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="current-price-large">
                    ${price.currency} ${price.price.toFixed(2)}/${price.unit}
                    <span class="trend-badge ${price.trend}">${price.trend}</span>
                </div>
                
                <div class="market-info">
                    <p><strong>Market:</strong> ${price.marketName}</p>
                    <p><strong>Last updated:</strong> ${new Date(price.date).toLocaleString()}</p>
                </div>
                
                ${history.length > 0 ? `
                    <div class="price-history">
                        <h4>Price History (30 days)</h4>
                        <div class="history-chart">
                            ${renderHistoryChart(history)}
                        </div>
                    </div>
                ` : ''}
                
                ${otherMarkets.length > 0 ? `
                    <div class="other-markets">
                        <h4>Compare with other markets</h4>
                        ${otherMarkets.map(m => `
                            <div class="compare-row">
                                <span>${m.marketName}</span>
                                <span class="compare-price">
                                    ${m.currency} ${m.price.toFixed(2)}
                                    ${m.price < price.price ? '⬇️ lower' : m.price > price.price ? '⬆️ higher' : '➡️ same'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${!Klimat.isOnline() ? `
                    <div class="offline-notice">
                        ⚠️ Connect to internet for live prices and history
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Render simple price history chart
 */
function renderHistoryChart(history) {
    if (!history || history.length === 0) return '<p>No history available</p>';
    
    const maxPrice = Math.max(...history.map(h => h.price));
    const minPrice = Math.min(...history.map(h => h.price));
    const range = maxPrice - minPrice;
    
    let html = '<div class="chart-container">';
    history.forEach(point => {
        const height = range > 0 ? ((point.price - minPrice) / range) * 100 : 50;
        html += `
            <div class="chart-bar" style="height: ${height}%">
                <span class="bar-tooltip">${point.date}: ${point.price}</span>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

/**
 * Refresh market data from API (when online)
 */
async function refreshMarketData() {
    if (!Klimat.isOnline()) {
        Klimat.showToast('Connect to internet to refresh prices', 'warning');
        return;
    }
    
    const refreshBtn = document.getElementById('refreshPrices');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '🔄 Refreshing...';
    }
    
    try {
        // Fetch latest prices
        const products = ['maize', 'beans', 'cassava'].join(',');
        const response = await fetch(`/api/prices/latest?products=${products}`);
        const latestPrices = await response.json();
        
        // Flatten and save
        const newPrices = [];
        for (const [product, productPrices] of Object.entries(latestPrices)) {
            newPrices.push(...productPrices);
        }
        
        if (newPrices.length > 0) {
            await Klimat.saveToDB('prices', newPrices);
            prices = newPrices;
            
            // Update last sync time
            await Klimat.saveToDB('metadata', {
                key: 'prices_last_updated',
                value: new Date().toISOString()
            });
            
            Klimat.showToast(`✓ Updated ${newPrices.length} prices`, 'success');
        }
        
        // Refresh markets list
        const marketsRes = await fetch('/api/markets');
        const newMarkets = await marketsRes.json();
        if (newMarkets.length > 0) {
            await Klimat.saveToDB('markets', newMarkets);
            markets = newMarkets;
            renderMarketSelector();
        }
        
        // Re-render
        filterAndRenderPrices();
        
    } catch (error) {
        console.error('Failed to refresh prices:', error);
        Klimat.showToast('Failed to refresh prices', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '🔄 Refresh Prices';
        }
    }
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
    initMarketsPage();
    
    // Update online status when it changes
    window.addEventListener('online', () => {
        updateOnlineStatusDisplay();
        refreshMarketData(); // Auto-refresh when coming online
    });
    window.addEventListener('offline', updateOnlineStatusDisplay);
});