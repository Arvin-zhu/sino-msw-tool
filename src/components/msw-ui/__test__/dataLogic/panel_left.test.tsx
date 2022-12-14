import { testPanelLeftGroupDataInit } from '@/components/msw-ui/__test__/dataLogic/utils';
import { HandlerMock } from '../../handles';

jest.mock('../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
    setItem: () => '',
  };
});

describe('test mock panel-left', () => {
  let handlerMock: HandlerMock = null;
  let mockResetHandlers: any;
  let mockSaveRequestHandlers: any;
  beforeEach(() => {
    mockResetHandlers = jest.fn();
    mockSaveRequestHandlers = jest.fn();
    HandlerMock.prototype.resetHandlers = mockResetHandlers;
    HandlerMock.prototype.saveRequestGroup = mockSaveRequestHandlers;
    handlerMock = new HandlerMock('mock-ui');
  });
  test('测试增加模块', () => {
    handlerMock.addCollection('test');
    expect(handlerMock.groupRequest.collection[0].name).toBe('test');
  });
  test('测试修改模块名称', async () => {
    handlerMock.addCollection('test');
    handlerMock.saveEditName(
      {
        level: 'collection',
        collectionName: 'test',
      },
      'testNew',
    );
    expect(handlerMock.groupRequest.collection[0].name).toBe('testNew');
    expect(mockResetHandlers).toBeCalledTimes(1);
    expect(mockSaveRequestHandlers).toBeCalledTimes(2);
  });
  test('测试删除模块', async () => {
    handlerMock.addCollection('test');
    handlerMock.deleteCollection('test');
    expect(handlerMock.groupRequest.collection.length).toBe(0);
    expect(mockResetHandlers).toBeCalledTimes(1);
    expect(mockSaveRequestHandlers).toBeCalledTimes(2);
  });
  test('测试复制模块', async () => {
    handlerMock.addCollection('test');
    handlerMock.saveCopy(
      {
        level: 'collection',
        collectionName: 'test',
      },
      'test',
    );
    expect(handlerMock.groupRequest.collection[0].data).toEqual(
      handlerMock.groupRequest.collection[1].data,
    );
    expect(mockResetHandlers).toBeCalledTimes(1);
    expect(mockSaveRequestHandlers).toBeCalledTimes(2);
  });
  test('测试开启模块', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.changeCollectionStatus('module', true);
    const collection = handlerMock.groupRequest.collection.find(
      (collection) => collection.name === 'module',
    );
    let hasDisabled = false;
    Object.keys(collection.data).forEach((groupKey) => {
      const group = collection.data[groupKey];
      group.data.forEach((request) => {
        if (request.disabled) {
          hasDisabled = true;
        }
      });
    });
    expect(hasDisabled).toBeFalsy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试关闭模块', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.changeCollectionStatus('module', false);
    const collection = handlerMock.groupRequest.collection.find(
      (collection) => collection.name === 'module',
    );
    let hasEnable = false;
    Object.keys(collection.data).forEach((groupKey) => {
      const group = collection.data[groupKey];
      group.data.forEach((request) => {
        if (!request.disabled) {
          hasEnable = true;
        }
      });
    });
    expect(hasEnable).toBeFalsy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });

  test('测试修改组名称', () => {
    //载入数据
    testPanelLeftGroupDataInit(handlerMock);
    //修改第一项名称
    handlerMock.saveEditName(
      { level: 'group', collectionName: 'module', groupName: 'group' },
      'group2',
    );
    expect(handlerMock.groupRequest.collection[0].data.hasOwnProperty('group2')).toBe(true);
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试删除组', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.deleteGroup('module', 'group');
    expect(handlerMock.groupRequest.collection[0].data.hasOwnProperty('group')).toBe(false);
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试复制组', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.saveCopy(
      { level: 'group', collectionName: 'module', groupName: 'group' },
      'group2',
    );
    expect(handlerMock.groupRequest.collection[0].data.hasOwnProperty('group2')).toBe(true);
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试开启组', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.activeGroup('module', 'group', true);
    const collection = handlerMock.groupRequest.collection.find(
      (collection) => collection.name === 'module',
    );
    let haveDisabled = false;
    Object.keys(collection.data).forEach((group) => {
      collection.data[group].data.forEach((request) => {
        if (request.disabled) {
          haveDisabled = true;
        }
      });
    });
    expect(haveDisabled).toBeFalsy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试关闭组', () => {
    testPanelLeftGroupDataInit(handlerMock);
    handlerMock.activeGroup('module', 'group', false);
    const collection = handlerMock.groupRequest.collection.find(
      (collection) => collection.name === 'module',
    );
    let haveEnable = false;
    Object.keys(collection.data).forEach((group) => {
      collection.data[group].data.forEach((request) => {
        if (!request.disabled) {
          haveEnable = true;
        }
      });
    });
    expect(haveEnable).toBeFalsy();
    expect(mockResetHandlers).toBeCalledTimes(2);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试request开启', () => {
    testPanelLeftGroupDataInit(handlerMock);
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    handlerMock.changeGroupItemStatus(request, true);
    expect(request.disabled).toBeFalsy();
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试request关闭', () => {
    testPanelLeftGroupDataInit(handlerMock);
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    handlerMock.changeGroupItemStatus(request, false);
    expect(request.disabled).toBeTruthy();
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
  test('测试request删除', () => {
    testPanelLeftGroupDataInit(handlerMock);
    const request = handlerMock.groupRequest.collection[0].data.group.data[0];
    handlerMock.deleteGroupItem(request);
    expect(handlerMock.groupRequest.collection[0].data.group.data.length).toBe(0);
    expect(mockSaveRequestHandlers).toBeCalledTimes(1);
  });
});
