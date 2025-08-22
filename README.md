# n8n-nodes-mediawiki 📚✨

[![npm version](https://badge.fury.io/js/n8n-nodes-mediawiki.svg)](https://www.npmjs.com/package/n8n-nodes-mediawiki)

🚀 A powerful n8n community node for seamless MediaWiki integration! Connect your n8n workflows to any MediaWiki instance (like Wikipedia) and unleash the power of collaborative knowledge management. 🌐

## ✨ Features

### 🔧 Regular Nodes
- **📄 Page Operations**: Get, create, and update MediaWiki pages with ease
- **🔍 Search**: Powerful search functionality for finding pages within any MediaWiki instance
- **🔐 Flexible Authentication**: Support for both authenticated and anonymous operations

### 🤖 AI Tools (LangChain Integration)
- **🎯 MediaWiki Page Tool**: AI-compatible tool for general page operations (get, create, update)
- **🔎 MediaWiki Search Tool**: AI-powered search functionality for intelligent content discovery
- **📝 MediaWiki Create Page Tool**: Dedicated tool for creating new pages with AI assistance
- **✏️ MediaWiki Update Page Tool**: Smart page updates with edit summary support
- **⚡ LangChain Integration**: Seamlessly works with n8n AI agents and workflows

## 📦 Installation

To install this node in your n8n instance:

1. **Install the package** 📥:
   ```bash
   npm install n8n-nodes-mediawiki
   ```

2. **Restart n8n** 🔄

3. **Start creating!** 🎉 The MediaWiki nodes will appear in your n8n interface

## 🚀 Usage

### 🔐 Credentials

Configure the MediaWiki API credentials with:
- **🌐 Base URL**: The base URL of your MediaWiki instance (e.g., `https://en.wikipedia.org`)
- **👤 Username**: (Optional) Username for authenticated operations
- **🔑 Password**: (Optional) Password for authenticated operations

### 🎯 Operations

#### 📄 Page Resource
- **📖 Get**: Retrieve the content of any page
- **➕ Create**: Create a new page with specified content
- **✏️ Update**: Update an existing page with new content

#### 🔍 Search Resource
- **🔎 Search**: Find pages matching your search query

### 🤖 AI Tools Usage

Supercharge your AI workflows with intelligent MediaWiki integration:

1. **🔗 Connect**: Add an AI Agent node to your workflow
2. **🛠️ Attach**: Connect MediaWiki AI tools to your agent  
3. **🧠 Automate**: Let AI use these tools automatically based on context!

#### 🎯 MediaWiki Page Tool
- **📥 Input**: `{"operation": "get|create|update", "title": "Page Title", "content": "Page content (for create/update)"}`
- **📤 Returns**: MediaWiki API response with operation results

#### 🔎 MediaWiki Search Tool  
- **📥 Input**: `{"query": "search term", "limit": 10}` or just `"search term"`
- **📤 Returns**: Rich search results from MediaWiki API

#### 📝 MediaWiki Create Page Tool
- **📥 Input**: `{"title": "Page Title", "content": "Page content"}`
- **📤 Returns**: Creation confirmation with success details
- **⚠️ Note**: Requires authentication credentials

#### ✏️ MediaWiki Update Page Tool
- **📥 Input**: `{"title": "Page Title", "content": "Updated content", "summary": "Edit summary (optional)"}`
- **📤 Returns**: Update confirmation with change details
- **⚠️ Note**: Requires authentication credentials and page must exist

## 🛠️ Development

Ready to contribute? Here's how to get started:

### 🚀 Setup

1. **📥 Clone**: `git clone https://github.com/matheusfillipe/n8n-mediawiki`
2. **📦 Install**: `npm install`
3. **🔨 Build**: `npm run build`
4. **🔗 Link**: `npm link` (for local development)

### 🐳 Testing with Docker

A `compose.yaml` file is included for easy testing:

```bash
docker compose up
```

This will start n8n on http://localhost:5678 🌐

## 📄 License

MIT
