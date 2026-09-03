const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/search', async (req, res) => {
    const searchQuery = req.query.q;
    
    // Get the API key from Render's environment variables
    const apiKey = process.env.ZYTE_API_KEY;

    if (!apiKey) {
        console.error("DEBUG: ZYTE_API_KEY is missing from environment variables!");
        return res.status(500).send('Server Error: ZYTE_API_KEY is not configured.');
    }

    const zyteUrl = 'https://api.zyte.com/v1/extract';

    try {
        console.log(`DEBUG: Sending request to Zyte for query: "${searchQuery}"`);

        const response = await fetch(zyteUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
                httpResponseBody: true 
            })
        });

        // If Zyte returns an error code (like 401 Unauthorized or 400 Bad Request)
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`DEBUG: Zyte responded with status ${response.status}:`, errorText);
            return res.status(500).send(`Zyte API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.httpResponseBody) {
            console.error("DEBUG: Response from Zyte did not contain httpResponseBody:", data);
            return res.status(500).send('Error: Zyte response missing httpResponseBody.');
        }

        // Decode the HTML returned by Zyte
        const decodedHtml = Buffer.from(data.httpResponseBody, 'base64').toString('utf-8');
        res.send(decodedHtml);

    } catch (error) {
        console.error("DEBUG: Caught an exception during fetch:", error);
        res.status(500).send('Error fetching data via Zyte: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
