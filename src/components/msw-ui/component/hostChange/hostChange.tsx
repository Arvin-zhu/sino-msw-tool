import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';

import './index.less';
import { useStores } from '../../handles';
import {
  getAllHostsFromCollections,
  initHostStringArrToMap,
} from '../../handlesFnc';
import { Input } from '../input/input';

const hostTransfer = require('../../images/transferPlat.png');

export const HostChange = observer(() => {
  const { store } = useStores();
  const { currentHostSwitch, groupRequest, saveChangeHost } = store;
  const hostArr = getAllHostsFromCollections(groupRequest);
  const [hostState, setHostState] = useState(() =>
    initHostStringArrToMap(hostArr)
  );
  const [errorMsg, setErrorMsg] = useState('');
  const saveChange = useCallback(() => {
    if (!currentHostSwitch) return;
    const newHosts = Object.values(hostState).filter((im) => !im.trim());
    if (newHosts?.length) {
      setErrorMsg('host不能为空');
      return;
    }
    saveChangeHost(hostState);
  }, [hostState, currentHostSwitch]);
  useEffect(() => {
    setErrorMsg('');
  }, [hostState]);
  if (!hostArr?.length) {
    return <div className="msw_noHost_changeData">暂无host</div>;
  }
  return (
    <div className="msw_hostChange_wrap">
      {hostArr.map((im) => {
        return (
          <div className="msw_hostChange_item" key={im}>
            <div className="msw_hostOld">{im}</div>
            <img src={hostTransfer} alt="" style={{ width: 20 }} />
            <Input
              value={hostState[im]}
              onChange={(e) => {
                setHostState((hostState) => ({
                  ...hostState,
                  [im]: e.target.value.trim(),
                }));
              }}
              placeholder="请输入新的host"
            />
          </div>
        );
      })}
      <div style={{ textAlign: 'right' }}>
        {errorMsg && <span style={{ color: 'red' }}>{errorMsg}</span>}
        <button onClick={saveChange} className="msw_hostChange_saveBtn">
          保存
        </button>
      </div>
    </div>
  );
});
