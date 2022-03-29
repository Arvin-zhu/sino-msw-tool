import { render, screen } from '@testing-library/react';
import { Provider } from 'mobx-react';
import React from 'react';

import { handlerMock } from '../handles';
import { MockPanel } from '../component/mockPanel';
import '@testing-library/jest-dom';

describe('mock panel', () => {
  const env = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...env };
    process.env.NODE_ENV = 'development';
  })
  afterEach(() => {
      process.env = env
  })
  test('msw 图标加载', () => {
    render(
      <Provider store={handlerMock}>
        <MockPanel projectName={'adManage'} />
      </Provider>
    );
    expect(screen.getByTestId('msw_circle')).toBeInTheDocument();
  });
  test('msw 配置层出现', () => {
    render(
      <Provider store={handlerMock}>
        <MockPanel projectName={'adManage'} />
      </Provider>
    );
    const circle_logo = screen.getByTestId('msw_circle');
    circle_logo.click();
    expect(circle_logo).not.toBeInTheDocument();
    expect(screen.getByTestId('msw_detail_container')).toBeInTheDocument();
  })
});
