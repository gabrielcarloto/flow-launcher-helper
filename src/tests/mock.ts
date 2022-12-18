import { Result, Parameters } from '../index';

export const DEFAULT_REQUEST = {
  method: 'query',
  parameters: [''],
} as RequestObject;

export interface RequestObject {
  method: string;
  parameters: Parameters;
}

export function mockArgv(requestObject: RequestObject) {
  process.argv[2] = JSON.stringify(requestObject);
  return process.argv;
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
