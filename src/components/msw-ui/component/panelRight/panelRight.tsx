import clsx from 'clsx';
import { observer } from 'mobx-react';
import React from 'react';
import './index.less';

import { useStores } from '../../handles';
import { exportGroupRequestData, getConflictRequest } from '../../handlesFnc';
import { AddMockPanel } from '../addMockPanel';
import { Upload } from '../upload/upload';

import { ConflictRequest } from './components/conflictRequest/conflictRequest';
//@ts-ignore
import homeIcon from '../../images/home.png';
//@ts-ignore
import transferPlat from '../../images/transferPlat.png';

export const PanelRight = observer(
  (props: { setShowDetail: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { setShowDetail } = props;
    const { store } = useStores();
    const {
      currentEditGroupRequest,
      setCurrentEditGroupRequest,
      handleTableTab,
      changeHandleTabTab,
      setCurrentHostChange,
      groupRequest,
      importGroupData,
      showConflictDetail,
      setShowConflictDetail,
      currentHostSwitch,
    } = store;

    return (
      <>
        <div className="msw_panel_statusBar">
          <span>
            <span
              className="msw_panel_statusBar_home"
              style={{ opacity: currentHostSwitch ? 0.5 : 1 }}
              onClick={() => setCurrentEditGroupRequest(undefined)}
            >
              <img src={homeIcon} alt="" style={{ width: 16 }} />
              <span style={{ verticalAlign: 'middle', marginLeft: 5 }}>首页</span>
            </span>
            <span
              className={clsx('msw_panel_statusBar_home')}
              style={{ opacity: currentHostSwitch ? 1 : 0.5 }}
              onClick={() => setCurrentHostChange(true)}
            >
              <img src={transferPlat} alt="" style={{ width: 16 }} />
              <span style={{ verticalAlign: 'middle', marginLeft: 5 }}>host切换</span>
            </span>
          </span>
          <div>
            <button
              className="small exportBtn"
              onClick={() => exportGroupRequestData(groupRequest)}
            >
              导出配置
            </button>
            <Upload
              size="small"
              callBack={(data) => importGroupData(data)}
              btnText={'导入配置'}
              btnStyle={{ marginLeft: 10 }}
            />
            <button
              className="small exportBtn"
              style={{ marginLeft: 10 }}
              onClick={() => setShowDetail(false)}
            >
              关闭
            </button>
          </div>
        </div>
        <div className="msw_panelRight_wrap">
          {getConflictRequest(groupRequest) &&
            !!Object.values(getConflictRequest(groupRequest)).length && (
              <div className="msw_request_conflict">
                注意：存在多个相同的活动拦截，可能会导致覆盖问题,{' '}
                <span
                  className="msw_conflictDetail_btn"
                  onClick={() => setShowConflictDetail(true)}
                >
                  查看详情
                </span>
              </div>
            )}
          {showConflictDetail && <ConflictRequest data={getConflictRequest(groupRequest)} />}
          {!currentEditGroupRequest && !currentHostSwitch && !showConflictDetail && (
            <div className="msw_panelRight_top">
              <button
                className={clsx('msw_btn msw_btn-unHandle small', {
                  active: handleTableTab === 'unHandle',
                })}
                onClick={() => changeHandleTabTab('unHandle')}
              >
                未拦截
              </button>
              <button
                className={clsx('msw_btn msw_btn-handling small', {
                  active: handleTableTab === 'handled',
                })}
                onClick={() => changeHandleTabTab('handled')}
              >
                拦截池
              </button>
            </div>
          )}
          <div className="msw_panelRight_main">
            <AddMockPanel tableTab={handleTableTab as any} />
          </div>
        </div>
      </>
    );
  },
);
