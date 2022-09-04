import React from 'react';
import { Button } from '@/components/msw-ui/component/button';
import './index.less';
import { useStores } from '@/components/msw-ui/handles';

export const HandledBatchOptions = () => {
  const { store } = useStores();
  const { clearTableList, batchChangeTableList } = store;
  return (
    <div className={'msw_handled_batch_options'}>
      <span>列表：</span>
      <Button className={'ghost'} onClick={clearTableList}>
        清空
      </Button>
      <Button
        className={'ghost'}
        onClick={() => {
          batchChangeTableList('disabled');
        }}
      >
        暂停
      </Button>
      <Button
        className={'ghost'}
        onClick={() => {
          batchChangeTableList('active');
        }}
      >
        启动
      </Button>
    </div>
  );
};
