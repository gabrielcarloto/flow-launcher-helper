import { test } from 'mocha';
import { spy, assert } from 'sinon';
import { expect } from 'chai';

import { Flow } from '../index';
import { DEFAULT_REQUEST, mockArgv, RequestObject } from './mock';

type Methods = unknown;

describe('Methods and params', () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
  });

  const testMethod = (mock: RequestObject) => {
    mockArgv(mock);
    const callback = spy();
    const { method, params, on, run } = new Flow<Methods>();

    on(mock.method, callback);
    run();

    expect(method).to.be.equal(mock.method);
    expect(run).to.not.throw();

    if (Array.isArray(params)) {
      expect(params).to.have.deep.members(mock.parameters);
      expect(callback.args[0][0]).to.have.deep.members(mock.parameters);
    } else {
      expect(params).to.be.equal(mock.parameters[0]);
      expect(callback.args[0][0]).to.be.equal(mock.parameters[0]);
    }
  };

  describe('`params` and `method` should be equal to the ones passed in argv', () => {
    test('when the passed parameter is just a string', () => {
      const mock = {
        method: 'just_testing_method',
        parameters: ['just_testing_params'],
      };

      testMethod(mock);
    });

    test('when the passed parameter is just a boolean', () => {
      const mock = {
        method: 'just_testing_method',
        parameters: [true],
      };

      testMethod(mock);
    });

    test('when the passed parameter is just a number', () => {
      const mock = {
        method: 'just_testing_method',
        parameters: [42],
      };

      testMethod(mock);
    });

    test('when the passed parameter is an object', () => {
      const mock = {
        method: 'just_testing_method',
        parameters: [{ testing: 'object', object: { test: 42 } }],
      };

      testMethod(mock);
    });

    test('with more then one parameter', () => {
      const mock = {
        method: 'just_testing_method',
        parameters: [
          'string',
          42,
          { testing: 'object', object: { test: 42 } },
          [85, 36, 42],
        ],
      };

      testMethod(mock);
    });
  });

  it('should call the callback function once', () => {
    mockArgv(DEFAULT_REQUEST);
    const { on, run } = new Flow();

    const callback = spy();
    on(DEFAULT_REQUEST.method, callback);

    run();
    expect(callback.calledOnce).to.be.true;
  });

  it('should throw an error when the requested method does not exist', () => {
    mockArgv({ method: 'i_dont_exist', parameters: [''] });
    const { on, run } = new Flow();
    const callback = spy();

    on('query', callback);

    assert.notCalled(callback);
    expect(run).to.throw();
  });
});
