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
      process.env = { ...env }
  })
  afterEach(() => {
      process.env = env
  })
  test('msw 图标加载', () => {
    process.env.NODE_ENV = 'development';
    render(
      <Provider store={handlerMock}>
        <MockPanel projectName={'adManage'} />
      </Provider>
    );
    expect(screen.getByTestId('msw_circle')).toBeInTheDocument();
  });
});
