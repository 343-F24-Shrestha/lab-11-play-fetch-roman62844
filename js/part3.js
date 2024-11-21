const output1 = document.getElementById('output-1');
const output2 = document.getElementById('output-2');

// Store game data globally to use in second request (proof of concept for project requirements)
let gamesData = null;

// Variable for displaying different game's weather each time idk why im making this
let gameIndex = 0;

// Helper function to use CORS proxy cuz the geoResponse api is stupid
const proxyFetch = async (url) => {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`proxyFetch (corsproxy) failed: ${response.status}`);
    return response.json();
};

const proxyFetch2 = async (url) => {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`proxyFetch2 (allorgins) failed: ${response.status}`);
    return response.json();
};

document.getElementById('api-1-btn').addEventListener('click', async () => {
    // Make a request to your first API here. Put the response's data in output-1.
    // If your response has no body, put the status code in output-1.

    try {
        // Get NFL games
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        if (!response.ok) throw new Error(`espn is being stupid: ${response.status}`);
        const data = await response.json();
        // console.log(JSON.stringify(data, null, 2)); // for debug
        // Store games for second request
        gamesData = data.events.map(game => ({
            name: game.name,
            venue: game.competitions[0].venue.fullName,
            city: game.competitions[0].venue.address.city,
            state: game.competitions[0].venue.address.state,
            date: game.date
        }));

        // Display stuff
        output1.textContent = gamesData.map(game => 
            `${game.name}\nVenue: ${game.venue}\nLocation: ${game.city}, ${game.state}\nDate: ${new Date(game.date).toLocaleString()}\n`
        ).join('\n');

    } catch (error) {
        output1.textContent = `Error: ${error.message}`;
    }
});

document.getElementById('api-2-btn').addEventListener('click', async () => {
    // Make a request to your second API here. Put the response's data in output-2.
    // If your response has no body, put the status code in output-2.
    
    if (!gamesData) {
        output2.textContent = "fetch games data first.";
        return;
    }

    try {
        // Get weather for first game's location
        if(gameIndex >= gamesData.length) {
            gameIndex = 0;
        }
        const game = gamesData[gameIndex];
        gameIndex++;
        
        // Get coordinates for stuff
        const searchQuery = `${game.city}, ${game.state}`;
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
        
        const geoResponse = await fetch(nominatimUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'NFL Weather App (educational purpose)'
            }
        });
        if (!geoResponse.ok) throw new Error('Geocoding failed');
        const geoData = await geoResponse.json();
        if (!geoData.length) throw new Error('Location not found');
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        
        // Get weather using coordinates
        const weatherPointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        if (!weatherPointsResponse.ok) throw new Error('Weather points request is stupid');
        const pointsData = await weatherPointsResponse.json();
        
        // Get forecast
        const forecastResponse = await fetch(pointsData.properties.forecast);
        if (!forecastResponse.ok) throw new Error('Forecast request sucks');
        const forecastData = await forecastResponse.json();

        // Display weather for game
        output2.textContent = 
            `Weather forecast for ${game.name} at ${game.venue}:\n\n` +
            forecastData.properties.periods[0].detailedForecast;

    } catch (error) {
        output2.textContent = `I suck at coding. Error: ${error.message}`;
    }
});
