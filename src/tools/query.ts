/**
 * Coralogix Query Tools
 * Tools for querying logs, metrics, and traces using DataPrime and Lucene
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCoralogixClient } from '../services/coralogix-client.js';
import { QueryRequest, QueryMetadata, QuerySyntax, Tier } from '../types/coralogix.js';

// Tool definitions
export const queryTools: Tool[] = [
  {
    name: 'query_dataprime',
    description: 'Execute DataPrime queries to search and analyze ACTUAL LOG DATA, traces, and spans in real-time. Use this tool when the user asks for "logs", "error logs", "recent logs", "show me logs", etc. This returns actual log entries, not configuration. Perfect for: finding the last N error logs, investigating specific errors, searching log messages by content, filtering by severity levels (ERROR, WARN, INFO), time ranges, applications, or any log content. Returns the actual log data with timestamps, messages, severity levels, and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'DataPrime query string. EXAMPLES for common requests:\n- Last 5 error logs: "source logs | filter severity == \\"ERROR\\" | limit 5"\n- Recent critical logs: "source logs | filter severity == \\"CRITICAL\\" | limit 10"\n- Application errors: "source logs | filter severity == \\"ERROR\\" AND applicationname == \\"myapp\\" | limit 20"\n- Search for specific error: "source logs | filter text contains \\"timeout\\" | limit 10"\n- Logs from last hour: "source logs | filter timestamp > now() - 1h | limit 50"'
        },
        startDate: {
          type: 'string',
          description: 'Start time in ISO format (e.g., "2025-06-19T21:00:00.000Z"). Defaults to 24 hours ago if not specified. For "recent" or "latest" logs, leave empty.'
        },
        endDate: {
          type: 'string',
          description: 'End time in ISO format (e.g., "2025-06-19T22:00:00.000Z"). Defaults to current time if not specified. For "recent" or "latest" logs, leave empty.'
        },
        tier: {
          type: 'string',
          enum: ['TIER_ARCHIVE', 'TIER_FREQUENT_SEARCH'],
          description: 'Data tier to search. Use TIER_FREQUENT_SEARCH for recent data (faster, more expensive) or TIER_ARCHIVE for older data (slower, cheaper). Default: TIER_FREQUENT_SEARCH for recent logs.'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of log entries to return (1-10000). Defaults to 100. Use smaller limits (5-20) for "last N logs" requests.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'query_lucene',
    description: 'Execute Lucene queries to search ACTUAL LOG DATA with traditional search syntax. Use this tool when users ask for logs using simple search terms. This returns actual log entries, not configuration. Best for: simple text searches in logs, field-based filtering, boolean queries when you need familiar Lucene syntax. Returns actual log data with timestamps, messages, and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Lucene query string. EXAMPLES for common requests:\n- Error logs: "severity:ERROR"\n- Specific application errors: "severity:ERROR AND applicationName:myapp"\n- Search for text: "message:timeout AND severity:ERROR"\n- 500 errors: "status:500"\n- Recent failures: "failed OR error OR exception"'
        },
        startDate: {
          type: 'string',
          description: 'Start time in ISO format. Defaults to 24 hours ago if not specified. For "recent" logs, leave empty.'
        },
        endDate: {
          type: 'string',
          description: 'End time in ISO format. Defaults to current time if not specified. For "recent" logs, leave empty.'
        },
        tier: {
          type: 'string',
          enum: ['TIER_ARCHIVE', 'TIER_FREQUENT_SEARCH'],
          description: 'Data tier to search. TIER_FREQUENT_SEARCH for recent data, TIER_ARCHIVE for older data. Default: TIER_FREQUENT_SEARCH.'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of log entries to return (1-10000). Use 5-20 for "last N logs" requests.'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'submit_background_query',
    description: 'Submit long-running queries for large log datasets that may take several minutes to complete. Use this for: large log exports, complex aggregations over long time periods, queries that might timeout in regular query, and when you need to process massive datasets. Returns a query ID to check status and retrieve results later. NOT for simple "show me last 5 logs" requests.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'DataPrime query string for background execution. Should be complex queries that need more time to process large datasets.'
        },
        startDate: {
          type: 'string',
          description: 'Start time in ISO format. Required for background queries to define the time range.'
        },
        endDate: {
          type: 'string',
          description: 'End time in ISO format. Required for background queries to define the time range.'
        },
        syntax: {
          type: 'string',
          enum: ['QUERY_SYNTAX_DATAPRIME', 'QUERY_SYNTAX_LUCENE'],
          description: 'Query syntax type. Use QUERY_SYNTAX_DATAPRIME for DataPrime queries or QUERY_SYNTAX_LUCENE for Lucene queries.'
        }
      },
      required: ['query', 'startDate', 'endDate']
    }
  },
  {
    name: 'get_background_query_status',
    description: 'Check the execution status of a previously submitted background query. Use this to: monitor query progress, check if query completed successfully, get error information if query failed, and determine when results are ready for retrieval. Only use after submit_background_query.',
    inputSchema: {
      type: 'object',
      properties: {
        queryId: {
          type: 'string',
          description: 'The query ID returned from submit_background_query. Used to track the specific background query.'
        }
      },
      required: ['queryId']
    }
  },
  {
    name: 'get_background_query_data',
    description: 'Retrieve the actual log data results from a completed background query. Use this after confirming the query status is completed. Returns the actual log entries from the background query execution.',
    inputSchema: {
      type: 'object',
      properties: {
        queryId: {
          type: 'string',
          description: 'The query ID of the completed background query whose results you want to retrieve.'
        }
      },
      required: ['queryId']
    }
  },
  {
    name: 'cancel_background_query',
    description: 'Cancel a running background query to stop execution and free up resources. Use this when: query is taking too long, you made an error in the query, or you no longer need the results.',
    inputSchema: {
      type: 'object',
      properties: {
        queryId: {
          type: 'string',
          description: 'The query ID of the background query to cancel.'
        }
      },
      required: ['queryId']
    }
  }
];

// Tool handlers
export async function handleQueryTool(name: string, args: any): Promise<string> {
  const client = getCoralogixClient();

  switch (name) {
    case 'query_dataprime':
      return await handleDataPrimeQuery(client, args);
    
    case 'query_lucene':
      return await handleLuceneQuery(client, args);
    
    case 'submit_background_query':
      return await handleSubmitBackgroundQuery(client, args);
    
    case 'get_background_query_status':
      return await handleGetBackgroundQueryStatus(client, args);
    
    case 'get_background_query_data':
      return await handleGetBackgroundQueryData(client, args);
    
    case 'cancel_background_query':
      return await handleCancelBackgroundQuery(client, args);
    
    default:
      throw new Error(`Unknown query tool: ${name}`);
  }
}

async function handleDataPrimeQuery(client: any, args: any): Promise<string> {
  const { query, tier = 'TIER_FREQUENT_SEARCH', limit, startDate, endDate, defaultSource } = args;

  const metadata: QueryMetadata = {
    syntax: 'QUERY_SYNTAX_DATAPRIME' as QuerySyntax,
    tier: tier as Tier,
    ...(limit && { limit }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(defaultSource && { defaultSource })
  };

  const request: QueryRequest = {
    query,
    metadata
  };

  try {
    const responses = await client.query(request);
    return formatQueryResponse(responses, 'DataPrime');
  } catch (error) {
    throw new Error(`DataPrime query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleLuceneQuery(client: any, args: any): Promise<string> {
  const { query, tier = 'TIER_FREQUENT_SEARCH', limit, startDate, endDate } = args;

  const metadata: QueryMetadata = {
    syntax: 'QUERY_SYNTAX_LUCENE' as QuerySyntax,
    tier: tier as Tier,
    ...(limit && { limit }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  };

  const request: QueryRequest = {
    query,
    metadata
  };

  try {
    const responses = await client.query(request);
    return formatQueryResponse(responses, 'Lucene');
  } catch (error) {
    throw new Error(`Lucene query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleSubmitBackgroundQuery(client: any, args: any): Promise<string> {
  const { query, syntax, startDate, endDate, nowDate } = args;

  try {
    const response = await client.submitBackgroundQuery({
      query,
      syntax,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(nowDate && { nowDate })
    });

    let result = `Background query submitted successfully!\n\n`;
    result += `Query ID: ${response.queryId}\n`;
    result += `Use this ID to check status and retrieve results.\n\n`;

    if (response.warnings && response.warnings.length > 0) {
      result += `Warnings:\n`;
      response.warnings.forEach((warning: any, index: number) => {
        result += `${index + 1}. ${formatWarning(warning)}\n`;
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to submit background query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetBackgroundQueryStatus(client: any, args: any): Promise<string> {
  const { queryId } = args;

  try {
    const response = await client.getBackgroundQueryStatus({ queryId });

    let result = `Background Query Status\n`;
    result += `Query ID: ${queryId}\n`;
    result += `Submitted: ${response.submittedAt}\n\n`;

    if (response.running) {
      result += `Status: RUNNING\n`;
      result += `Running since: ${response.running.runningSince}\n`;
    } else if (response.terminated) {
      result += `Status: TERMINATED\n`;
      result += `Running since: ${response.terminated.runningSince}\n`;
      result += `Terminated at: ${response.terminated.terminatedAt}\n`;

      if (response.terminated.success) {
        result += `Result: SUCCESS - Query completed successfully\n`;
      } else if (response.terminated.error) {
        if (response.terminated.error.failed) {
          result += `Result: FAILED - ${response.terminated.error.failed.reason}\n`;
        } else if (response.terminated.error.cancelled) {
          result += `Result: CANCELLED\n`;
        } else if (response.terminated.error.timedOut) {
          result += `Result: TIMED OUT\n`;
        }
      }
    } else if (response.waitingForExecution) {
      result += `Status: WAITING FOR EXECUTION\n`;
    }

    if (response.metadata && response.metadata.length > 0) {
      result += `\nStatistics:\n`;
      response.metadata.forEach((meta: any) => {
        if (meta.statistics) {
          result += `Bytes scanned: ${meta.statistics.bytesScanned}\n`;
        }
      });
    }

    if (response.warnings && response.warnings.length > 0) {
      result += `\nWarnings:\n`;
      response.warnings.forEach((warning: any, index: number) => {
        result += `${index + 1}. ${formatWarning(warning)}\n`;
      });
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get background query status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetBackgroundQueryData(client: any, args: any): Promise<string> {
  const { queryId } = args;

  try {
    const response = await client.getBackgroundQueryData({ queryId });

    if (!response.response?.results) {
      return `No data available for query ID: ${queryId}\nThe query may still be running or may have failed.`;
    }

    return formatQueryResults(response.response.results, 'Background Query');
  } catch (error) {
    throw new Error(`Failed to get background query data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCancelBackgroundQuery(client: any, args: any): Promise<string> {
  const { queryId } = args;

  try {
    await client.cancelBackgroundQuery({ queryId });
    return `Background query ${queryId} has been cancelled successfully.`;
  } catch (error) {
    throw new Error(`Failed to cancel background query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function formatQueryResponse(responses: any, queryType: string): string {
  let result = `${queryType} Query Results\n`;
  result += `=`.repeat(queryType.length + 14) + '\n\n';

  // Handle different response structures
  if (!Array.isArray(responses)) {
    // If responses is not an array, try to handle it as a single response
    if ((responses as any).result) {
      result += formatQueryResults((responses as any).result, queryType);
    } else if ((responses as any).results) {
      result += formatQueryResults(responses as any, queryType);
    } else {
      result += `Unexpected response structure: ${JSON.stringify(responses)}\n`;
    }
    return result;
  }

  for (const response of responses) {
    if (response.queryId) {
      result += `Query ID: ${response.queryId.queryId}\n\n`;
    }

    if (response.error) {
      result += `❌ Error: ${response.error.message}\n`;
      if (response.error.code?.rateLimitReached) {
        result += `Rate limit reached. Please wait before making more requests.\n`;
      }
      continue;
    }

    if (response.warning) {
      result += `⚠️  Warning: ${formatWarning(response.warning)}\n\n`;
    }

    if (response.result) {
      result += formatQueryResults(response.result, queryType);
    }
  }

  return result;
}

function formatQueryResults(result: any, queryType: string): string {
  let output = `📊 Results (${result.results.length} records):\n\n`;

  if (result.results.length === 0) {
    output += `No results found.\n`;
    return output;
  }

  result.results.forEach((record: any, index: number) => {
    output += `Record ${index + 1}:\n`;
    
    // Format metadata
    if (record.metadata && record.metadata.length > 0) {
      output += `  Metadata:\n`;
      record.metadata.forEach((meta: any) => {
        output += `    ${meta.key}: ${meta.value}\n`;
      });
    }

    // Format labels
    if (record.labels && record.labels.length > 0) {
      output += `  Labels:\n`;
      record.labels.forEach((label: any) => {
        output += `    ${label.key}: ${label.value}\n`;
      });
    }

    // Format user data (try to parse as JSON for better formatting)
    if (record.userData) {
      output += `  Data:\n`;
      try {
        const parsedData = JSON.parse(record.userData);
        output += `    ${JSON.stringify(parsedData, null, 4).replace(/^/gm, '    ')}\n`;
      } catch {
        output += `    ${record.userData}\n`;
      }
    }

    output += `\n`;
  });

  return output;
}

function formatWarning(warning: any): string {
  if (warning.compileWarning) {
    return `Compile Warning: ${warning.compileWarning.warningMessage}`;
  }
  if (warning.timeRangeWarning) {
    return `Time Range Warning: ${warning.timeRangeWarning.warningMessage}`;
  }
  if (warning.numberOfResultsLimitWarning) {
    return `Results Limit Warning: Limited to ${warning.numberOfResultsLimitWarning.numberOfResultsLimit} results`;
  }
  if (warning.bytesScannedLimitWarning) {
    return `Bytes Scanned Limit Warning: Reached bytes scanning limit`;
  }
  if (warning.deprecationWarning) {
    return `Deprecation Warning: ${warning.deprecationWarning.warningMessage}`;
  }
  if (warning.blocksLimitWarning) {
    return `Blocks Limit Warning: Reached maximum number of parquet blocks`;
  }
  if (warning.aggregationBucketsLimitWarning) {
    return `Aggregation Buckets Limit Warning: Limited to ${warning.aggregationBucketsLimitWarning.aggregationBucketsLimit} buckets`;
  }
  if (warning.archiveWarning) {
    if (warning.archiveWarning.noMetastoreData) {
      return `Archive Warning: No metastore data available`;
    }
    if (warning.archiveWarning.bucketAccessDenied) {
      return `Archive Warning: Bucket access denied`;
    }
    if (warning.archiveWarning.bucketReadFailed) {
      return `Archive Warning: Bucket read failed`;
    }
    if (warning.archiveWarning.missingData) {
      return `Archive Warning: Missing data`;
    }
  }
  if (warning.scrollTimeoutWarning) {
    return `Scroll Timeout Warning: OpenSearch scroll timeout reached`;
  }
  if (warning.fieldCountLimitWarning) {
    return `Field Count Limit Warning: Number of fields truncated`;
  }
  if (warning.shuffleFileSizeLimitReachedWarning) {
    return `Shuffle File Size Limit Warning: Limit reached during join operation`;
  }
  if (warning.filesReadLimitWarning) {
    return `Files Read Limit Warning: Maximum number of parquet files reached`;
  }
  if (warning.sidebarFilterCardinalityLimitWarning) {
    return `Sidebar Filter Cardinality Warning: Fields ${warning.sidebarFilterCardinalityLimitWarning.fields.join(', ')} reached cardinality limit of ${warning.sidebarFilterCardinalityLimitWarning.cardinalityLimit}`;
  }

  return 'Unknown warning type';
} 