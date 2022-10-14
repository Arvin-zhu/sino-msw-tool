import { Provider } from 'mobx-react';
import { SetupWorkerApi } from 'msw';

import React, { useLayoutEffect, useMemo, useState } from 'react';

import { MockPanel } from './components/msw-ui/component/mockPanel';
import { HandlerMock } from './components/msw-ui/handles';

import { configure } from 'mobx';

declare global {
  interface Window {
    _msw_worker: SetupWorkerApi;
    _msw_tool: HandlerMock;
  }
  var MSW_PATH: any;
}

configure({ isolateGlobalState: true });

export type mswPlacement = 'rightBottom' | 'leftBottom';

export type MswUiType = typeof MswUi;

export const MswUi: React.FC<{
  placement?: mswPlacement;
  projectName: string;
  includesLocal?: boolean; //是否拦截本地请求
  children: any;
}> = (props) => {
  const { placement = 'rightBottom', projectName, includesLocal } = props;
  const [loading, setLoading] = useState(true);
  useLayoutEffect(() => {
    initMsw(projectName, includesLocal).then(() => {
      setLoading(false);
    });
  }, [projectName]);
  const store = useMemo(() => {
    const instance = HandlerMock.of(projectName);
    window._msw_tool = instance;
    return instance;
  }, [projectName]);
  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <Provider store={store}>
          <MockPanel placement={placement} />
        </Provider>
      )}
      {loading ? null : props.children}
    </>
  );
};
export const initMsw = (projectName: string, includesLocal?: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    return HandlerMock.of(projectName)
      .init(projectName, includesLocal)
      .catch((e) => {
        throw new Error('mswError:' + e);
      });
  }
  return Promise.resolve();
};
