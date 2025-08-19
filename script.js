class MultiPlatformSocialGenerator {
    constructor() {
        this.init();
        this.platformLimits = {
            twitter: 280,
            threads: 500,
            bluesky: 300,
            instagram: 2200,
            facebook: 63206,
            tiktok: 150,
            generic: 500
        };
        
        this.platforms = ['twitter', 'threads', 'bluesky', 'instagram', 'facebook', 'tiktok', 'generic'];
        
        this.availableModels = [
            // Working models - tested one by one
            { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o Standard' },
            { provider: 'anthropic', model: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
            { provider: 'gemini', model: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
            { provider: 'huggingface', model: 'gpt2', name: 'GPT-2' },
            { provider: 'huggingface', model: 'distilgpt2', name: 'DistilGPT-2' }
        ];

        this.apiKeys = {};
        this.activeModels = [];
        this.currentPlatform = 'twitter';
        
        this.bindEvents();
        this.loadApiKeys();
        this.checkFirstRun();
    }

    init() {
        // Form elements
        this.topicInput = document.getElementById('topic');
        this.toneSelect = document.getElementById('tone');
        this.keywordsInput = document.getElementById('keywords');
        this.includeHashtags = document.getElementById('includeHashtags');
        this.includeEmojis = document.getElementById('includeEmojis');
        this.includeCallToAction = document.getElementById('includeCallToAction');
        this.generateBtn = document.getElementById('generateBtn');
        this.hashtagList = document.getElementById('hashtagList');
        
        // Modal elements
        this.apiSetupModal = document.getElementById('apiSetupModal');
        this.openaiKeyInput = document.getElementById('openaiKey');
        this.anthropicKeyInput = document.getElementById('anthropicKey');
        this.geminiKeyInput = document.getElementById('geminiKey');
        this.huggingfaceKeyInput = document.getElementById('huggingfaceKey');
        this.saveApiKeysBtn = document.getElementById('saveApiKeys');
        this.reconfigureBtn = document.getElementById('reconfigureApi');
        this.resetApiBtn = document.getElementById('resetApi');
        this.testHfBtn = document.getElementById('testHfApi');
        
        // Status elements
        this.modelsStatus = document.getElementById('modelsStatus');
        this.generationStatus = document.getElementById('generationStatus');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = this.progressBar.querySelector('.progress-fill');
        
        // Platform elements
        this.platformTabs = document.querySelectorAll('.platform-tab');
        this.platformContents = document.querySelectorAll('.platform-variations');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateAllPlatforms());
        this.saveApiKeysBtn.addEventListener('click', () => this.saveApiKeys());
        this.reconfigureBtn.addEventListener('click', () => {
            this.showApiSetup();
        });
        
        this.resetApiBtn.addEventListener('click', () => {
            this.resetApiSetup();
        });
        
        this.testHfBtn.addEventListener('click', () => {
            this.testHuggingFaceApi();
        });

        // Platform tab switching
        this.platformTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchPlatform(tab.dataset.platform));
        });

        // Close modal when clicking outside
        this.apiSetupModal.addEventListener('click', (e) => {
            if (e.target === this.apiSetupModal) {
                this.hideApiSetup();
            }
        });
    }

    switchPlatform(platform) {
        console.log('Switching to platform:', platform);
        this.currentPlatform = platform;
        
        // Update tab styles
        this.platformTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.platform === platform);
        });
        
        // Update content visibility
        this.platformContents.forEach(content => {
            const isActive = content.id === `${platform}-content`;
            content.classList.toggle('active', isActive);
            console.log(`Platform content ${content.id}: ${isActive ? 'active' : 'inactive'}`);
        });
        
        // Check if there are posts for this platform
        const grid = document.querySelector(`.variations-grid[data-platform="${platform}"]`);
        console.log(`Posts for ${platform}:`, grid ? grid.children.length : 'Grid not found');
    }

    checkFirstRun() {
        const hasRunBefore = localStorage.getItem('api-setup-completed');
        const hasApiKeys = this.apiKeys.openai || this.apiKeys.anthropic || this.apiKeys.gemini || this.apiKeys.huggingface;
        
        console.log('First run check:', { hasRunBefore, hasApiKeys, apiKeys: this.apiKeys });
        
        if (!hasRunBefore || !hasApiKeys) {
            console.log('Showing API setup because no setup or no keys');
            this.showApiSetup();
        } else {
            console.log('Keys found, updating models status');
            this.updateModelsStatus();
        }
    }
    
    resetApiSetup() {
        localStorage.removeItem('api-setup-completed');
        localStorage.removeItem('api-key-openai');
        localStorage.removeItem('api-key-anthropic');
        localStorage.removeItem('api-key-gemini');
        localStorage.removeItem('api-key-huggingface');
        this.loadApiKeys();
        this.showApiSetup();
    }

    showApiSetup() {
        this.apiSetupModal.style.display = 'block';
        this.openaiKeyInput.value = this.apiKeys.openai || '';
        this.anthropicKeyInput.value = this.apiKeys.anthropic || '';
        this.geminiKeyInput.value = this.apiKeys.gemini || '';
        this.huggingfaceKeyInput.value = this.apiKeys.huggingface || '';
    }

    hideApiSetup() {
        this.apiSetupModal.style.display = 'none';
    }

    saveApiKeys() {
        const keys = {
            openai: this.openaiKeyInput.value.trim(),
            anthropic: this.anthropicKeyInput.value.trim(),
            gemini: this.geminiKeyInput.value.trim(),
            huggingface: this.huggingfaceKeyInput.value.trim()
        };

        Object.keys(keys).forEach(provider => {
            if (keys[provider]) {
                localStorage.setItem(`api-key-${provider}`, keys[provider]);
            } else {
                localStorage.removeItem(`api-key-${provider}`);
            }
        });

        localStorage.setItem('api-setup-completed', 'true');
        
        this.loadApiKeys();
        this.updateModelsStatus();
        this.hideApiSetup();
        this.showSuccess('API keys saved successfully!');
    }


    loadApiKeys() {
        this.apiKeys = {
            openai: localStorage.getItem('api-key-openai') || '',
            anthropic: localStorage.getItem('api-key-anthropic') || '',
            gemini: localStorage.getItem('api-key-gemini') || '',
            huggingface: localStorage.getItem('api-key-huggingface') || ''
        };

        this.activeModels = this.availableModels.filter(model => {
            return this.apiKeys[model.provider] && this.apiKeys[model.provider].length > 0;
        });
    }

    updateModelsStatus() {
        this.modelsStatus.innerHTML = '';
        
        this.availableModels.forEach(model => {
            const statusDiv = document.createElement('div');
            statusDiv.className = 'model-status';
            
            let statusText = 'Disconnected';
            let statusClass = '';
            
            if (this.apiKeys[model.provider]) {
                statusClass = 'connected';
                statusText = 'Connected';
            }
            
            statusDiv.innerHTML = `
                <div class="model-status-indicator ${statusClass}"></div>
                <span>${model.name}</span>
                <small>${statusText}</small>
            `;
            
            this.modelsStatus.appendChild(statusDiv);
        });
    }

    async testHuggingFaceApi() {
        const hfApiKey = this.apiKeys.huggingface;
        
        if (!hfApiKey) {
            alert('Please configure your Hugging Face API key first.');
            this.showApiSetup();
            return;
        }
        
        try {
            this.testHfBtn.textContent = 'Testing...';
            this.testHfBtn.disabled = true;
            
            const response = await fetch('/api/test-hf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: hfApiKey
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Hugging Face API test successful!\n\nYour API key is working correctly.');
            } else {
                let errorMsg = `❌ Hugging Face API test failed:\n\n`;
                errorMsg += `Status: ${result.status}\n`;
                errorMsg += `Error: ${result.body}\n`;
                errorMsg += `URL: ${result.url || 'Unknown'}\n\n`;
                
                if (result.status === 401) {
                    errorMsg += `This looks like an authentication error. Please check:\n`;
                    errorMsg += `- Your API key starts with 'hf_'\n`;
                    errorMsg += `- Your API key is valid and not expired\n`;
                    errorMsg += `- You generated it from huggingface.co/settings/tokens`;
                } else if (result.status === 404) {
                    errorMsg += `Model not found. This might indicate a problem with the API endpoint.`;
                }
                
                alert(errorMsg);
            }
            
        } catch (error) {
            alert(`❌ Test failed with network error:\n\n${error.message}`);
        } finally {
            this.testHfBtn.textContent = 'Test HF API';
            this.testHfBtn.disabled = false;
        }
    }

    async generateAllPlatforms() {
        const topic = this.topicInput.value.trim();
        
        if (!topic) {
            alert('Please enter a topic or main message.');
            return;
        }
        
        if (this.activeModels.length === 0) {
            alert('Please configure at least one AI API key to generate posts.');
            this.showApiSetup();
            return;
        }

        const baseOptions = {
            topic,
            tone: this.toneSelect.value,
            keywords: this.keywordsInput.value.split(',').map(k => k.trim()).filter(k => k),
            includeHashtags: this.includeHashtags.checked,
            includeEmojis: this.includeEmojis.checked,
            includeCallToAction: this.includeCallToAction.checked
        };

        this.generateBtn.textContent = 'Generating for All Platforms...';
        this.generateBtn.classList.add('loading');
        this.progressBar.classList.add('active');
        this.progressFill.style.width = '0%';

        // Clear all platform content and reset tab counts
        this.platforms.forEach(platform => {
            const grid = document.querySelector(`.variations-grid[data-platform="${platform}"]`);
            const tab = document.querySelector(`.platform-tab[data-platform="${platform}"]`);
            
            if (grid) {
                grid.innerHTML = '';
                console.log(`Cleared ${platform} grid`);
            }
            if (tab) {
                tab.classList.remove('has-posts');
                const countBadge = tab.querySelector('.post-count');
                if (countBadge) countBadge.remove();
            }
        });

        // MULTI-PLATFORM MODE: One API call per model generates ALL platforms
        const totalCombinations = this.platforms.length * this.activeModels.length;
        let completedCombinations = 0;

        this.generationStatus.textContent = `Generating ${totalCombinations} variations across ${this.platforms.length} platforms using ${this.activeModels.length} models...`;

        // OPTIMAL APPROACH: Single API call per PROVIDER (not per model)
        const allGenerationPromises = [];
        let delayCounter = 0;
        
        // Group models by provider
        const modelsByProvider = {};
        this.activeModels.forEach(model => {
            if (!modelsByProvider[model.provider]) {
                modelsByProvider[model.provider] = [];
            }
            modelsByProvider[model.provider].push(model);
        });
        
        // Make one call per provider using their best model
        Object.keys(modelsByProvider).forEach(provider => {
            const providerModels = modelsByProvider[provider];
            const bestModel = providerModels[0]; // Use the first (and likely only) model
            
            const delay = delayCounter * 20000; // 20 seconds between providers
            delayCounter++;
            
            const promise = new Promise(resolve => setTimeout(resolve, delay))
                .then(() => this.generateMultiPlatformVariation(bestModel, baseOptions))
                .then(variations => {
                    // Add all platform variations from this provider
                    variations.forEach(variation => {
                        completedCombinations++;
                        const progress = (completedCombinations / totalCombinations) * 100;
                        this.progressFill.style.width = `${progress}%`;
                        this.generationStatus.textContent = `Generated ${completedCombinations}/${totalCombinations} variations`;
                        
                        this.addVariationToDisplay(variation);
                    });
                    return variations;
                })
                .catch(error => {
                    
                    // Create error variations for all platforms
                    this.platforms.forEach(platform => {
                        completedCombinations++;
                        const progress = (completedCombinations / totalCombinations) * 100;
                        this.progressFill.style.width = `${progress}%`;
                        
                        let errorDetails = '';
                        if (error.message.includes('429')) {
                            errorDetails = `\n\n🤔 RATE LIMITING (${provider.toUpperCase()}):\n• Only 1 call per provider now\n• Try waiting 3-5 minutes\n• Check API quotas`;
                        } else if (error.message.includes('404')) {
                            errorDetails = `\n\n📋 MODEL NOT FOUND (${bestModel.model}):\n• Model name incorrect\n• Provider API issue`;
                        }
                        
                        const errorVariation = {
                            content: `❌ Failed to generate ${platform} content using ${bestModel.name}\n\nError: ${error.message || 'Unknown error'}${errorDetails}`,
                            source: 'Error',
                            platform: platform,
                            modelName: `${bestModel.name} (Error)`,
                            provider: provider,
                            error: true
                        };
                        this.addVariationToDisplay(errorVariation);
                    });
                    
                    return [];
                });
                
            allGenerationPromises.push(promise);
        });

        try {
            await Promise.all(allGenerationPromises);
            this.generateHashtagSuggestions(baseOptions.topic, baseOptions.keywords);
            this.generationStatus.textContent = `Generated ${totalCombinations} variations successfully!`;
        } catch (error) {
            this.showError('Some variations failed to generate');
        } finally {
            this.generateBtn.textContent = 'Generate Posts';
            this.generateBtn.classList.remove('loading');
            
            setTimeout(() => {
                this.progressBar.classList.remove('active');
                this.generationStatus.textContent = 'Ready to generate';
            }, 2000);
        }
    }

    async generateSingleVariation(modelConfig, options) {
        return this.generateLLMVariation(modelConfig, options);
    }

    async generateMultiPlatformVariation(modelConfig, options) {
        const { provider, model } = modelConfig;
        const apiKey = this.apiKeys[provider];
        const prompt = this.buildMultiPlatformPrompt(options);

        // Use proxy endpoints to avoid CORS issues
        const proxyEndpoints = {
            openai: '/api/openai',
            anthropic: '/api/anthropic',
            gemini: '/api/gemini',
            huggingface: '/api/huggingface'
        };

        const requestBody = {
            apiKey: apiKey,
            model: model,
            prompt: prompt
        };

        try {
            const response = await fetch(proxyEndpoints[provider], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `${provider} API error: ${response.status}`);
            }

            const data = await response.json();
            const variations = this.parseMultiPlatformResponse(data.content, modelConfig.name, provider);
            
            return variations;

        } catch (error) {
            
            // Return error variations for all platforms
            return this.platforms.map(platform => ({
                content: `❌ Failed to generate ${platform} content using ${modelConfig.name}\n\nError: ${error.message || 'Unknown error'}`,
                source: 'Error',
                platform: platform,
                modelName: `${modelConfig.name} (Error)`,
                provider: modelConfig.provider,
                error: true
            }));
        }
    }

    async generateLLMVariation(modelConfig, options, retryCount = 0) {
        const { provider, model } = modelConfig;
        const apiKey = this.apiKeys[provider];
        const prompt = this.buildPrompt(options);

        // Use proxy endpoints to avoid CORS issues
        const proxyEndpoints = {
            openai: '/api/openai',
            anthropic: '/api/anthropic',
            gemini: '/api/gemini',
            huggingface: '/api/huggingface'
        };

        const requestBody = {
            apiKey: apiKey,
            model: model,
            prompt: prompt
        };

        try {
            console.log(`Making request to ${provider} for ${model}`);
            
            const response = await fetch(proxyEndpoints[provider], {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log(`${provider} response status:`, response.status);

            if (!response.ok) {
                const errorData = await response.json();
                
                // Retry 429 errors with longer backoff for premium accounts
                if (response.status === 429 && retryCount < 3) {
                    const waitTime = Math.pow(2, retryCount) * 15000; // 15s, 30s, 60s
                    console.log(`Rate limited (premium account), retrying in ${waitTime/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    return this.generateLLMVariation(modelConfig, options, retryCount + 1);
                }
                
                throw new Error(errorData.error || `${provider} API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                content: this.formatForPlatform(data.content, options.platform),
                source: 'AI Generated'
            };
        } catch (error) {
            // If it's a network error and not our final retry, try once more
            if (retryCount === 0 && !error.message.includes('API error')) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                return this.generateLLMVariation(modelConfig, options, retryCount + 1);
            }
            throw error;
        }
    }


    buildMultiPlatformPrompt(options) {
        const { topic, tone, keywords, includeHashtags, includeEmojis, includeCallToAction } = options;
        
        let prompt = `Create highly engaging, viral-worthy ${tone} social media posts about "${topic}" for ALL these platforms in ONE response. Each post must drive maximum user interaction and engagement.

PLATFORMS TO CREATE POSTS FOR:
1. Twitter/X (280 characters max) - Conversation-starting, retweet-worthy
2. Instagram (2200 characters max) - Lifestyle, save-worthy, visually descriptive
3. Facebook (63206 characters max) - Community-building, shareable in groups
4. Threads (500 characters max) - Deep conversation, authentic sharing
5. Bluesky (300 characters max) - Thoughtful dialogue, community-focused
6. TikTok (150 characters max) - Viral hooks, trend-worthy
7. Generic (500 characters max) - Universal appeal, cross-platform

REQUIREMENTS:
- Each post must be uniquely optimized for its platform's audience and culture
- Use psychological triggers: curiosity gaps, FOMO, social proof, emotional resonance
- Make content impossible to scroll past without engaging`;

        if (keywords.length > 0) {
            prompt += `\n- Naturally incorporate these keywords: ${keywords.join(', ')}`;
        }
        
        if (includeEmojis) {
            prompt += `\n- Use strategic emojis appropriate for each platform`;
        }
        
        if (includeCallToAction) {
            prompt += `\n- Include compelling call-to-actions suited for each platform`;
        }
        
        if (includeHashtags) {
            prompt += `\n- Include trending, relevant hashtags for discoverability`;
        }
        
        prompt += `

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
TWITTER: [your Twitter post here]
INSTAGRAM: [your Instagram post here]
FACEBOOK: [your Facebook post here]
THREADS: [your Threads post here]
BLUESKY: [your Bluesky post here]
TIKTOK: [your TikTok post here]
GENERIC: [your Generic post here]

Make each post conversation-starting, share-worthy, and impossible to ignore!`;
        
        return prompt;
    }

    parseMultiPlatformResponse(content, modelName, provider) {
        const variations = [];
        const platformMappings = {
            'TWITTER': 'twitter',
            'INSTAGRAM': 'instagram', 
            'FACEBOOK': 'facebook',
            'THREADS': 'threads',
            'BLUESKY': 'bluesky',
            'TIKTOK': 'tiktok',
            'GENERIC': 'generic'
        };

        // Split the response by platform labels
        const lines = content.split('\n');
        let currentPlatform = null;
        let currentContent = '';

        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Check if this line starts a new platform
            const platformMatch = trimmedLine.match(/^(TWITTER|INSTAGRAM|FACEBOOK|THREADS|BLUESKY|TIKTOK|GENERIC):\s*(.*)/);
            
            if (platformMatch) {
                // Save previous platform content if exists
                if (currentPlatform && currentContent.trim()) {
                    variations.push({
                        content: currentContent.trim(),
                        source: 'AI Generated',
                        platform: platformMappings[currentPlatform],
                        modelName: modelName,
                        provider: provider
                    });
                }
                
                // Start new platform
                currentPlatform = platformMatch[1];
                currentContent = platformMatch[2] || '';
            } else if (currentPlatform && trimmedLine) {
                // Continue building content for current platform
                if (currentContent) currentContent += '\n';
                currentContent += trimmedLine;
            }
        });

        // Don't forget the last platform
        if (currentPlatform && currentContent.trim()) {
            variations.push({
                content: currentContent.trim(),
                source: 'AI Generated',
                platform: platformMappings[currentPlatform],
                modelName: modelName,
                provider: provider
            });
        }

        return variations;
    }

    addVariationToDisplay(variation) {
        const platform = variation.platform;
        const limit = this.platformLimits[platform];
        const grid = document.querySelector(`.variations-grid[data-platform="${platform}"]`);
        
        if (grid) {
            const card = this.createVariationCard(variation, limit);
            grid.appendChild(card);
            this.updatePlatformTabCount(platform);
        }
    }

    updatePlatformTabCount(platform) {
        const tab = document.querySelector(`.platform-tab[data-platform="${platform}"]`);
        const grid = document.querySelector(`.variations-grid[data-platform="${platform}"]`);
        
        if (tab && grid) {
            const postCount = grid.children.length;
            
            // Add or update post count badge
            let countBadge = tab.querySelector('.post-count');
            if (!countBadge) {
                countBadge = document.createElement('span');
                countBadge.className = 'post-count';
                tab.appendChild(countBadge);
            }
            
            countBadge.textContent = postCount;
            tab.classList.add('has-posts');
        }
    }

    createVariationCard(variation, limit) {
        const card = document.createElement('div');
        card.className = 'variation-card';
        if (variation.error) card.classList.add('error');
        
        const charCount = variation.content.length;
        const isOverLimit = charCount > limit;
        const isWarning = charCount > limit * 0.8;
        
        let countClass = 'variation-character-count';
        if (isOverLimit) countClass += ' over-limit';
        else if (isWarning) countClass += ' warning';

        const platformIcons = {
            twitter: '🐦',
            threads: '📱',
            bluesky: '🦋', 
            instagram: '📸',
            facebook: '👥',
            tiktok: '🎵',
            generic: '🌐'
        };

        const platformNames = {
            twitter: 'Twitter/X',
            threads: 'Threads',
            bluesky: 'Bluesky',
            instagram: 'Instagram', 
            facebook: 'Facebook',
            tiktok: 'TikTok',
            generic: 'Generic'
        };

        card.innerHTML = `
            <div class="variation-header">
                <div class="variation-title">${variation.modelName}</div>
                <div class="${countClass}">${charCount}/${limit}</div>
            </div>
            <div class="platform-indicator">
                ${platformIcons[variation.platform]} ${platformNames[variation.platform]}
            </div>
            <div class="variation-content">${variation.content}</div>
            <div class="variation-actions">
                <button class="variation-btn primary" onclick="this.closest('.variation-card').classList.toggle('selected')">
                    Select
                </button>
                <button class="variation-btn" onclick="socialmedia.copyVariation('${variation.content.replace(/'/g, "\\'")}')">
                    Copy
                </button>
                <small style="margin-left: auto; color: #666; font-size: 10px;">${variation.source}</small>
            </div>
        `;

        return card;
    }

    copyVariation(content) {
        navigator.clipboard.writeText(content).then(() => {
            this.showSuccess('Copied to clipboard!');
        }).catch(() => {
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Copied to clipboard!');
        });
    }





    formatForPlatform(post, platform) {
        const limit = this.platformLimits[platform];
        
        if (post.length > limit) {
            const truncated = post.substring(0, limit - 3) + '...';
            return truncated;
        }
        
        return post;
    }


    generateHashtagSuggestions(topic, keywords) {
        const suggestions = [];
        const topicWords = topic.toLowerCase().split(' ');
        
        topicWords.forEach(word => {
            if (word.length > 3) {
                suggestions.push('#' + word.charAt(0).toUpperCase() + word.slice(1));
            }
        });

        keywords.forEach(keyword => {
            if (keyword.length > 2) {
                suggestions.push('#' + keyword.replace(/\s+/g, ''));
            }
        });

        const trending = ['#Trending', '#Viral', '#MustRead', '#Inspiration', '#Tips', '#Innovation'];
        suggestions.push(...trending.slice(0, 3));

        this.displayHashtagSuggestions([...new Set(suggestions)].slice(0, 8));
    }

    displayHashtagSuggestions(hashtags) {
        this.hashtagList.innerHTML = '';
        hashtags.forEach(hashtag => {
            const span = document.createElement('span');
            span.className = 'hashtag-tag';
            span.textContent = hashtag;
            span.addEventListener('click', () => this.addHashtagToSelectedVariations(hashtag));
            this.hashtagList.appendChild(span);
        });
    }

    addHashtagToSelectedVariations(hashtag) {
        const selectedCards = document.querySelectorAll('.variation-card.selected');
        if (selectedCards.length === 0) {
            alert('Please select a variation first by clicking the "Select" button.');
            return;
        }

        selectedCards.forEach(card => {
            const contentDiv = card.querySelector('.variation-content');
            const currentContent = contentDiv.textContent;
            if (!currentContent.includes(hashtag)) {
                contentDiv.textContent = currentContent + ` ${hashtag}`;
                const charCountSpan = card.querySelector('.variation-character-count');
                const newCount = contentDiv.textContent.length;
                const limit = parseInt(charCountSpan.textContent.split('/')[1]);
                charCountSpan.textContent = `${newCount}/${limit}`;
                
                charCountSpan.className = 'variation-character-count';
                if (newCount > limit) {
                    charCountSpan.classList.add('over-limit');
                } else if (newCount > limit * 0.8) {
                    charCountSpan.classList.add('warning');
                }
            }
        });
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.api-error, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'api-error' : 'success-message';
        messageDiv.textContent = message;
        
        this.generateBtn.parentNode.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Global instance for onclick handlers
let socialmedia;

document.addEventListener('DOMContentLoaded', () => {
    socialmedia = new MultiPlatformSocialGenerator();
});