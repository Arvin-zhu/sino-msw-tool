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

configure({ isolateGlobalState: true })

export const MswUi = (props: { projectName: string }) => {
  const { projectName } = props;
  return (
    <Provider store={handlerMock}>
      <MockPanel projectName={projectName} />
    </Provider>
  );
};
