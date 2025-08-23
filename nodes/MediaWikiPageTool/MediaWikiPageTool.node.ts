import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow'

import { MediaWikiClient } from '../../src/MediaWikiClient'

export class MediaWikiPageTool implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'MediaWiki Page',
    name: 'mediaWikiPageTool',
    icon: 'file:mediawiki.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["pageTitle"]}}',
    description: 'Perform get, create, or update operations on MediaWiki pages',
    usableAsTool: true,
    defaults: {
      name: 'MediaWiki Page',
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
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
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
        description: 'The title of the page to operate on',
      },
      {
        displayName: 'Page Content',
        name: 'pageContent',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: false,
        description: 'The full text content of the page (required for create and update)',
        displayOptions: {
          show: { operation: ['create', 'update'] },
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
        const credentials = await this.getCredentials('mediaWikiApi')

        const client = new MediaWikiClient(credentials, this.helpers)
        let response

        if (operation === 'get') {
          response = await client.getPage({ title: pageTitle })
        } else if (operation === 'create' || operation === 'update') {
          if (!pageContent) {
            throw new NodeOperationError(
              this.getNode(),
              'Page content is required for create and update operations.'
            )
          }
          response = await client.editPage({
            title: pageTitle,
            content: pageContent,
          })
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Invalid operation: ${operation}`
          )
        }

        returnData.push({
          json: {
            success: true,
            operation,
            title: pageTitle,
            content: pageContent,
            response,
          },
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
