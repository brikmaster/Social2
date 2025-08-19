# AI-Powered Multi-Platform Social Media Post Generator

A comprehensive web application that generates highly engaging, viral-worthy social media posts for multiple platforms simultaneously using advanced AI models optimized for maximum user interaction.

## 🚀 Features

### Multi-Platform Support
- **Twitter/X** (280 chars) - Concise, trending, retweet-focused
- **Threads** (500 chars) - Conversational and authentic discussion
- **Bluesky** (300 chars) - Thoughtful and genuine conversation
- **Instagram** (2200 chars) - Visual-focused with lifestyle appeal
- **Facebook** (63206 chars) - Community-oriented, broad appeal
- **TikTok** (150 chars) - Viral, trendy content
- **Generic** (500 chars) - Versatile for any platform

### AI Integration
- **OpenAI** (GPT-4o, GPT-4o Mini, GPT-3.5 Turbo)
- **Anthropic** (Claude-3.5 Sonnet, Claude-3 Haiku)
- **Google Gemini** (Gemini 1.5 Pro, Gemini 1.5 Flash)

### Smart Content Generation
- Platform-specific optimization designed for maximum engagement
- Multiple tone options (Professional, Casual, Funny, Inspirational, Educational, Promotional)
- AI-generated hashtags optimized for discoverability
- Platform-appropriate calls-to-action that drive interaction
- Strategic emoji placement for enhanced engagement
- Natural keyword incorporation with viral potential
- Content designed to trigger psychological engagement (curiosity, FOMO, social proof)

### User Experience
- One-time API key setup with secure local storage
- Real-time progress tracking across all platforms
- Platform tabs for easy content browsing
- Copy-to-clipboard functionality
- Responsive design for desktop and mobile

## 🛠️ Getting Started

### Prerequisites
- Modern web browser
- API keys for desired AI providers (optional)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/[your-username]/social-tool.git
   cd social-tool
   ```

2. Open `index.html` in your web browser:
   ```bash
   open index.html
   ```
   Or drag the file into your browser window.

### API Setup (Required)
On first launch, you'll see a setup modal where you must configure at least one:
- **OpenAI API Key** - For GPT models
- **Anthropic API Key** - For Claude models  
- **Google Gemini API Key** - For Gemini models

API keys are stored securely in your browser's localStorage and never sent to external servers. At least one API key is required for the application to function.

## 📱 How to Use

1. **Setup**: Configure API keys (required) on first launch
2. **Input**: Enter your topic, select tone, and add keywords
3. **Generate**: Click "Generate Posts" to create viral-worthy content for all platforms
4. **Browse**: Use platform tabs to view highly engaging content optimized for each network
5. **Copy**: Select and copy your favorite high-engagement variations

## 🎯 Platform Optimization

Each platform receives content specifically optimized for maximum engagement:

- **Twitter/X**: Controversial takes, thread-worthy hooks, retweet-optimized content with FOMO triggers
- **Threads**: Deep conversation starters, relatable content, vulnerability-encouraging posts
- **Bluesky**: Philosophical angles, community-building content, thoughtful dialogue triggers
- **Instagram**: Aspirational content, save-worthy posts, friend-tagging triggers
- **Facebook**: Shareable content, nostalgic references, debate-worthy topics
- **TikTok**: Scroll-stopping hooks, duet-worthy content, viral potential maximized

## 🔧 Technical Details

### Architecture
- Pure JavaScript (ES6+) with no external dependencies
- Modular class-based design
- Async/await for API calls with robust error handling
- Local fallback system for reliability

### File Structure
```
social-tool/
├── index.html          # Main application interface
├── styles.css          # Responsive styling
├── script.js           # AI-powered generation logic
├── package.json        # Project metadata
└── README.md          # Documentation
```

### API Integration
- OpenAI Chat Completions API with engagement-optimized prompts
- Anthropic Messages API with viral content instructions
- Google Generative AI API with interaction-focused parameters
- Secure local storage for API keys
- No fallback templates - pure AI generation only

## 🔒 Privacy & Security

- API keys stored locally in browser only
- No data sent to external servers except chosen AI providers
- AI-only generation requires at least one API key
- No user data collection or tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- Google for Gemini models
- Social media platforms for inspiration