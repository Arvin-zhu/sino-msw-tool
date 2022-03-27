import React, { useState } from 'react';
import './index.less';

interface IConfirm {
  onCancel?: () => void;
  onOk?: () => void | Promise<any>;
  content: React.ReactElement;
}
export const Confirm: React.FC<IConfirm> = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="msw_confirm" onClick={() => setVisible(true)}>
      <div className={`msw_confirm_panel ${visible ? 'show' : ''}`}>
        <div>{props.content}</div>
        <div className="msw_confirm_btn_group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.onCancel?.();
              setVisible(false);
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
