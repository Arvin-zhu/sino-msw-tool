import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { useLayoutEffect, useState } from 'react';

import { useStores } from '../handles';

import { AddMockPanel } from './addMockPanel';
import { GroupMockPanel } from './groupMockPanel';

export const MockPanel = observer((props: { projectName: string }) => {
  const { projectName } = props;
  const [showDetail, setShowDetail] = useState(false);
  const [tabActiveIndex, setTabActiveIndex] = useState(0);
  const { store } = useStores();
  useLayoutEffect(() => {
    store.init(projectName);
  }, []);
  return (
    <div className="msw_container">
      {!showDetail && (
        <div
          className="msw_container_circle"
          onClick={() => setShowDetail(true)}
          data-testid='msw_circle'
        >
          M
        </div>
      )}
      {showDetail && (
        <div className="msw_detail_panel" data-testid='msw_detail_container'>
          <div className="msw_header">
            <div className="msw_close" onClick={() => setShowDetail(false)}>
              X
            </div>
          </div>
          <div className="msw_content">
            <div className="msw_content_tab">
              <div
                onClick={() => {
                  store.setCurrentEditGroupRequest(undefined);
                  setTabActiveIndex(0);
                }}
                className={clsx('msw_content_tab_item', {
                  active: tabActiveIndex === 0,
                })}
              >
                请求
              </div>
              <div
                onClick={() => {
                  store.setCurrentEditGroupRequest(undefined);
                  setTabActiveIndex(1);
                }}
                className={clsx('msw_content_tab_item', {
                  active: tabActiveIndex === 1,
                })}
              >
                请求组
              </div>
            </div>
            <div className="msw_content_tab_body">
              {tabActiveIndex === 0 && <AddMockPanel />}
              {tabActiveIndex === 1 && <GroupMockPanel />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
