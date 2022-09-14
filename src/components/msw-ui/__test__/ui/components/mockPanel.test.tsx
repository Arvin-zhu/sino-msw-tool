import { render, screen } from '@testing-library/react';
import { Provider } from 'mobx-react';
import React from 'react';

import { handlerMock } from '../../../handles';
import { MockPanel } from '../../../component/mockPanel';
import '@testing-library/jest-dom';
import { getEachInitConfig } from '../../utils/common';
import userEvent from '@testing-library/user-event';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.mock('../../../yuxStorage/index.js', () => {
  return {
    getItem: () => '',
  };
});

describe('test mock panel', () => {
  getEachInitConfig();
  test('msw 图标加载', () => {
    render(
      <Provider store={handlerMock}>
        <MockPanel />
      </Provider>,
    );
    expect(screen.getByTestId('msw_circle')).toBeInTheDocument();
  });
  test('msw 配置层出现', () => {
    render(
      <Provider store={handlerMock}>
        <MockPanel />
      </Provider>,
    );
    const circle_logo = screen.getByTestId('msw_circle');
    userEvent.click(circle_logo);
    expect(circle_logo).toHaveClass('msw_container_circle-hide');
    expect(screen.getByTestId('msw_detail_container')).toBeInTheDocument();
  });
});
