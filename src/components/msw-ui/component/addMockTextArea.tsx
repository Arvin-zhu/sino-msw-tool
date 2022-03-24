import clsx from 'clsx';
import 'jsoneditor/dist/jsoneditor.min.css';
import { observer } from 'mobx-react';
import React, { useCallback, useState } from 'react';
import { IGroupDataItem } from '../handlesType';
import { JsonEditor } from './jsonEditor';
import {SelectData} from "./select/select";
import {getGroupKeys} from "../handlesFnc";
import {useStores} from "../handles";


export const AddMockTextArea = observer((data: Partial<IGroupDataItem> & {isAdd?: boolean}) => {
	const { request, group, isAdd } = data;
	const {store} = useStores();
	const [tabActiveIndex, setTabActiveIndex] = useState(0);
	const [groupName, setGroupName] = useState(group || '');
	const changeGroupName = useCallback((value: string) => {
		setGroupName(value);
	}, [])
	return <div className={'msw_mock_detail_wrap'}>
		<div style={{marginBottom: 10}} className={'msw_group_input_wrap'}>
				<span>组名：</span>
				<SelectData disabled={!isAdd} data={getGroupKeys(store.groupRequest)} onChange={changeGroupName} value={groupName} />
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
