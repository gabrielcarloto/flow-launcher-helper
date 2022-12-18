import rewire from 'rewire';
import { expect } from 'chai';
import { spy, assert } from 'sinon';

import { DEFAULT_REQUEST, mockRequest, RequestObject } from './mock';
import {
  IFlowPrivate,
  JSONRPCResponse,
  Parameters,
  ParametersAllowedTypes,
  Result,
} from '../types';

interface TestParamsArgs {
  request: RequestObject;
  expected: Parameters | ParametersAllowedTypes;
}

type TRewiredFlow = IFlowPrivate<unknown, unknown>;

describe('Flow Launcher Helper', () => {
  let rewiredModule: ReturnType<typeof rewire>, RewiredFlow: any;

  beforeEach(() => {
    rewiredModule = rewire('../index');
    RewiredFlow = rewiredModule.__get__('Flow');
  });

  it('should return the correct parameters', () => {
    const testParams = ({ request, expected }: TestParamsArgs) => {
      mockRequest(request, rewiredModule);
      const flow: TRewiredFlow = new RewiredFlow();
      const callback = spy();

      flow.on(request.method, callback);
      flow.run();

      const params = callback.args[0][0];

      expect(params).to.eql(expected);
    };

    const testCases: Array<TestParamsArgs> = [
      {
        request: { method: 'query', parameters: ['param1'] },
        expected: 'param1',
      },
      { request: { method: 'query', parameters: [10] }, expected: 10 },
      { request: { method: 'query', parameters: [true] }, expected: true },
      {
        request: {
          method: 'another_method',
          parameters: [
            42,
            { param: 'test', another: ['test', 'param1'] },
            'param2',
          ],
        },
        expected: [
          42,
          { param: 'test', another: ['test', 'param1'] },
          'param2',
        ],
      },
    ];

    testCases.forEach((testCase) => testParams(testCase));
  });

  it('should call the callback function once', () => {
    mockRequest(DEFAULT_REQUEST, rewiredModule);
    const flow: TRewiredFlow = new RewiredFlow();
    const callback = spy();

    flow.on(DEFAULT_REQUEST.method, callback);
    flow.run();

    expect(callback.calledOnce).to.be.true;
  });

  it('should throw an error when the requested method does not exist', () => {
    mockRequest(
      {
        method: 'i_dont_exist',
        parameters: [''],
      },
      rewiredModule,
    );

    const flow: TRewiredFlow = new RewiredFlow();
    const callback = spy();

    flow.on('query', callback);

    assert.notCalled(callback);
    expect(flow.run).to.throw();
  });

  it('should create the correct result object', () => {
    mockRequest(DEFAULT_REQUEST, rewiredModule);
    const flow: TRewiredFlow = new RewiredFlow();

    const response: JSONRPCResponse<unknown> = {
      title: 'Testing Title',
      subtitle: 'Testing Subtitle',
      method: 'Flow.Launcher.ChangeQuery',
      iconPath: 'path/to/icon',
      params: ['Testing Param'],
      dontHideAfterAction: true,
      score: 50,
    };

    const expected: Result<unknown> = {
      Title: 'Testing Title',
      Subtitle: 'Testing Subtitle',
      JsonRPCAction: {
        method: 'Flow.Launcher.ChangeQuery',
        parameters: ['Testing Param'],
        dontHideAfterAction: true,
      },
      IcoPath: 'path/to/icon',
      score: 50,
    };

    const result = flow.createResultObject(response);

    expect(result).to.eql(expected);
  });
});
