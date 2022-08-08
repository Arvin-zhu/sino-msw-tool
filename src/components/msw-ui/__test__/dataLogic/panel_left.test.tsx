import { toJS } from 'mobx';
import { HandlerMock, handlerMock as handlerMockInstance } from '../../handles';
import { isEqual } from 'lodash';

jest.mock('../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
    setItem: () => '',
  };
});

describe('test mock detail', () => {
  let handlerMock: typeof handlerMockInstance = null;
  beforeEach(() => {
    handlerMock = new HandlerMock();
    console.log(toJS(handlerMock.groupRequest.collection));
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
  });
  test('测试删除模块', async () => {
    handlerMock.addCollection('test');
    handlerMock.deleteCollection('test');
    expect(handlerMock.groupRequest.collection.length).toBe(0);
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
    expect(
      isEqual(
        handlerMock.groupRequest.collection[0].data,
        handlerMock.groupRequest.collection[1].data,
      ),
    ).toBe(true);
  });
});
