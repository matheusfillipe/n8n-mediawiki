import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow'

import { MediaWikiClient } from '../../src/MediaWikiClient'

export class MediaWikiPage implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MediaWiki',
    name: 'mediaWikiPage',
    icon: 'file:mediawiki.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["pageTitle"] ? $parameter["operation"] + ": " + $parameter["pageTitle"] : "MediaWiki page operations"}}',
    description: 'Get, edit, or delete MediaWiki pages',
    usableAsTool: true,
    defaults: {
      name: 'MediaWiki',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'mediaWikiApi',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Get Page',
            value: 'get',
            description:
              'Retrieve the current content and metadata of an existing page',
          },
          {
            name: 'Edit Page',
            value: 'edit',
            description:
              'Create a new page or update existing page content (auto-detects if page exists)',
          },
          {
            name: 'Delete Page',
            value: 'delete',
            description:
              'Permanently remove a page and all its revision history',
          },
        ],
        default: 'get',
        required: true,
      },
      {
        displayName: 'Page Title',
        name: 'pageTitle',
        type: 'string',
        default: '',
        required: true,
        description:
          'The exact title of the MediaWiki page. Use proper capitalization and spacing. Examples: "Main Page", "User:JohnDoe", "Category:Science"',
      },
      {
        displayName: 'Page Content',
        name: 'pageContent',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: false,
        description:
          'The complete page content in MediaWiki wikitext format. Use MediaWiki markup: ==Headings==, [[links]], {{templates}}, *bullets, #numbered lists, etc.',
        displayOptions: {
          show: { operation: ['edit'] },
        },
      },
      {
        displayName: 'Delete Reason',
        name: 'deleteReason',
        type: 'string',
        default: '',
        required: false,
        description:
          'Brief reason for page deletion that will appear in deletion log. Examples: "Spam", "Copyright violation", "Outdated information".',
        displayOptions: {
          show: { operation: ['delete'] },
        },
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string
        const pageTitle = this.getNodeParameter('pageTitle', i) as string
        const pageContent = this.getNodeParameter(
          'pageContent',
          i,
          ''
        ) as string
        const deleteReason = this.getNodeParameter(
          'deleteReason',
          i,
          ''
        ) as string
        const credentials = await this.getCredentials('mediaWikiApi')

        const client = new MediaWikiClient(credentials, this.helpers)
        let response

        if (operation === 'get') {
          response = await client.getPage({ title: pageTitle })
        } else if (operation === 'edit') {
          if (!pageContent) {
            throw new NodeOperationError(
              this.getNode(),
              'Page content is required for edit operations.'
            )
          }
          response = await client.editPage({
            title: pageTitle,
            content: pageContent,
          })
        } else if (operation === 'delete') {
          response = await client.deletePage({
            title: pageTitle,
            reason: deleteReason,
          })
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Invalid operation: ${operation}`
          )
        }

        const responseData: any = {
          success: true,
          operation,
          title: pageTitle,
          response,
        }

        if (operation === 'edit') {
          responseData.content = pageContent
        }

        if (operation === 'delete' && deleteReason) {
          responseData.reason = deleteReason
        }

        returnData.push({
          json: responseData,
        })
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
          })
          continue
        }
        throw new NodeOperationError(
          this.getNode(),
          error instanceof Error ? error : String(error)
        )
      }
    }

    return [returnData]
  }
}
