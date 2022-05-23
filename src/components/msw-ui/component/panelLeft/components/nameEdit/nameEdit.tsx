import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';

import { useStores } from '../../../../handles';
import { IGroupDataItem } from '../../../../handlesType';
import { Input } from '../../../input/input';
import { Modal } from '../../../modal/modal';

export const NameEditModal = observer(
  (props: {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    level: 'collection' | 'group' | 'request';
    collectionName?: string;
    groupName?: string;
    request?: IGroupDataItem;
  }) => {
    const { store } = useStores();
    const { checkNameEditRepeat, saveEditName } = store;
    const [errorMsg, setErrorMsg] = useState('');
    const { visible, setVisible, ...editInfo } = props;
    const [name, setName] = useState('');

    const onOk = useCallback(() => {
      if (!name.trim()) {
        setErrorMsg('请输入名称');
        return;
      }
      if (checkNameEditRepeat(editInfo, name)) {
        setErrorMsg('已存在相同名称');
        return;
      }
      saveEditName(editInfo, name.trim());
      setVisible(false);
    }, [editInfo, name]);
    return (
      <Modal
        title={
          <>
            <Input
              placeholder="请输入名称"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
            />
            {errorMsg && (
              <div style={{ color: 'red', fontSize: 12 }}>{errorMsg}</div>
            )}
          </>
        }
        onCancel={() => setVisible(false)}
        visible={visible}
        onOk={onOk}
      />
    );
  }
);

export const CopyModal = observer(
  (props: {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    level: 'collection' | 'group' | 'request';
    collectionName?: string;
    groupName?: string;
    request?: IGroupDataItem;
  }) => {
    const { store } = useStores();
    const { checkNameEditRepeat, saveCopy } = store;
    const [errorMsg, setErrorMsg] = useState('');
    const { visible, setVisible, ...editInfo } = props;
    const [name, setName] = useState('');

    const onOk = useCallback(() => {
      if (!name.trim()) {
        setErrorMsg('请输入名称');
        return;
      }
      if (checkNameEditRepeat(editInfo, name)) {
        setErrorMsg('复制名称重复，请重新命名');
        return;
      }
      saveCopy(editInfo, name.trim());
      setVisible(false);
    }, [editInfo, name]);
    return (
      <Modal
        title={
          <>
            <Input
              placeholder="请输入名称"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
            />
            {errorMsg && (
              <div style={{ color: 'red', fontSize: 12 }}>{errorMsg}</div>
            )}
          </>
        }
        onCancel={() => setVisible(false)}
        visible={visible}
        onOk={onOk}
      />
    );
  }
);
