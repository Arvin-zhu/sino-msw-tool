import { Button } from '@/components/msw-ui/component/button';
import { useStores } from '@/components/msw-ui/handles';
import React from 'react';
import './index.less';

export const HandledBatchOptions = () => {
  const { store } = useStores();
  const { clearTableList, batchChangeTableList } = store;
  return (
    <div className={'msw_handled_batch_options'}>
      <span>列表：</span>
      <Button className={'ghost msw_batch_clear'} onClick={clearTableList}>
        清空
      </Button>
      <Button
        className={'ghost msw_batch_pause'}
        onClick={() => {
          batchChangeTableList('disabled');
        }}
      >
        暂停
      </Button>
      <Button
        className={'ghost msw_batch_start'}
        onClick={() => {
          batchChangeTableList('active');
        }}
      >
        启动
      </Button>
    </div>
  );
};
