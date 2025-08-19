export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { apiKey, model, prompt } = req.body;
        
        if (!apiKey || !model || !prompt) {
            res.status(400).json({ error: 'Missing required fields: apiKey, model, prompt' });
            return;
        }
        
        console.log(`Anthropic request for model: ${model}`);
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: model,
                max_tokens: 500,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            res.status(response.status).json({ 
                error: `Anthropic API error: ${response.status}`,
                details: errorData 
            });
            return;
        }
        
        const data = await response.json();
        const content = data.content[0].text.trim();
        
        res.status(200).json({
            content: content,
            source: 'AI Generated'
        });
        
    } catch (error) {
        console.error('Anthropic proxy error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}