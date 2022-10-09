import '@testing-library/jest-dom';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import _ from 'lodash';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import { act } from 'react-dom/test-utils';
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
    testPanelLeftGroupDataInit(handlerMock);
  });
  afterEach(() => {
    jest.resetModules();
  });
  test('测试host版面切换', async () => {
    const hostSwitchBtn = screen.getByText('host切换');
    userEvent.click(hostSwitchBtn);
    expect(result.container.querySelector('.msw_hostChange_wrap')).toBeInTheDocument();
    const homeBtn = screen.getByText('首页');
    userEvent.click(homeBtn);
    expect(result.container.querySelector('.msw_hostChange_wrap')).not.toBeInTheDocument();
  });
  test('测试host地址切换', () => {
    const hostSwitchBtn = screen.getByText('host切换');
    userEvent.click(hostSwitchBtn);
    const input = screen.getByPlaceholderText('请输入新的host');
    userEvent.clear(input);
    userEvent.type(input, 'localhost:8005');
    userEvent.click(result.container.querySelector('.msw_hostChange_saveBtn'));
    expect(
      handlerMock.groupRequest.collection[0].data['group'].data[0].request.url.toString(),
    ).toMatch(/localhost:8005/);
  });
  test('拦截池切换', () => {
    const unHandlerBtn = screen.getByText('未拦截');
    const handlerPoolBtn = screen.getByText('拦截池');
    userEvent.click(handlerPoolBtn);
    expect(result.container.querySelector('.msw_handled_batch_options')).toBeInTheDocument();
    userEvent.click(unHandlerBtn);
    expect(result.container.querySelector('.msw_handled_batch_options')).not.toBeInTheDocument();
  });
  test('测试未拦截过滤', () => {
    //设置状态为未拦截
    const unHandlerBtn = screen.getByText('未拦截');
    userEvent.click(unHandlerBtn);
    const request = handlerMock.groupRequest.collection[0].data['group'].data[0];
    handlerMock.changeGroupItemStatus(request, false);
    handlerMock.handleAllRequest.push(request.request);
    const filterInput = screen.getByPlaceholderText('过滤请求');
    userEvent.type(filterInput, 'getFruit');
    expect(result.container.querySelector('tbody')).toBeEmptyDOMElement();
    userEvent.clear(filterInput);
    userEvent.type(filterInput, 'getComputerList');
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
  });
  test('测试点击mock', () => {
    //设置状态为未拦截
    clickMockBtnInit(handlerMock, result);
    expect(result.container.querySelector('.msw_mock_detail_wrap')).toBeInTheDocument();
  });
  test('保存request', async () => {
    clickMockBtnInit(handlerMock, result);
    await act(() => {
      userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    });
    expect(result.container.querySelector('.msw_save_btn_wrap span')).toHaveTextContent(
      '请输入模块名称!',
    );
    const moduleInput = result.container.querySelector('.msw_group_config_module input');
    userEvent.type(moduleInput, 'module2');
    await act(() => {
      userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    });
    expect(result.container.querySelector('.msw_save_btn_wrap span')).toHaveTextContent(
      '请输入分组名称!',
    );
    const groupInput = result.container.querySelector('.msw_group_config_group input');
    userEvent.type(groupInput, 'group2');
    await act(() => {
      userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    });
    expect(result.container.querySelector('.msw_save_btn_wrap span')).toHaveTextContent(
      '请输入请求别名！',
    );
    const aliasInput = result.container.querySelector('.msw_group_config_alias input');
    userEvent.type(aliasInput, 'alias2');
    await act(() => {
      userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    });
    expect(result.container.querySelector('.msw_handle_noRequest')).toBeInTheDocument();
    expect(_.map(handlerMock.groupRequest.collection, _.property('name'))).toContain('module2');
    const module2 = _.find(handlerMock.groupRequest.collection, ['name', 'module2']);
    expect(module2.data).toHaveProperty('group2');
    expect(_.map(module2.data['group2'].data, _.property('name'))).toContain('alias2');
  });
  test('拦截池操作', () => {
    const handlerPoolBtn = screen.getByText('拦截池');
    userEvent.click(handlerPoolBtn);
    const request = handlerMock.groupRequest.collection[0].data['group'].data[0];
    handlerMock.changeGroupItemStatus(request, true);
    //暂停拦截池
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
    userEvent.click(result.container.querySelector('.msw_batch_pause'));
    const trArr = result.container.querySelectorAll('table .msw_dot');
    trArr.forEach((item) => {
      expect(item).toHaveStyle('background: rgb(240, 64, 66)');
    });
    //启动拦截池
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
    userEvent.click(result.container.querySelector('.msw_batch_start'));
    trArr.forEach((item) => {
      expect(item).toHaveStyle('background: rgb(66, 173, 0)');
    });
    //清空拦截池
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
    userEvent.click(screen.getByText('清空'));
    expect(result.container.querySelector('.msw_handle_noRequest')).toBeInTheDocument();
  });
});

function clickMockBtnInit(handlerMock: HandlerMock, result: RenderResult) {
  const unHandlerBtn = screen.getByText('未拦截');
  userEvent.click(unHandlerBtn);
  const request = handlerMock.groupRequest.collection[0].data['group'].data[0];
  handlerMock.changeGroupItemStatus(request, false);
  handlerMock.handleAllRequest.push(request.request);
  userEvent.click(result.container.querySelector('.msw_mock_btn'));
}
