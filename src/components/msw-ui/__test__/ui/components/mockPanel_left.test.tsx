import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'mobx-react';
import { handlerMock } from '../../../handles';
import { MockDetail } from '../../../component/mockPanel';
import React from 'react';
import { getEachInitConfig } from '../../utils/common';

jest.mock('../../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
    setItem: () => '',
  };
});

describe('test mock detail', () => {
  getEachInitConfig();
  test('测试增加模块', async () => {
    const setShowDetail = jest.fn();
    const result = render(
      <Provider store={handlerMock}>
        <MockDetail setShowDetail={setShowDetail} />
      </Provider>,
    );
    fireEvent.click(result.container.querySelector('.msw_add_btn'));
    fireEvent.change(screen.getByPlaceholderText('请输入模块名称'), {
      target: {
        value: 'test',
      },
    });
    fireEvent.click(result.container.querySelector('.msw_confirm_ok_btn'));
    await waitFor(() => {
      expect(
        result.container.querySelectorAll('.msw_content_left_item_wrap .msw_content_left_item')
          ?.length,
      ).toBe(1);
    });
  });
});
