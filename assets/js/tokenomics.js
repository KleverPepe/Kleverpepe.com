// KleverPEPE Live Tokenomics Fetcher
// Fetches real-time data from Klever blockchain API

const TOKEN_ID = 'KPEPE-1EOD';

// Fallback static data (update these values manually if API fails)
const STATIC_DATA = {
    totalSupply: 21000000,
    circulatingSupply: 4293717,
    burned: 2061798,
    totalStaked: 1402308,
    lastUpdated: new Date().toISOString()
};

// API Endpoints to try (in order of preference)
const API_ENDPOINTS = [
    'https://api.mainnet.klever.org/v1.0/asset/',
    'https://node.mainnet.klever.org/asset/',
    'https://api.mainnet.klever.org/v1/asset/'
];

// Cache for rate limiting
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute

async function fetchTokenData() {
    // Return cached data if still valid
    if (cachedData && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        return cachedData;
    }

    // Try each API endpoint
    for (const baseUrl of API_ENDPOINTS) {
        try {
            const url = `${baseUrl}${TOKEN_ID}`;
            console.log(`Trying API: ${url}`);
            
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                const parsedData = parseApiResponse(data);
                
                if (parsedData) {
                    cachedData = parsedData;
                    cacheTimestamp = Date.now();
                    console.log('✅ API fetch successful');
                    return parsedData;
                }
            }
        } catch (error) {
            console.log(`❌ API ${baseUrl} failed:`, error.message);
            continue;
        }
    }

    // Fallback to static data
    console.log('⚠️ Using static data (API unavailable)');
    return STATIC_DATA;
}

function parseApiResponse(data) {
    // Parse API response based on Klever API structure
    // Adjust this based on actual API response format
    
    if (!data) return null;

    try {
        return {
            totalSupply: data.totalSupply || data.supply || data.maxSupply || STATIC_DATA.totalSupply,
            circulatingSupply: data.circulatingSupply || data.inCirculation || STATIC_DATA.circulatingSupply,
            burned: data.burned || data.burn || STATIC_DATA.burned,
            totalStaked: data.totalStaked || data.staked || data.staking || STATIC_DATA.totalStaked,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error parsing API response:', error);
        return null;
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toLocaleString();
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

async function updateTokenomicsDisplay() {
    const data = await fetchTokenData();
    
    // Update DOM elements if they exist
    const elements = {
        totalSupply: document.getElementById('total-supply'),
        circulatingSupply: document.getElementById('circulating-supply'),
        burned: document.getElementById('burned'),
        totalStaked: document.getElementById('total-staked'),
        lastUpdated: document.getElementById('last-updated')
    };
    
    Object.keys(elements).forEach(key => {
        if (elements[key]) {
            if (key === 'lastUpdated') {
                elements[key].textContent = new Date(data.lastUpdated).toLocaleString();
            } else {
                elements[key].textContent = formatNumber(data[key]);
            }
        }
    });
    
    // Update chart if exists
    updateTokenomicsChart(data);
    
    return data;
}

function updateTokenomicsChart(data) {
    // Calculate percentages for the visual chart
    const total = data.totalSupply;
    const circulatingPct = ((data.circulatingSupply / total) * 100).toFixed(1);
    const burnedPct = ((data.burned / total) * 100).toFixed(1);
    const stakedPct = ((data.totalStaked / total) * 100).toFixed(1);
    const reservedPct = (100 - circulatingPct - burnedPct - stakedPct).toFixed(1);
    
    const chartBars = {
        circulating: document.querySelector('.chart-bar:nth-child(1) .chart-fill'),
        burned: document.querySelector('.chart-bar:nth-child(2) .chart-fill'),
        staked: document.querySelector('.chart-bar:nth-child(3) .chart-fill'),
        reserved: document.querySelector('.chart-bar:nth-child(4) .chart-fill')
    };
    
    const chartPercents = {
        circulating: document.querySelector('.chart-bar:nth-child(1) .chart-percent'),
        burned: document.querySelector('.chart-bar:nth-child(2) .chart-percent'),
        staked: document.querySelector('.chart-bar:nth-child(3) .chart-percent'),
        reserved: document.querySelector('.chart-bar:nth-child(4) .chart-percent')
    };
    
    // Update chart widths
    if (chartBars.circulating) chartBars.circulating.style.width = `${circulatingPct}%`;
    if (chartBars.burned) chartBars.burned.style.width = `${burnedPct}%`;
    if (chartBars.staked) chartBars.staked.style.width = `${stakedPct}%`;
    if (chartBars.reserved) chartBars.reserved.style.width = `${reservedPct}%`;
    
    // Update percentages
    if (chartPercents.circulating) chartPercents.circulating.textContent = `${circulatingPct}%`;
    if (chartPercents.burned) chartPercents.burned.textContent = `${burnedPct}%`;
    if (chartPercents.staked) chartPercents.staked.textContent = `${stakedPct}%`;
    if (chartPercents.reserved) chartPercents.reserved.textContent = `${reservedPct}%`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initial fetch
    updateTokenomicsDisplay();
    
    // Auto-refresh every 60 seconds
    setInterval(updateTokenomicsDisplay, 60000);
    
    // Manual refresh button handler
    const refreshBtn = document.getElementById('refresh-tokenomics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            cachedData = null; // Clear cache
            updateTokenomicsDisplay();
        });
    }
});

// Export for external use
window.KleverPepeTokenomics = {
    fetch: fetchTokenData,
    updateDisplay: updateTokenomicsDisplay,
    getStaticData: () => STATIC_DATA
};
