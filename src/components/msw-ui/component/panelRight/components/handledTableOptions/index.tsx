import { useStores } from '@/components/msw-ui/handles';
import { IGroupDataItem } from '@/components/msw-ui/handlesType';
import clsx from 'clsx';
import React from 'react';
import { Confirm } from '@/components/msw-ui/component/confirm/confirm';

export const HandledTableOptions = (props: { im: IGroupDataItem }) => {
  const { im } = props;
  const { store } = useStores();
  const { changeGroupItemStatus, deleteGroupItem, moveOutFromHandledTable } = store;
  return (
    <>
      <Confirm
        content={
          <div style={{ textAlign: 'left' }}>确定要删除吗？删除之后不再显示在左边结构中。</div>
        }
        placement="topRight"
        onOk={() => {
          deleteGroupItem(im);
        }}
      >
        <button className="xs msw_mock_btn msw_mock_delete_btn">删除</button>
      </Confirm>
      <button
        className={clsx('xs msw_confirm_ok_btn', {
          msw_mock_canCelHandler_btn: !im.disabled,
          msw_mock_enableHandler_btn: im.disabled,
        })}
        onClick={() => {
          changeGroupItemStatus(im, im.disabled);
        }}
      >
        {im.disabled ? '启动' : '暂停'}
      </button>
      <button
        className={clsx('xs msw_mock_canCelHandler_btn', {})}
        onClick={() => {
          moveOutFromHandledTable(im);
        }}
      >
        移出
      </button>
    </>
  );
};
