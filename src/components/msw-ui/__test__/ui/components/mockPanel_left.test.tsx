import '@testing-library/jest-dom';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import { MockPanel } from '../../../component/mockPanel';
import { HandlerMock } from '../../../handles';
import { testPanelLeftGroupDataInit } from '../../dataLogic/utils';

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
  let handlerMock: HandlerMock = null;
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
    handlerMock = new HandlerMock('msw-ui');
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
    initLeftModule(handlerMock);
    userEvent.click(screen.getByText('修改名称'));
    fireEvent.change(screen.getByPlaceholderText('请输入名称'), {
      target: {
        value: 'module2',
      },
    });
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(handlerMock.groupRequest.collection[0].name).toBe('module2');
  });
  test('测试删除模块', () => {
    initLeftModule(handlerMock);
    userEvent.click(screen.getByText('删除'));
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(handlerMock.groupRequest.collection.length).toBe(0);
  });
  test('复制模块', () => {
    initLeftModule(handlerMock);
    userEvent.click(screen.getByText('复制'));
    fireEvent.change(screen.getByPlaceholderText('请输入名称'), {
      target: {
        value: 'module_copy',
      },
    });
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(handlerMock.groupRequest.collection[1].name).toBe('module_copy');
    const dot = result.container.querySelector('[title=module_copy]>span.msw_dot');
    expect(dot).toHaveStyle('background: rgb(240, 64, 66)');
  });
  test('测试关闭/开启模块', () => {
    initLeftModule(handlerMock);
    userEvent.click(screen.getByText('全部关闭'));
    const dotClose = result.container.querySelector('[title=module]>span.msw_dot');
    expect(dotClose).toHaveStyle('background: rgb(240, 64, 66)');

    userEvent.click(screen.getByText('全部开启'));
    const dot = result.container.querySelector('[title=module]>span.msw_dot');
    expect(dot).toHaveStyle('background: rgb(66, 173, 0)');
  });

  test('测试修改组名称', async () => {
    initLeftGroup(handlerMock);
    userEvent.click(
      result.container.querySelectorAll(
        '[data-testid=msw_content_left_groupItem] .msw_menu_item',
      )[0],
    );
    fireEvent.change(screen.getByPlaceholderText('请输入名称'), {
      target: {
        value: 'group_copy',
      },
    });
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(Object.keys(handlerMock.groupRequest.collection[0].data)).toContain('group_copy');
  });
  test('测试删除组', () => {
    initLeftGroup(handlerMock);
    userEvent.click(
      result.container.querySelectorAll(
        '[data-testid=msw_content_left_groupItem] .msw_menu_item',
      )[3],
    );
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(Object.keys(handlerMock.groupRequest.collection[0].data).length).toBe(0);
  });
  test('测试复制组', () => {
    initLeftGroup(handlerMock);
    userEvent.click(
      result.container.querySelectorAll(
        '[data-testid=msw_content_left_groupItem] .msw_menu_item',
      )[4],
    );
    fireEvent.change(screen.getByPlaceholderText('请输入名称'), {
      target: {
        value: 'group_copy',
      },
    });
    userEvent.click(screen.getByTestId('msw_modal_ok_btn'));
    expect(handlerMock.groupRequest.collection[0].data).toHaveProperty('group_copy');
    const dot = result.container.querySelector('[title=group_copy]>span.msw_dot');
    expect(dot).toHaveStyle('background: rgb(240, 64, 66)');
  });
  test('测试关闭/开启组', () => {
    initLeftGroup(handlerMock);
    userEvent.click(
      result.container.querySelectorAll(
        '[data-testid=msw_content_left_groupItem] .msw_menu_item',
      )[2],
    );
    const dotClose = result.container.querySelector('[title=group]>span.msw_dot');
    expect(dotClose).toHaveStyle('background: rgb(240, 64, 66)');
    userEvent.click(
      result.container.querySelectorAll(
        '[data-testid=msw_content_left_groupItem] .msw_menu_item',
      )[1],
    );
    const dot = result.container.querySelector('[title=group]>span.msw_dot');
    expect(dot).toHaveStyle('background: rgb(66, 173, 0)');
  });
  test('测试开启/关闭request', () => {
    initLeftRequest(handlerMock);
    const requestItem = result.queryByRole('msw_left_request_item');
    const menuList = requestItem.querySelectorAll('.msw_menu_item');
    userEvent.click(menuList[0]);
    const dot = requestItem.querySelector('.msw_dot');
    expect(dot).toHaveStyle('background: rgb(66, 173, 0)');
    userEvent.click(menuList[1]);
    expect(dot).toHaveStyle('background: rgb(240, 64, 66)');
  });
  test('测试删除request', () => {
    initLeftRequest(handlerMock);
    const requestItem = result.queryByRole('msw_left_request_item');
    const menuList = requestItem.querySelectorAll('.msw_menu_item');
    userEvent.click(menuList[2]);
    userEvent.click(result.container.querySelector('.msw_modal_inner .msw_modal_ok_btn'));
    expect(handlerMock.groupRequest.collection[0].data.group.data.length).toBe(0);
  });
});

function initLeftModule(handlerMock: HandlerMock) {
  testPanelLeftGroupDataInit(handlerMock);
  const leftItem = screen.getAllByTestId('msw_content_left_moduleItem')[0];
  userEvent.hover(leftItem);
  const moreIconWrap = screen.getAllByTestId('msw_content_left_moduleItem_moreIcon')[0];
  userEvent.click(moreIconWrap);
}

function initLeftGroup(handlerMock: HandlerMock) {
  testPanelLeftGroupDataInit(handlerMock);
  userEvent.click(screen.getByText('module'));
  const leftItem = screen.getAllByTestId('msw_content_left_groupItem')[0];
  userEvent.hover(leftItem);
  const moreIconWrap = screen.getAllByTestId('msw_content_left_groupItem_moreIcon')[0];
  userEvent.click(moreIconWrap);
}

function initLeftRequest(handlerMock: HandlerMock) {
  testPanelLeftGroupDataInit(handlerMock);
  userEvent.click(screen.getByText('module'));
  userEvent.click(screen.getByText('group'));
  const leftItem = screen.getByRole('msw_left_request_item');
  userEvent.hover(leftItem);
  const moreIconWrap = screen.getByRole('msw_left_request_item_moreIcon');
  userEvent.click(moreIconWrap);
}
