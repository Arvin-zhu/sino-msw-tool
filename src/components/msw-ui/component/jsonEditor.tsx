import JSONEditor from 'jsoneditor';
import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useStores } from '../handles';
import { IGroupDataItem } from '../handlesType';
import {Upload} from "./upload/upload";

export const JsonEditor = observer((data: Partial<IGroupDataItem>) => {
	const {store} = useStores();
	const { request, status, group } = data;
	const editorContainer = useRef<HTMLDivElement | null>(null);
	const editorContainerRoot = useRef<HTMLDivElement | null>(null);
	const editor = useRef<JSONEditor | null>(null);
	const [statusCode, setStatusCode] = useState<string | undefined>(status);
	const [errorMsg, setErrorMsg] = useState('');
	useEffect(() => {
		if (editorContainer.current) {
			editor.current = new JSONEditor(editorContainer.current, {
				mode: 'code',
				enableSort: false,
				enableTransform: false
			})
		}
		return () => {
				editor.current?.destroy();
		}
	}, [])
	useEffect(() => {
		request?.responseJson && editor.current?.set(request.responseJson);
	}, [request])
	const saveData = useCallback(async () => {
		const errors = await editor.current?.validate();
		if (errors?.length) {
			setErrorMsg('json 不合法');
			return;
		}
		if (!group) {
			setErrorMsg('请输入分组名称!')
			return;
		}
		if (!statusCode) {
			setErrorMsg('请输入状态码！')
			return;
		}
		if (errors?.length || !request) {
			return;
		}
		const data = editor.current?.get();
		request.responseJson = data;
		store.addSimpleMock({
			type: 'basic',
			group,
			status: statusCode,
			request,
		});
		store.setCurrentEditGroupRequest(null);
	}, [request, store, group, statusCode]);
	const onStatusChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setStatusCode(e.target.value);
	}, [])
	return <div ref={editorContainerRoot} className={'msw_jsonEditor_wrap'}>
			<div className='msw_data_edit_header'>
				<div className={'msw_group_status_wrap'}>status: <input style={{marginLeft: 10}} onChange={onStatusChange} value={statusCode || ''} placeholder={'状态码'} /></div>
				<div className={'msw_group_upload_wrap'} style={{marginLeft: 10}}>data:
					<Upload callBack={(jsonData) => editor.current?.set(jsonData)} />
				</div>
			</div>
			<div ref={editorContainer} style={{height: 500}} />
			<div style={{marginTop: 10, textAlign: 'right'}} className={'msw_save_btn_wrap'}>
				{
					errorMsg && <span style={{color: 'red'}}>{errorMsg}</span>
				}
				<button onClick={saveData}>保存</button>
			</div>
		</div>
})
