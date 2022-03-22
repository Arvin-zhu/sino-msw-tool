import React, { useState } from 'react';
import './index.less';

interface IConfirm {
	onCancel?: () => void;
	onOk?: () => void;
	content: React.ReactElement;
}
export const Confirm: React.FC<IConfirm> = (props) => {
	const [visible, setVisible] = useState(false);
	return <div className='msw_confirm' onClick={() => setVisible(true)}>
		<div className={`msw_confirm_panel ${visible ? 'show' : ''}`}>
			<div>{props.content}</div>
			<div className='msw_confirm_btn_group'>
				<button onClick={(e) => {
					e.stopPropagation();
					props.onCancel?.();
					setVisible(false);
				}}>cancel</button>			
				<button onClick={(e) => {
					e.stopPropagation();
					props.onOk?.();
					setVisible(false);
				}} className='msw_confirm_ok_btn'>ok</button>
			</div>
		</div>
		{props.children}
	</div>
}