export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    console.log('OpenAI proxy called:', {
        method: req.method,
        body: req.body ? 'has body' : 'no body',
        timestamp: new Date().toISOString()
    });
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('OpenAI proxy: Handling OPTIONS request');
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        console.log('OpenAI proxy: Method not allowed:', req.method);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { apiKey, model, prompt } = req.body;
        
        console.log('OpenAI proxy: Request data:', { 
            hasApiKey: !!apiKey, 
            model: model, 
            promptLength: prompt ? prompt.length : 0 
        });
        
        if (!apiKey || !model || !prompt) {
            console.log('OpenAI proxy: Missing required fields');
            res.status(400).json({ error: 'Missing required fields: apiKey, model, prompt' });
            return;
        }
        
        console.log(`OpenAI request for model: ${model}`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a social media expert who creates engaging posts. Create unique, high-quality content optimized for the specified platform.'
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.8
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error(`OpenAI API Error ${response.status}:`, errorData);
            res.status(response.status).json({ 
                error: `OpenAI API error: ${response.status}`,
                details: errorData 
            });
            return;
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        res.status(200).json({
            content: content,
            source: 'AI Generated'
        });
        
    } catch (error) {
        console.error('OpenAI proxy error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}