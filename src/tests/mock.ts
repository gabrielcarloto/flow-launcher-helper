import { Result, FlowParameters } from '../types';
import rewire from 'rewire';

export const DEFAULT_REQUEST = {
  method: 'query',
  parameters: [''],
} as RequestObject;

export interface RequestObject {
  method: string;
  parameters: FlowParameters;
  settings?: Record<string, string | number | boolean>;
}

export function mockRequest(
  requestObject: RequestObject,
  rewiredModule: ReturnType<typeof rewire>,
) {
  const mock = JSON.stringify(requestObject);
  rewiredModule.__set__({ process: { argv: ['-', '-', mock] } });
}

export function simulateFlowLauncherRequest(
  response: string | null,
): RequestObject {
  if (!response) return DEFAULT_REQUEST;

  const {
    result: {
      JsonRPCAction: { method, parameters },
    },
  } = JSON.parse(response) as { result: Result<unknown> };

  if (method == 'test_method') return { method, parameters };

  return DEFAULT_REQUEST;
}
