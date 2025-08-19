export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { apiKey } = req.body;
        
        if (!apiKey) {
            res.status(400).json({ error: 'API key required' });
            return;
        }
        
        console.log('Testing HF API key:', apiKey.substring(0, 10) + '...');
        
        // Test with the simplest possible model and request
        const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: "Hello world",
                parameters: {
                    max_new_tokens: 10,
                    temperature: 0.7
                }
            })
        });
        
        const responseText = await response.text();
        console.log('HF Response status:', response.status);
        console.log('HF Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('HF Response body:', responseText);
        
        if (!response.ok) {
            res.status(200).json({
                success: false,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseText,
                url: 'https://api-inference.huggingface.co/models/gpt2'
            });
            return;
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = responseText;
        }
        
        res.status(200).json({
            success: true,
            status: response.status,
            data: data,
            message: 'API key works! HF API is accessible.'
        });
        
    } catch (error) {
        console.error('Test HF error:', error);
        res.status(200).json({
            success: false,
            error: error.message,
            type: error.constructor.name,
            message: 'Network or other error occurred'
        });
    }
}