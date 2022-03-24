import React from 'react';
import './index.less';

interface IModalProps {
	visible: boolean;
	onCancel?: () => void;
	onOk?: () => void;
}
export const Modal = (props: IModalProps) => {
	return <div>modal</div>
}