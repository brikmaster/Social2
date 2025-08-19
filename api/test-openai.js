export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        res.status(200).json({ 
            message: 'OpenAI proxy test endpoint is working',
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { apiKey } = req.body;
        
        if (!apiKey) {
            res.status(400).json({ error: 'API key required for test' });
            return;
        }
        
        // Simple test request to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 10
            })
        });
        
        console.log(`OpenAI test response status: ${response.status}`);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error(`OpenAI test error:`, errorData);
            res.status(200).json({ 
                success: false,
                error: `OpenAI API error: ${response.status}`,
                details: errorData 
            });
            return;
        }
        
        const data = await response.json();
        res.status(200).json({
            success: true,
            message: 'OpenAI API is working',
            testResponse: data.choices[0].message.content
        });
        
    } catch (error) {
        console.error('OpenAI test error:', error);
        res.status(200).json({ 
            success: false,
            error: 'Test failed',
            details: error.message 
        });
    }
}