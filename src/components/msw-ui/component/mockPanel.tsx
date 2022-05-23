import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { useCallback, useLayoutEffect, useState } from 'react';

import { useStores } from '../handles';
import { mswPlacement } from '../MswUi';

import { Confirm } from './confirm/confirm';
import { Input } from './input/input';
import { PanelLeft } from './panelLeft/panelLeft';
import { PanelRight } from './panelRight/panelRight';

const addBtn = require('../images/add.png');

export const MockPanel = observer(
  (props: { projectName: string; placement: mswPlacement }) => {
    const { projectName, placement } = props;
    const [showDetail, setShowDetail] = useState(false);
    const { store } = useStores();
    useLayoutEffect(() => {
      store.init(projectName);
    }, []);

    return (
      <div
        className={clsx('msw_container', {
          'msw_container-left': placement === 'leftBottom',
        })}
      >
        {!showDetail && (
          <div
            className={clsx('msw_container_circle', {
              'msw_container_circle-leftBottom': placement === 'leftBottom',
            })}
            onClick={() => setShowDetail(true)}
            data-testid="msw_circle"
          >
            M
          </div>
        )}
        <div style={{ display: showDetail ? 'block' : 'none', height: '100%' }}>
          <MockDetail setShowDetail={setShowDetail} />
        </div>
      </div>
    );
  }
);

function MockDetail(props: {
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setShowDetail } = props;
  const { store } = useStores();
  const [addCollectionError, setAddCollectionError] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const addCollection = useCallback(() => {
    return new Promise((resolve, reject) => {
      const result = store.addCollection(newCollectionName);
      if (result.status) {
        resolve('');
        setNewCollectionName('');
      } else {
        setAddCollectionError(result.msg);
        reject(result.msg);
      }
    });
  }, [newCollectionName]);
  return (
    <div
      className="msw_detail_panel"
      data-testid="msw_detail_container"
      id="msw_detail_panel"
    >
      <div className="msw_content">
        <div className="msw_content_left">
          <div className="msw_content_left_item" style={{ zIndex: 5 }}>
            <span>模块</span>
            <Confirm
              onOk={addCollection}
              onCancel={() => {
                setNewCollectionName('');
                setAddCollectionError('');
              }}
              content={
                <div>
                  <Input
                    value={newCollectionName}
                    onChange={(e) => {
                      setNewCollectionName(e.target.value);
                      setAddCollectionError('');
                    }}
                    placeholder="请输入模块名称"
                  />
                  {addCollectionError && (
                    <div className="errorField">{addCollectionError}</div>
                  )}
                </div>
              }
            >
              <span>
                <img className="msw_add_btn" src={addBtn} alt="" />
              </span>
            </Confirm>
          </div>
          <PanelLeft />
        </div>
        <div className="msw_content_right">
          <PanelRight setShowDetail={setShowDetail} />
        </div>
      </div>
    </div>
  );
}
