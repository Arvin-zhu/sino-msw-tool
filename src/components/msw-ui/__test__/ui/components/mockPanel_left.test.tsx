import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import { Provider } from 'mobx-react';
import { HandlerMock, handlerMock as handlerMockInstance } from '../../../handles';
import { MockPanel } from '../../../component/mockPanel';
import React from 'react';
import '@testing-library/jest-dom';
import { testPanelLeftGroupDataInit } from '@/components/msw-ui/__test__/dataLogic/utils';
import userEvent from '@testing-library/user-event';
import { configure } from 'mobx';

configure({
  enforceActions: 'never',
});

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

jest.mock('../../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
    setItem: () => '',
  };
});

describe('test mock detail', () => {
  let handlerMock: typeof handlerMockInstance = null;
  let mockResetHandlers: any;
  let mockSaveRequestHandlers: any;
  let mockAddCollection: any;
  const env = process.env;
  let result: RenderResult;
  beforeEach(() => {
    mockResetHandlers = jest.fn();
    mockSaveRequestHandlers = jest.fn();
    mockAddCollection = jest.fn();
    mockAddCollection.mockResolvedValue({ status: true, msg: '' });
    HandlerMock.prototype.resetHandlers = mockResetHandlers;
    HandlerMock.prototype.addCollection = mockAddCollection;
    HandlerMock.prototype.saveRequestGroup = mockSaveRequestHandlers;
    handlerMock = new HandlerMock();
    process.env = { ...env };
    (process.env as any).NODE_ENV = 'development';
    result = render(
      <Provider store={handlerMock}>
        <MockPanel />
      </Provider>,
    );
    const circle_logo = screen.getByTestId('msw_circle');
    userEvent.click(circle_logo);
  });
  afterEach(() => {
    jest.resetModules();
  });
  test('测试增加模块', async () => {
    fireEvent.click(result.container.querySelector('.msw_add_btn'));
    fireEvent.change(screen.getByPlaceholderText('请输入模块名称'), {
      target: {
        value: 'test',
      },
    });
    fireEvent.click(result.container.querySelector('.msw_confirm_ok_btn'));
    expect(mockAddCollection).toBeCalledTimes(1);
  });
  test('测试修改模块名称', async () => {
    testPanelLeftGroupDataInit(handlerMock);
    const leftItem = screen.getAllByTestId('msw_content_left_moduleItem')[0];
    userEvent.hover(leftItem);
    const moreIconWrap = screen.getAllByTestId('msw_content_left_moduleItem_moreIcon')[0];
    userEvent.click(moreIconWrap);
    userEvent.click(screen.getByText('修改名称'));
    fireEvent.change(screen.getByPlaceholderText('请输入名称'), {
      target: {
        value: 'module2',
      },
    });
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(handlerMock.groupRequest.collection[0].name).toBe('module2');
  });
});
