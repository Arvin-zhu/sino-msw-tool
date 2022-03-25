import React from 'react';
import './index.less';
const gouIcon = require('../../images/gou.png');

export const CheckboxMsw = (props: {checked: boolean, onChange: (checked: boolean) => void}) => {
	const {checked, onChange} = props;
	return <div className={`msw_checkbox  ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}>
			{
				checked && <div className={`msw_checkbox_checked_wrap ${checked ? 'checked' : ''}`}><img className='msw_checkbox_checked' src={gouIcon} alt=''/></div>
			}
		</div>
}
