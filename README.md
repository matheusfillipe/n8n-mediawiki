# 📚 n8n-nodes-mediawiki

[![npm version](https://badge.fury.io/js/n8n-nodes-mediawiki.svg)](https://www.npmjs.com/package/n8n-nodes-mediawiki)

A powerful n8n community node for seamless MediaWiki integration. Connect your n8n workflows to any MediaWiki instance (like Wikipedia) and manage collaborative knowledge with ease.

## ✨ Features

### 🔧 Regular Workflow Nodes
- **MediaWiki Page**: Complete page operations (get, edit, delete) for any MediaWiki instance
- **MediaWiki Search**: Powerful search functionality for finding pages within MediaWiki
- **Flexible Authentication**: Support for both authenticated and anonymous operations

### 🤖 AI-Compatible Tools
All nodes support AI integration with the "Let AI fill this in" functionality:
- **MediaWiki Page**: AI-compatible tool for all page operations with intelligent parameter filling
- **MediaWiki Search**: AI-powered search with contextual query generation
- **LangChain Integration**: Seamlessly works with n8n AI agents and workflows
- **Smart Parameter Detection**: AI automatically determines page titles, content, and search terms

## 📦 Installation

### For n8n Users (GUI Installation)

To install this community node in your **self-hosted** n8n instance:

1. **Open n8n Settings**: Go to **Settings** → **Community Nodes**

2. **Start Installation**: Click **Install**

3. **Find Package**: 
   - **Option A**: Type `n8n-nodes-mediawiki` directly in the **Enter npm package name** field
   - **Option B**: Click **Browse** to search the npm registry for community nodes, then find `n8n-nodes-mediawiki`

4. **Accept Risks**: Check **"I understand the risks of installing unverified code from a public source"**

5. **Install**: Click **Install**

6. **Ready to Use**: The MediaWiki nodes will now appear in your nodes panel with a package icon

### Managing the Package

- **Update**: When updates are available, an **Update** button will appear in **Settings** → **Community Nodes**
- **Uninstall**: Go to **Settings** → **Community Nodes**, click **Options** → **Uninstall package**

> **Note**: Community nodes can only be installed on **self-hosted n8n instances** by the instance owner. This feature is not available on n8n Cloud.

## 🚀 Usage

### 🔐 Credentials

Configure the MediaWiki API credentials with:
- **Base URL**: The base URL of your MediaWiki instance (e.g., `https://en.wikipedia.org`)
- **Username**: (Optional) Username for authenticated operations
- **Password**: (Optional) Password for authenticated operations

### 🎯 Available Nodes

#### 📄 MediaWiki Page
Complete page management with support for:
- **Get**: Retrieve the content of any page
- **Edit**: Create new pages or update existing pages with content (automatically detects if page exists)
- **Delete**: Remove pages with optional deletion reason

#### 🔍 MediaWiki Search  
- **Search**: Find pages matching your search query with configurable result limits

### 🤖 AI Integration

Both nodes work seamlessly with n8n's AI Agent nodes:

1. **Add nodes to your workflow** - Use MediaWiki Page and MediaWiki Search as regular nodes
2. **Connect to AI Agents** - These nodes automatically become available as AI tools when connected to AI Agent nodes
3. **"Let AI fill this in" buttons** - Parameters show toggle buttons allowing AI to automatically fill values based on context
4. **Intelligent automation** - AI agents can read, edit, delete, and search MediaWiki content autonomously

#### Example AI Usage:
- **AI Research Assistant**: "Find information about quantum computing on Wikipedia and create a summary page"
- **Content Management**: "Update the company wiki page with the latest product information"
- **Knowledge Discovery**: "Search for pages related to machine learning and extract key concepts"

### 💡 Parameter Configuration

#### MediaWiki Page Node
- **Operation**: Select get, edit, or delete
- **Page Title**: The title of the page to operate on (AI can fill automatically)
- **Page Content**: Content for edit operations (AI can generate) - creates page if it doesn't exist, updates if it does
- **Delete Reason**: Optional reason for deletion (AI can suggest)

#### MediaWiki Search Node
- **Search Term**: Query to find matching pages (AI can formulate)
- **Limit**: Maximum number of results (1-500, defaults to 10)

## 🛠️ Development

### 🚀 Setup

1. Clone: `git clone https://github.com/matheusfillipe/n8n-mediawiki`
2. Install: `npm install`
3. Build: `npm run build`
4. Link: `npm link` (for local development)

### 🐳 Testing with Docker

A `compose.yaml` file is included for easy testing:

```bash
docker compose up
```

This will start n8n on http://localhost:5678 with AI tool support enabled.

### ⚙️ Environment Variables

For AI tool functionality in production, ensure this environment variable is set:

```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

This enables community nodes to be used as AI tools with the "Let AI fill this in" functionality.

### 📁 Project Structure

```
n8n-nodes-mediawiki/
├── nodes/
│   ├── MediaWikiPage/           # Main page operations node
│   │   ├── MediaWikiPage.node.ts
│   │   └── mediawiki.svg
│   └── MediaWikiSearch/         # Search functionality node
│       ├── MediaWikiSearch.node.ts
│       └── mediawiki.svg
├── credentials/
│   └── MediaWikiApi.credentials.ts
├── src/
│   └── MediaWikiClient.ts       # Shared MediaWiki API client
└── compose.yaml                 # Docker development environment
```

Each node functions as both a regular workflow node and an AI tool, eliminating code duplication and ensuring consistency.

## 📄 License

MIT
