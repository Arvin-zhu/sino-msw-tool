import { Provider } from 'mobx-react';
import { SetupWorkerApi } from 'msw';
import './component/index.less';
import { MockPanel } from './component/mockPanel';
import { handlerMock } from './handles';
import React from 'react';

declare global {
	interface Window {
		_msw_worker: SetupWorkerApi;
		_msw_tool: typeof handlerMock;
	}
}

export const MswUi = () => {
	return <Provider store={handlerMock}>
		<MockPanel />
	</Provider>
}
