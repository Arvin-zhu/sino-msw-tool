import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';

interface IModalProps {
  onCancel?: () => void;
  onOk?: (() => void) | (() => Promise<any>);
  hide?: () => void;
  title: string | React.ReactNode;
  visible?: boolean;
}
export const Modal = (props: IModalProps) => {
  const { onCancel, onOk, title, hide, visible = true } = props;
  return (
    <React.Fragment>
      {visible ? (
        <div className="msw_modal">
          <div className="msw_modal_mask" onClick={() => hide?.()}></div>
          <div className="msw_modal_inner">
            <div>{title}</div>
            <div className="msw_modal_btn_group">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                  hide?.();
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
                  const result = onOk?.();
                  if (result instanceof Promise) {
                    result
                      .then((res) => {
                        hide?.();
                      })
                      .catch((e) => {
                        console.log(e);
                      });
                  } else {
                    hide?.();
                  }
                }}
                className="msw_modal_ok_btn"
              >
                确定
              </button>
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
