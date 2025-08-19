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
        console.log(`API Key format: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
        console.log(`Full URL: https://api-inference.huggingface.co/models/${model}`);
        
        // Format the prompt based on the model - keep it very simple
        let formattedPrompt;
        if (model === 'gpt2' || model === 'distilgpt2') {
            // GPT-2 family expects simple prompt completion
            formattedPrompt = `Write a social media post about: ${prompt}\n\nPost:`;
        } else {
            // Generic simple format for basic models
            formattedPrompt = `Social media post about ${prompt}:`;
        }
        
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
            console.error(`Request URL: https://api-inference.huggingface.co/models/${model}`);
            console.error(`API Key starts with: ${apiKey.substring(0, 10)}...`);
            
            // Handle common Hugging Face API errors
            if (response.status === 503) {
                res.status(503).json({ 
                    error: 'Model is currently loading. Please try again in a few minutes.',
                    details: 'Hugging Face models need time to load when not recently used'
                });
                return;
            }
            
            if (response.status === 404) {
                res.status(404).json({ 
                    error: 'Model not found or requires special access.',
                    details: `Model '${model}' not found. Full error: ${errorData}. Check if your API key is valid and has the correct format (should start with 'hf_').`
                });
                return;
            }
            
            if (response.status === 403) {
                res.status(403).json({ 
                    error: 'Access denied to this model.',
                    details: `Access forbidden. Full error: ${errorData}. Your API key may be invalid or expired.`
                });
                return;
            }
            
            if (response.status === 401) {
                res.status(401).json({ 
                    error: 'Invalid API key.',
                    details: `Authentication failed. Please check your Hugging Face API key. It should start with 'hf_' and be from huggingface.co/settings/tokens`
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
        
        // Clean up the content by removing any remaining special tokens and formatting
        content = content
            .replace(/^(Social media post:|Engaging post:|Create a social media post:)/gi, '') // Remove prompt echoes
            .replace(/<\|[^|]+\|>/g, '') // Remove any special tokens
            .replace(/\[INST\]|\[\/INST\]/g, '') // Remove instruction tokens
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