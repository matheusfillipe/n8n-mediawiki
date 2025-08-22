# n8n-nodes-mediawiki

This is an n8n community node for MediaWiki integration. It allows you to interact with MediaWiki instances (like Wikipedia) from your n8n workflows.

## Features

- **Page Operations**: Get, create, and update MediaWiki pages
- **Search**: Search for pages within a MediaWiki instance
- **Flexible Authentication**: Support for both authenticated and anonymous operations

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