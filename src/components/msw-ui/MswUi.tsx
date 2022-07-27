import { Provider } from 'mobx-react';
import { SetupWorkerApi } from 'msw';

import React, { useLayoutEffect, useState } from 'react';

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

export const MswUi: React.FC<{
  placement?: mswPlacement;
  projectName: string;
  children: any;
}> = props => {
  const { placement = 'rightBottom', projectName } = props;
  const [loading, setLoading] = useState(true);
  useLayoutEffect(() => {
    initMsw(projectName).then(() => {
      setLoading(false);
    });
  }, [projectName]);
  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <Provider store={handlerMock}>
          <MockPanel placement={placement} />
        </Provider>
      )}
      {loading ? null : props.children}
    </>
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
