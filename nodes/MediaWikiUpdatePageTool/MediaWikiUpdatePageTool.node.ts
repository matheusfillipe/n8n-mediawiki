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
		usableAsTool: true,
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
				displayName: 'Page Title',
				name: 'pageTitle',
				type: 'string',
				default: '',
				description: 'Title of the page to update',
				required: false,
			},
			{
				displayName: 'Page Content',
				name: 'pageContent',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'New content for the page',
				required: false,
			},
			{
				displayName: 'Edit Summary',
				name: 'editSummary',
				type: 'string',
				default: 'Updated by AI',
				description: 'Optional summary describing the changes made',
				required: false,
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const pageTitle = this.getNodeParameter('pageTitle', itemIndex) as string;
		const pageContent = this.getNodeParameter('pageContent', itemIndex) as string;
		const editSummary = this.getNodeParameter('editSummary', itemIndex, '') as string;
		const credentials = await this.getCredentials('mediaWikiApi');

		const client = new MediaWikiClient(credentials, this.helpers);

		const tool = new DynamicTool({
			name: 'mediawiki_update_page_tool',
			description: `Update existing MediaWiki page "${pageTitle}". Use this to update pages with new content.`,
			func: async () => {
				try {
					// First check if the page exists by trying to get it
					try {
						const existingPage = await client.getPage({ title: pageTitle });
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
						title: pageTitle, 
						content: pageContent,
						...(editSummary ? { summary: editSummary } : {})
					});

					return JSON.stringify({
						success: true,
						operation: 'update',
						title: pageTitle,
						...(editSummary ? { summary: editSummary } : {}),
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