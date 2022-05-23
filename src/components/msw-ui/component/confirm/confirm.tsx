import clsx from 'clsx';
import React, { useState } from 'react';
import './index.less';

interface IConfirm {
  onCancel?: () => void;
  onOk?: () => void | Promise<any>;
  content: React.ReactElement;
  placement?: 'right' | 'left' | 'topRight';
}
export const Confirm: React.FC<IConfirm> = (props) => {
  const [visible, setVisible] = useState(false);
  const { placement = 'right', content } = props;
  return (
    <div className="msw_confirm" onClick={() => setVisible(true)}>
      {visible && (
        <div
          className="msw_dropdown_mask"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
        ></div>
      )}
      <div
        className={clsx(`msw_confirm_panel`, {
          show: visible,
          msw_confirm_panel_right: placement === 'right',
          msw_confirm_panel_left: placement === 'left',
          msw_confirm_panel_topRight: placement === 'topRight',
        })}
      >
        <div>{content}</div>
        <div className="msw_confirm_btn_group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onCancel?.();
              setVisible(false);
            }}
            style={{
              color: '#242424',
              border: '1px solid #E5E6E9',
              marginRight: 10,
            }}
          >
            取消
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const onOk = props.onOk?.();
              if (onOk) {
                onOk
                  .then((res) => setVisible(false))
                  .catch((e) => console.log(e));
              } else {
                setVisible(false);
              }
            }}
            className="msw_confirm_ok_btn"
          >
            确定
          </button>
        </div>
      </div>
      {props.children}
    </div>
  );
};
