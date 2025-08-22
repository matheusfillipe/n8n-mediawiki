# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- MediaWiki node for basic page operations (get, create, update)
- Search functionality for MediaWiki pages
- AI Tools for n8n agents:
  - MediaWiki Page Tool (general operations)
  - MediaWiki Search Tool (search functionality)  
  - MediaWiki Create Page Tool (dedicated page creation)
  - MediaWiki Update Page Tool (dedicated page updates with edit summaries)
- Support for both authenticated and anonymous operations
- Smart URL handling for various MediaWiki base URL formats
- Proper CSRF token handling for authenticated requests

### Fixed
- URL construction issues with MediaWiki API endpoints
- Proper handling of base URLs ending with '/api.php'

## [0.1.0] - Initial Release

### Added
- Initial implementation of MediaWiki n8n nodes and AI tools