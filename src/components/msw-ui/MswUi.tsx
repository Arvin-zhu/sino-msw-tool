import { Provider } from 'mobx-react';
import { SetupWorkerApi } from 'msw';

import './component/index.less';
import React from 'react';

import { MockPanel } from './component/mockPanel';
import { handlerMock } from './handles';

import { configure } from 'mobx';

declare global {
  interface Window {
    _msw_worker: SetupWorkerApi;
    _msw_tool: typeof handlerMock;
  }
}

configure({ isolateGlobalState: true });

export type mswPlacement = 'rightBottom' | 'leftBottom';

export const MswUi = (props: { placement?: mswPlacement }) => {
  const { placement = 'rightBottom' } = props;
  return (
    <Provider store={handlerMock}>
      <MockPanel placement={placement} />
    </Provider>
  );
};

export const initMsw = (projectName: string) => {
  if (process.env.NODE_ENV === 'development') {
    return handlerMock.init(projectName).catch(e => {
      throw new Error('mswError:' + e);
    });
  }
  return Promise.resolve();
};
