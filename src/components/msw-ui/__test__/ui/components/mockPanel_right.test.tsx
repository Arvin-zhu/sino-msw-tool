import '@testing-library/jest-dom';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import _, { omitBy } from 'lodash';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import { MockPanel } from '../../../component/mockPanel';
import { HandlerMock } from '../../../handles';
import { testPanelLeftGroupDataInit } from '../../dataLogic/utils';
const mockParseJson = require('../../utils/mockParse.json');

configure({
  enforceActions: 'never',
});

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

jest.mock('../../../swaggerParseMock/index.js', () => {
  return {
    parser: () => {
      mockParseJson.paths = omitBy(
        mockParseJson.paths,
        (value, key) => !key.includes('/promote/google/smart/campaign/keyword'),
      );
      return Promise.resolve(mockParseJson);
    },
  };
});

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
  let mockImportData: any;
  const env = process.env;
  let result: RenderResult;
  beforeEach(() => {
    mockResetHandlers = jest.fn();
    mockSaveRequestHandlers = jest.fn();
    mockAddCollection = jest.fn();
    mockImportData = jest.fn();
    mockAddCollection.mockResolvedValue({ status: true, msg: '' });
    HandlerMock.prototype.resetHandlers = mockResetHandlers;
    HandlerMock.prototype.addCollection = mockAddCollection;
    HandlerMock.prototype.saveRequestGroup = mockSaveRequestHandlers;
    HandlerMock.prototype.importGroupData = mockImportData;
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
  test('??????host????????????', async () => {
    const hostSwitchBtn = screen.getByText('host??????');
    userEvent.click(hostSwitchBtn);
    expect(result.container.querySelector('.msw_hostChange_wrap')).toBeInTheDocument();
    const homeBtn = screen.getByText('??????');
    userEvent.click(homeBtn);
    expect(result.container.querySelector('.msw_hostChange_wrap')).not.toBeInTheDocument();
  });
  test('??????host????????????', () => {
    const hostSwitchBtn = screen.getByText('host??????');
    userEvent.click(hostSwitchBtn);
    const input = screen.getByPlaceholderText('???????????????host');
    userEvent.clear(input);
    userEvent.type(input, 'localhost:8005');
    userEvent.click(result.container.querySelector('.msw_hostChange_saveBtn'));
    expect(
      handlerMock.groupRequest.collection[0].data['group'].data[0].request.url.toString(),
    ).toMatch(/localhost:8005/);
  });
  test('???????????????', () => {
    const unHandlerBtn = screen.getByText('?????????');
    const handlerPoolBtn = screen.getByText('?????????');
    userEvent.click(handlerPoolBtn);
    expect(result.container.querySelector('.msw_handled_batch_options')).toBeInTheDocument();
    userEvent.click(unHandlerBtn);
    expect(result.container.querySelector('.msw_handled_batch_options')).not.toBeInTheDocument();
  });
  test('?????????????????????', () => {
    //????????????????????????
    const unHandlerBtn = screen.getByText('?????????');
    userEvent.click(unHandlerBtn);
    const request = handlerMock.groupRequest.collection[0].data['group'].data[0];
    handlerMock.changeGroupItemStatus(request, false);
    handlerMock.handleAllRequest.push(request.request);
    const filterInput = screen.getByPlaceholderText('????????????');
    userEvent.type(filterInput, 'getFruit');
    expect(result.container.querySelector('tbody')).toBeEmptyDOMElement();
    userEvent.clear(filterInput);
    userEvent.type(filterInput, 'getComputerList');
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
  });
  test('????????????mock', () => {
    //????????????????????????
    clickMockBtnInit(handlerMock, result);
    expect(result.container.querySelector('.msw_mock_detail_wrap')).toBeInTheDocument();
  });
  test('??????request', async () => {
    clickMockBtnInit(handlerMock, result);
    userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_save_btn_wrap span')).toHaveTextContent(
        '?????????????????????!',
      );
    });
    const moduleInput = result.container.querySelector('.msw_group_config_module input');
    userEvent.type(moduleInput, 'module2');
    userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_save_btn_wrap span')).toHaveTextContent(
        '?????????????????????!',
      );
    });
    const groupInput = result.container.querySelector('.msw_group_config_group input');
    userEvent.type(groupInput, 'group2');
    userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_save_btn_wrap span')).toHaveTextContent(
        '????????????????????????',
      );
    });

    const aliasInput = result.container.querySelector('.msw_group_config_alias input');
    userEvent.type(aliasInput, 'alias2');
    userEvent.click(result.container.querySelector('.msw_save_btn_wrap button'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_handle_noRequest')).toBeInTheDocument();
      expect(_.map(handlerMock.groupRequest.collection, _.property('name'))).toContain('module2');
      const module2 = _.find(handlerMock.groupRequest.collection, ['name', 'module2']);
      expect(module2.data).toHaveProperty('group2');
      expect(_.map(module2.data['group2'].data, _.property('name'))).toContain('alias2');
    });
  });
  test('???????????????', () => {
    const handlerPoolBtn = screen.getByText('?????????');
    userEvent.click(handlerPoolBtn);
    const request = handlerMock.groupRequest.collection[0].data['group'].data[0];
    handlerMock.changeGroupItemStatus(request, true);
    //???????????????
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
    userEvent.click(result.container.querySelector('.msw_batch_pause'));
    const trArr = result.container.querySelectorAll('table .msw_dot');
    trArr.forEach((item) => {
      expect(item).toHaveStyle('background: rgb(240, 64, 66)');
    });
    //???????????????
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
    userEvent.click(result.container.querySelector('.msw_batch_start'));
    trArr.forEach((item) => {
      expect(item).toHaveStyle('background: rgb(66, 173, 0)');
    });
    //???????????????
    expect(result.container.querySelector('tbody')).not.toBeEmptyDOMElement();
    userEvent.click(screen.getByText('??????'));
    expect(result.container.querySelector('.msw_handle_noRequest')).toBeInTheDocument();
  });
  test('?????????swagger??????', async () => {
    clickMockBtnInit(handlerMock, result);
    userEvent.click(result.container.querySelector('.msw_group_config_importFromSwagger button'));
    userEvent.clear(screen.getByPlaceholderText('?????????mock???pathname'));
    userEvent.click(result.container.querySelector('.msw_modal_ok_btn'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_modal_errorMsg')).toHaveTextContent(
        '?????????swaggerUrl??????',
      );
    });
    userEvent.type(
      screen.getByPlaceholderText('?????????swagger??????'),
      'https://o-test-adsmgt-api.sinoclick.com/v2/api-docs',
    );
    userEvent.click(result.container.querySelector('.msw_modal_ok_btn'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_modal_errorMsg')).toHaveTextContent(
        '?????????mock??????',
      );
    });
    userEvent.type(
      screen.getByPlaceholderText('?????????mock???pathname'),
      '/promote/google/smart/campaign/keyword',
    );
    userEvent.click(result.container.querySelector('.msw_modal_ok_btn'));
    await waitFor(() => {
      expect(result.container.querySelector('.msw_modal_errorMsg')).toHaveTextContent(
        /?????????????????????????????????/,
      );
    });
    userEvent.click(result.container.querySelector('.msw_swagger_mockPathName_wrap .msw_select'));
    userEvent.click(
      result.container.querySelector('.msw_swagger_url_itemWrap .msw_swagger_url_item button'),
    );
    expect(result.container.querySelector('.msw_modal_errorMsg')).toHaveTextContent('??????????????????');
    userEvent.click(
      result.container.querySelectorAll(
        '.msw_swagger_mockPathName_wrap .msw_select_dropdown .msw_select_dropdown_item',
      )[1],
    );
    userEvent.click(
      result.container.querySelector('.msw_swagger_url_itemWrap .msw_swagger_url_item button'),
    );
    expect(result.container.querySelector('.msw_modal_errorMsg')).not.toHaveTextContent(
      '??????????????????',
    );
  });
  test('????????????', () => {
    handlerMock.saveCopy(
      {
        level: 'collection',
        collectionName: 'module',
      },
      'module2',
    );
    handlerMock.changeCollectionStatus('module', true);
    handlerMock.changeCollectionStatus('module2', true);
    expect(result.container.querySelector('.msw_request_conflict')).toBeInTheDocument();
    userEvent.click(result.container.querySelector('.msw_conflictDetail_btn'));
    expect(result.container.querySelectorAll('tbody tr')).toHaveLength(2);
    userEvent.click(screen.getAllByText('????????????')[0]);
    expect(handlerMock.groupRequest.collection[0].data['group'].data[0].disabled).toBeTruthy();
  });
});

function clickMockBtnInit(handlerMock: HandlerMock, result: RenderResult) {
  const unHandlerBtn = screen.getByText('?????????');
  userEvent.click(unHandlerBtn);
  const request = handlerMock.groupRequest.collection[0].data['group'].data[0];
  handlerMock.changeGroupItemStatus(request, false);
  handlerMock.handleAllRequest.push(request.request);
  userEvent.click(result.container.querySelector('.msw_mock_btn'));
}
