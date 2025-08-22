# n8n-nodes-mediawiki

This is an n8n community node for MediaWiki integration. It allows you to interact with MediaWiki instances (like Wikipedia) from your n8n workflows.

## Features

### Regular Nodes
- **Page Operations**: Get, create, and update MediaWiki pages
- **Search**: Search for pages within a MediaWiki instance
- **Flexible Authentication**: Support for both authenticated and anonymous operations

### AI Tools
- **MediaWiki Page Tool**: AI-compatible tool for general page operations (get, create, update)
- **MediaWiki Search Tool**: AI-compatible tool for searching pages
- **MediaWiki Create Page Tool**: Dedicated tool for creating new pages
- **MediaWiki Update Page Tool**: Dedicated tool for updating existing pages with edit summary support
- **LangChain Integration**: Works with n8n AI agents and workflows

## Installation

To install this node in your n8n instance:

1. Install the package:
   ```bash
   npm install n8n-nodes-mediawiki
   ```

2. Restart n8n

## Usage

### Credentials

Configure the MediaWiki API credentials with:
- **Base URL**: The base URL of your MediaWiki instance (e.g., https://en.wikipedia.org)
- **Username**: (Optional) Username for authenticated operations
- **Password**: (Optional) Password for authenticated operations

### Operations

#### Page Resource
- **Get**: Retrieve the content of a page
- **Create**: Create a new page with specified content
- **Update**: Update an existing page with new content

#### Search Resource
- **Search**: Search for pages matching a query

### AI Tools Usage

The AI tools can be used with n8n's AI Agent nodes:

1. Add an AI Agent node to your workflow
2. Connect the MediaWiki Page Tool or Search Tool to the agent
3. The AI can now use these tools automatically based on context

#### MediaWiki Page Tool
- Input format: `{"operation": "get|create|update", "title": "Page Title", "content": "Page content (for create/update)"}`
- Returns: MediaWiki API response

#### MediaWiki Search Tool  
- Input format: `{"query": "search term", "limit": 10}` or just `"search term"`
- Returns: Search results from MediaWiki API

#### MediaWiki Create Page Tool
- Input format: `{"title": "Page Title", "content": "Page content"}`
- Returns: MediaWiki API response with creation confirmation
- Note: Requires authentication credentials

#### MediaWiki Update Page Tool
- Input format: `{"title": "Page Title", "content": "Updated content", "summary": "Edit summary (optional)"}`
- Returns: MediaWiki API response with update confirmation
- Note: Requires authentication credentials and page must exist

## Development

This project was created using the n8n-nodes-starter template.

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Link for local development: `npm link`

### Testing with Docker

A docker-compose.yml file is included for easy testing:

```bash
docker-compose up
```

This will start n8n on http://localhost:5678

## License

MIT