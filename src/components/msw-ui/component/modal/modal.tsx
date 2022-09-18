import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { Button } from '../button';

interface IModalProps {
  onCancel?: () => void;
  onOk?: (() => void) | (() => Promise<any>);
  hide?: () => void;
  title: string | React.ReactNode;
  visible?: boolean;
  width?: number;
  error?: string | React.ReactNode;
}
export const Modal = (props: IModalProps) => {
  const { onCancel, onOk, title, hide, visible = true, width = 400, error: errorMsg } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorMsg);
  useEffect(() => {
    setError(errorMsg);
  }, [errorMsg]);
  return (
    <React.Fragment>
      {visible ? (
        <div className="msw_modal">
          <div className="msw_modal_mask" onClick={() => hide?.()}></div>
          <div className="msw_modal_inner" style={{ width }}>
            <div>{title}</div>
            <div className="msw_modal_btn_group">
              {error && <span className={'msw_modal_errorMsg'}>{error}</span>}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                  hide?.();
                }}
                data-testid="msw_modal_cancel_btn"
                style={{
                  color: '#242424',
                  border: '1px solid #E5E6E9',
                  marginRight: 10,
                }}
              >
                取消
              </Button>
              <Button
                isLoading={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  const result = onOk?.();
                  if (result instanceof Promise) {
                    setLoading(true);
                    result
                      .then((res) => {
                        hide?.();
                      })
                      .catch((e) => {
                        console.log(e);
                      })
                      .finally(() => setLoading(false));
                  } else {
                    hide?.();
                  }
                }}
                className="msw_modal_ok_btn"
                data-testid="msw_modal_ok_btn"
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </React.Fragment>
  );
};

function Wrapper(Component: React.FC<IModalProps>) {
  const container = document.createElement('div');

  const hide = function () {
    ReactDOM.unmountComponentAtNode(container);
    document.getElementById('msw_detail_panel')!.removeChild(container);
  };
  const show = function (props: IModalProps) {
    document.getElementById('msw_detail_panel')!.appendChild(container);
    ReactDOM.render(<Component {...props} hide={hide} />, container);
  };

  return {
    show,
  };
}

export const MswModal = Wrapper(Modal);
