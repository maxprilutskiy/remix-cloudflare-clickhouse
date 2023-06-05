import type { LoaderFunction } from '@remix-run/cloudflare';

export const loader: LoaderFunction = async (args) => {
  try {
    // TODO
    // - send request to clickhouse.com
    // - send request to doublecloud
    // - return the result of both requests

    const query = `
        INSERT INTO content_tracking_view (
          timestamp,
  
          workspace_id,
  
          document_id,
          document_platform,
  
          session_id,
  
          viewer_id,
          viewer_new
        )
        SETTINGS
          async_insert = 1,
          wait_for_async_insert = 0
        VALUES (
          now(),
          'workspace_123',
          'document_123',
          'notion',
          'session_123',
          'viewer_123',
          false
        )
        ;
      `;

    const clickhouseComClient = new ClickhouseClient({
      url: args.context.CLICKHOUSECOM_URL as string,
      username: args.context.CLICKHOUSECOM_USER as string,
      password: args.context.CLICKHOUSECOM_PASSWORD as string,
    });

    const doublecloudClient = new ClickhouseClient({
      url: args.context.DOUBLECLOUD_URL as string,
      username: args.context.DOUBLECLOUD_USER as string,
      password: args.context.DOUBLECLOUD_PASSWORD as string,
    });

    console.log('sending queries to clickhouse.com and doublecloud');
    const [clickhouseComResponse, doublecloudResponse] = await Promise.all([
      clickhouseComClient.tryExec(query),
      doublecloudClient.tryExec(query)
    ]);
    console.log('done');

    const result = {
      clickhouseComResponse,
      doublecloudResponse,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
};

class ClickhouseClient {
  constructor(private options: ClickhouseClientOptions) {
    if (!options.url) {
      throw new Error('url is required');
    }
    if (!options.username) {
      throw new Error('username is required');
    }
    if (!options.password) {
      throw new Error('password is required');
    }
  }

  async exec(query: string) {
    const response = await fetch(this.options.url, {
      method: 'POST',
      body: query,
      headers: {
        'Authorization': `Basic ${btoa(`${this.options.username}:${this.options.password}`)}`,
        'Content-Type': 'text/plain',
      },
    });

    if (response.status !== 200) {
      const error = await response.text();
      throw new Error(error);
    }

    const contentType = response.headers.get('Content-Type')?.split(';')[0];
    switch (contentType) {
      case 'application/json':
        return await response.json();
      default:
        return await response.text();
    }
  }

  async tryExec(query: string) {
    let response = null;
    let error = null;
    try {
      response = await this.exec(query);
    } catch (error) {
      error = error;
    } finally {
      return {
        response,
        error,
      };
    }
  }
}

type ClickhouseClientOptions = {
  url: string;
  username: string;
  password: string;
}