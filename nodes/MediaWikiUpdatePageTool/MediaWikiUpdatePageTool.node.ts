import {
	ISupplyDataFunctions,
	INodeType,
	INodeTypeDescription,
	SupplyData,
	NodeConnectionType,
} from 'n8n-workflow';

import { DynamicTool } from '@langchain/core/tools';
import { MediaWikiClient } from '../../src/MediaWikiClient';

export class MediaWikiUpdatePageTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MediaWiki Update Page Tool',
		name: 'mediaWikiUpdatePageTool',
		icon: 'file:mediawiki.svg',
		group: ['transform'],
		version: 1,
		description: 'AI tool for updating existing MediaWiki pages',
		defaults: {
			name: 'MediaWiki Update Page Tool',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.mediawiki.org/wiki/API:Edit',
					},
				],
			},
		},
		inputs: [],
		outputs: [{ type: NodeConnectionType.AiTool }],
		outputNames: ['tool'],
		credentials: [
			{
				name: 'mediaWikiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Tool Name',
				name: 'toolName',
				type: 'string',
				default: 'mediawiki_update_page',
				description: 'Name of the tool for AI agent reference',
				required: true,
			},
			{
				displayName: 'Tool Description',
				name: 'toolDescription',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: 'Tool for updating existing MediaWiki pages. Requires a page title and new content to update an existing page on the MediaWiki instance.',
				description: 'Description that helps the AI agent understand when to use this tool',
				required: true,
			},
			{
				displayName: 'Include Edit Summary',
				name: 'includeEditSummary',
				type: 'boolean',
				default: true,
				description: 'Whether to allow the AI to provide an edit summary for the update',
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const toolName = this.getNodeParameter('toolName', itemIndex) as string;
		const toolDescription = this.getNodeParameter('toolDescription', itemIndex) as string;
		const includeEditSummary = this.getNodeParameter('includeEditSummary', itemIndex) as boolean;
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		const tool = new DynamicTool({
			name: toolName,
			description: toolDescription + (includeEditSummary ? ' Can optionally include an edit summary.' : ''),
			func: async (input: string) => {
				try {
					let parsedInput: any;
					try {
						parsedInput = JSON.parse(input);
					} catch {
						return JSON.stringify({
							error: 'Invalid input format. Expected JSON with title and content fields' + 
								   (includeEditSummary ? ', and optional summary field' : '') + '.',
						});
					}

					const { title, content, summary } = parsedInput;

					if (!title) {
						return JSON.stringify({
							error: 'Missing required field: title is required.',
						});
					}

					if (!content) {
						return JSON.stringify({
							error: 'Missing required field: content is required.',
						});
					}

					// First check if the page exists by trying to get it
					try {
						const existingPage = await client.getPage({ title });
						if (!existingPage || !existingPage.query || !existingPage.query.pages) {
							return JSON.stringify({
								success: false,
								error: 'Page does not exist. Use create page tool instead.',
							});
						}
					} catch (error) {
						return JSON.stringify({
							success: false,
							error: 'Could not verify page exists: ' + (error instanceof Error ? error.message : String(error)),
						});
					}

					const responseData = await client.editPage({ 
						title, 
						content,
						...(includeEditSummary && summary ? { summary } : {})
					});

					return JSON.stringify({
						success: true,
						operation: 'update',
						title,
						...(includeEditSummary && summary ? { summary } : {}),
						response: responseData,
					});
				} catch (error) {
					return JSON.stringify({
						success: false,
						error: error instanceof Error ? error.message : String(error),
					});
				}
			},
		});

		return {
			response: tool,
		};
	}
}