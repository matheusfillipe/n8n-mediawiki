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
    subtitle: '={{$parameter["operation"] + ": " + $parameter["pageTitle"]}}',
    description: 'Perform get, create, or update operations on MediaWiki pages',
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
          { name: 'Page Get', value: 'get' },
          { name: 'Page Create', value: 'create' },
          { name: 'Page Update', value: 'update' },
          { name: 'Page Delete', value: 'delete' },
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
      {
        displayName: 'Delete Reason',
        name: 'deleteReason',
        type: 'string',
        default: '',
        required: false,
        description: 'Optional reason for deleting the page',
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

        if (operation === 'create' || operation === 'update') {
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
