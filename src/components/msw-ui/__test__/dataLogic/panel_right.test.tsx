import { getResetHandlers } from '@/components/msw-ui/handlesFnc';
import { IGroupDataItem, mswReqType } from '@/components/msw-ui/handlesType';
import { testPanelLeftGroupDataInit } from '@/components/msw-ui/__test__/dataLogic/utils';
import axios from 'axios';
import { setupServer } from 'msw/node';
import { HandlerMock } from '../../handles';

const mockJson = require('../utils/unhandleRequest.json');

const server = setupServer();

jest.mock('../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
    setItem: () => '',
  };
});

describe('test mock panel-right', () => {
  let handlerMock: HandlerMock = null;
  let mockResetHandlers: any;
  let mockSaveRequestHandlers: any;
  beforeEach(() => {
    mockResetHandlers = jest.fn();
    mockSaveRequestHandlers = jest.fn();
    HandlerMock.prototype.resetHandlers = mockResetHandlers;
    HandlerMock.prototype.saveRequestGroup = mockSaveRequestHandlers;
    handlerMock = new HandlerMock('msw-ui');
  });
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('测试保存mock', async () => {
    const newRequestData = {
      type: 'basic',
      group: 'group',
      status: '200',
      collection: 'module',
      name: 'request1',
      disabled: false,
      request: {
        url: new URL('http://localhost:8002/getComputerList'),
        method: 'get',
        responseJson: { code: 0, id: 'test' },
      } as mswReqType,
      delay: '0',
    } as IGroupDataItem;
    handlerMock.addSimpleMock(newRequestData);
    expect(handlerMock.groupRequest.collection[0].name).toBe('module');
    expect(handlerMock.groupRequest.collection[0].data.group.data[0].name).toBe('request1');
    expect(mockResetHandlers).toBeCalledTimes(1);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
    server.resetHandlers(...getResetHandlers(handlerMock.groupRequest));
    await expect(
      axios.get('http://localhost:8002/getComputerList').then((res) => res.data),
    ).resolves.toEqual({ code: 0, id: 'test' });
  });
  test('测试移出请求', () => {
    testPanelLeftGroupDataInit(handlerMock);
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    handlerMock.moveOutFromHandledTable(request);
    expect(request.disabled).toBeTruthy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('清空拦截池', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.handleTableTab = 'handled';
    handlerMock.clearTableList();
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    expect(request.disabled).toBeTruthy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('批量暂停拦截池', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.handleTableTab = 'handled';
    handlerMock.batchChangeTableList('disabled');
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    expect(request.disabled).toBeTruthy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('批量启动拦截池', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.handleTableTab = 'handled';
    handlerMock.batchChangeTableList('active');
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    expect(request.disabled).toBeFalsy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试导入数据', () => {
    handlerMock.importGroupData(JSON.stringify(mockJson));
    const collection = handlerMock.groupRequest.collection[0].name;
    expect(collection).toBe('module');
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    expect(request.group).toBe('group');
    expect(mockResetHandlers).toBeCalledTimes(1);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('切换tab', () => {
    handlerMock.changeHandleTabTab('unHandle');
    expect(handlerMock.handleTableTab).toBe('unHandle');
    handlerMock.changeHandleTabTab('handled');
    expect(handlerMock.handleTableTab).toBe('handled');
  });
  test('设置当前的mock request', () => {
    testPanelLeftGroupDataInit(handlerMock);
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    handlerMock.setCurrentEditGroupRequest(request);
    expect(handlerMock.currentEditGroupRequest.name).toBe('list');
    expect(handlerMock.currentHostSwitch).toBeFalsy();
    expect(handlerMock.showConflictDetail).toBeFalsy();
  });
});
