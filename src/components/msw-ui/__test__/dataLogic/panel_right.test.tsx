import { HandlerMock, handlerMock as handlerMockInstance } from '../../handles';
import { IGroupDataItem, mswReqType } from '@/components/msw-ui/handlesType';

jest.mock('../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
    setItem: () => '',
  };
});

describe('test mock panel-right', () => {
  let handlerMock: typeof handlerMockInstance = null;
  let mockResetHandlers: any;
  let mockSaveRequestHandlers: any;
  beforeEach(() => {
    mockResetHandlers = jest.fn();
    mockSaveRequestHandlers = jest.fn();
    HandlerMock.prototype.resetHandlers = mockResetHandlers;
    HandlerMock.prototype.saveRequestGroup = mockSaveRequestHandlers;
    handlerMock = new HandlerMock();
  });

  test('测试保存mock', () => {
    const newRequestData = {
      type: 'basic',
      group: 'group',
      status: '200',
      collection: 'module',
      name: 'request1',
      disabled: true,
      request: {
        url: new URL('http://localhost:8002/getComputerList'),
        responseJson: "{code: 0, id: 'test'}",
      } as mswReqType,
      delay: '0',
    } as IGroupDataItem;
    handlerMock.addSimpleMock(newRequestData);
    expect(handlerMock.groupRequest.collection[0].name).toBe('module');
    expect(handlerMock.groupRequest.collection[0].data.group.data[0].name).toBe('request1');
    expect(mockResetHandlers).toBeCalledTimes(1);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
});
