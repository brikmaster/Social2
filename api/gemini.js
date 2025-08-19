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
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            res.status(response.status).json({ 
                error: `Gemini API error: ${response.status}`,
                details: errorData 
            });
            return;
        }
        
        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text.trim();
        
        res.status(200).json({
            content: content,
            source: 'AI Generated'
        });
        
    } catch (error) {
        console.error('Gemini proxy error:', error);
        console.error('Request details:', { model, promptLength: prompt ? prompt.length : 0 });
        res.status(500).json({ 
            error: 'Gemini proxy error',
            details: error.message 
        });
    }
}