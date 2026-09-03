const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Serve your HTML file
app.use(express.static('public'));

// The endpoint your HTML will call
app.get('/api/search', async (req, res) => {
    const searchQuery = req.query.q;
    
    // Zyte API endpoint and your private key
    const zyteUrl = 'https://api.zyte.com/v1/extract';
    const apiKey = 'YOUR_ZYTE_API_KEY_HERE';

    try {
        // Requesting a Google search page through Zyte's proxy
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

        const data = await response.json();
        
        // Decode the HTML returned by Zyte and send it to your frontend
        const decodedHtml = Buffer.from(data.httpResponseBody, 'base64').toString('utf-8');
        res.send(decodedHtml);

    } catch (error) {
        res.status(500).send('Error fetching data via Zyte');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
