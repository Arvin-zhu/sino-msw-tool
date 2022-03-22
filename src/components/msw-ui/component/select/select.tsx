import React, { useState } from 'react';
import { getRequestKeyFormatShow } from '../../handlesFnc';
import { IGroupDataItem } from '../../handlesType';
import './index.less';

export type operationClickType = (data: {type: 'edit' | 'delete' | 'enable' | 'disabled', groupDataItem: IGroupDataItem}) => void;
interface ISelectData {
	operationClick:  operationClickType;
	data: IGroupDataItem[]
}

export const SelectData = (props: ISelectData) => {
	const {data, operationClick} = props;
	const [visible, setVisible] = useState(false);
	return <div className='msw_select'>
		<div className='msw_select_input' onClick={() => setVisible(true)}>
			<span>{data?.[0]?.request.method}</span>
			<span title={getRequestKeyFormatShow(data?.[0]?.request)} style={{marginLeft: 5}}>{getRequestKeyFormatShow(data?.[0]?.request)}</span>
		</div>
		<div className={`msw_select_mask ${visible ? 'show' : ''}`} onClick={() => setVisible(false)} />
		<div className={`msw_select_dropdown ${visible ? 'show' : ''}`}>
			{
				data?.map((im, index) => {
					return <Option key={index} req={im} onClick={operationClick} />
				})
			}
		</div>
	</div>
}

const Option = (props: {req: IGroupDataItem, onClick: operationClickType}) => {
	const {req, onClick} = props;
	return <div className='msw_select_dropdown_item'>
		<span className='msw_select_dropdown_item_operation_label_wrap'>
			<span>{req.request.method}</span>
			<span className='msw_select_dropdown_item_operation_label' title={getRequestKeyFormatShow(req.request)}>
				{getRequestKeyFormatShow(req.request)}
			</span>
		</span>
		<div>
				<button className='small' onClick={() => onClick({type: 'edit', groupDataItem: req})}>编辑</button>
				<button className='msw_group_delete_btn small' onClick={() => onClick({type: 'delete', groupDataItem: req})}>删除</button>
				<button className='small' onClick={() => onClick({type: !!req.disabled ? 'enable' : 'disabled', groupDataItem: req})}>{req.disabled ? '启用' : '禁用'}</button>
			</div>
	</div>
}
