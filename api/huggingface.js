export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    console.log('Hugging Face proxy called:', {
        method: req.method,
        body: req.body ? 'has body' : 'no body',
        timestamp: new Date().toISOString()
    });
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Hugging Face proxy: Handling OPTIONS request');
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        console.log('Hugging Face proxy: Method not allowed:', req.method);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { apiKey, model, prompt } = req.body;
        
        console.log('Hugging Face proxy: Request data:', { 
            hasApiKey: !!apiKey, 
            model: model, 
            promptLength: prompt ? prompt.length : 0 
        });
        
        if (!apiKey || !model || !prompt) {
            console.log('Hugging Face proxy: Missing required fields');
            res.status(400).json({ error: 'Missing required fields: apiKey, model, prompt' });
            return;
        }
        
        console.log(`Hugging Face request for model: ${model}`);
        
        // Format the prompt for Llama 3.1 Instruct format
        const formattedPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a social media expert who creates engaging posts. Create unique, high-quality content optimized for the specified platform. Be creative, engaging, and authentic.<|eot_id|><|start_header_id|>user<|end_header_id|>

${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: formattedPrompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.8,
                    do_sample: true,
                    top_p: 0.9,
                    repetition_penalty: 1.1,
                    return_full_text: false
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error(`Hugging Face API Error ${response.status}:`, errorData);
            
            // Handle common Hugging Face API errors
            if (response.status === 503) {
                res.status(503).json({ 
                    error: 'Model is currently loading. Please try again in a few minutes.',
                    details: 'Hugging Face models need time to load when not recently used'
                });
                return;
            }
            
            res.status(response.status).json({ 
                error: `Hugging Face API error: ${response.status}`,
                details: errorData 
            });
            return;
        }
        
        const data = await response.json();
        
        // Handle different response formats
        let content = '';
        if (Array.isArray(data) && data.length > 0) {
            content = data[0].generated_text || '';
        } else if (data.generated_text) {
            content = data.generated_text;
        } else {
            console.error('Unexpected Hugging Face response format:', data);
            res.status(500).json({ 
                error: 'Unexpected response format from Hugging Face API',
                details: 'Could not parse generated content'
            });
            return;
        }
        
        // Clean up the content by removing any remaining special tokens
        content = content
            .replace(/<\|[^|]+\|>/g, '') // Remove any remaining special tokens
            .trim();
        
        res.status(200).json({
            content: content,
            source: 'AI Generated'
        });
        
    } catch (error) {
        console.error('Hugging Face proxy error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}