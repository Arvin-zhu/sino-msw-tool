import clsx from 'clsx';
import 'jsoneditor/dist/jsoneditor.min.css';
import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useState } from 'react';
import { IGroupDataItem } from '../handlesType';
import { JsonEditor } from './jsonEditor';


export const AddMockTextArea = observer((data: Partial<IGroupDataItem> & {isAdd?: boolean}) => {
	const { request, group, isAdd } = data;
	const [tabActiveIndex, setTabActiveIndex] = useState(0);
	const [groupName, setGroupName] = useState(group || '');
	const groupNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setGroupName(e.target.value);
	}, [])
	return <div className={'msw_mock_detail_wrap'}>
		<div style={{marginBottom: 10}} className={'msw_group_input_wrap'}>
			<span>组名: </span><input disabled={!isAdd} value={groupName} onChange={groupNameChange} placeholder={'分组名称'} />
		</div>
		<div className={'msw_mock_detail_tab'}>
			<div className='msw_content_tab_vertical'>
				<div onClick={() => setTabActiveIndex(0)} className={clsx('msw_content_tab_vertical_item', {active: tabActiveIndex === 0})}>设置</div>
				{/*<div onClick={() => setTabActiveIndex(1)} className={clsx('msw_content_tab_vertical_item', {active: tabActiveIndex === 1})}>pro</div>*/}
			</div>
			<div className='msw_mock_content'>
				{tabActiveIndex === 0 && request && <JsonEditor {...data} group={groupName}  />}
			</div>
		</div>
	</div>
})
