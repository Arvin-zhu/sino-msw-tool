import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
import { useStores } from '../handles';
import { IGroupDataItem } from '../handlesType';
import { AddMockTextArea } from "./addMockTextArea";
import { CheckboxMsw } from './checkbox/checkbox';
import { Confirm } from './confirm/confirm';
import { SelectData } from './select/select';
// import EmptyIcon from '../images/empty.svg';
const EmptyIcon  = require('../images/empty.svg');
import {exportGroupRequestData, judgeHavaGroupHandlers} from "../handlesFnc";
import {Upload} from "./upload/upload";

export const GroupMockPanel = observer(() => {
  const {store} = useStores();
  const groupData = store.groupRequest || {};
  console.log(store.groupRequest, '==groupRequest')
  return <div className={'msw_group_content'}>
    <div className='msw_group_top'>
      <button disabled={!judgeHavaGroupHandlers(groupData)} onClick={() => !judgeHavaGroupHandlers(groupData) && exportGroupRequestData(store.groupRequest)}>导出配置</button>
      <Upload callBack={(data) => store.importGroupData(data) } btnText={'导入配置'} btnStyle={{marginLeft: 10}} />
      <button disabled={!judgeHavaGroupHandlers(groupData)} style={{marginLeft: 10}} onClick={() => !judgeHavaGroupHandlers(groupData) && store.saveRequestGroup()}>保存到本地</button>
    </div>
    {
      !judgeHavaGroupHandlers(groupData) ? (
        <div className={'msw_table_empty'} style={{borderTop: '1px solid #d9d9d9', marginTop: 10}}>
          <img src={EmptyIcon} alt={'empty'} />
          <div>暂无拦截的请求</div>
        </div>
      ) : (<>
        {
          Object.keys(groupData)?.map(im => {
            return <GroupMockPanelItem key={im} groupData={groupData} groupKey={im} />
          })
        }
        {
          store.currentEditGroupRequest && <div style={{marginTop: 20}}>
                <AddMockTextArea {...store.currentEditGroupRequest} />
            </div>
        }
      </>)
    }
  </div>
})

const GroupMockPanelItem = observer((props: {groupData: Record<string, {data: IGroupDataItem[], isEnable: boolean}>, groupKey: string}) => {
  const {store} = useStores();
  const [copyGroupName, setCopyGroupName] = useState('');
  const {groupData, groupKey} = props;
  const onCopyOk = useCallback(() => {
    store.copyGroup(groupKey, copyGroupName)
  }, [copyGroupName,groupKey, store]);
  const onDeleteOk = useCallback(() => {
    store.deleteGroup(groupKey);
  }, [groupKey]);
  const operationClick = useCallback((data: {type: 'edit' | 'delete' | 'enable' | 'disabled', groupDataItem: IGroupDataItem}) => {
    const {type, groupDataItem} = data;
    if (type === 'edit') {
      store.setCurrentEditGroupRequest(groupDataItem);
    }
    if (type === 'delete') {
      store.deleteGroupItem(groupKey, groupDataItem);
    }
    if (type === 'enable' || type === 'disabled') {
      store.changeGroupItemStatus(groupKey, groupDataItem, type === 'enable');
    }
  }, [groupKey])
  return <div className={'msw_group_content_item'}>
    <span>{groupKey}:</span>
    <div className='msw_group_content_item_detail'>
      <div className='msw_group_content_item_input'>
        <SelectData data={groupData[groupKey]?.data || []} operationClick={operationClick} />
      </div>
      <CheckboxMsw checked={groupData[groupKey].isEnable} onChange={(status: boolean) => {
        store.activeGroup(groupKey, status);
      }} />
      <Confirm
        onOk={onCopyOk}
        content={
          <input placeholder='group name' onChange={(e) => setCopyGroupName(e.target.value)} />
        }>
        <button  className='msw_group_copy_btn small'>复制</button>
      </Confirm>
      <Confirm onOk={onDeleteOk} content={<div>确认要删除吗？</div>}>
        <button className='msw_group_delete_btn small'>删除</button>
      </Confirm>
    </div>
  </div>
})
