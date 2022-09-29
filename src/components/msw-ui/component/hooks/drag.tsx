import { throttle } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

type posType = { posX: number; posY: number };
export const useDrag = (isClickCallback: () => void, projectName?: string) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<posType | null>(null);
  const clickTimeStamp = useRef(null);
  const initPos = useRef<(posType & { offsetInitX?: number; offsetInitY?: number }) | null>(null);
  const isDragRef = useRef(false);

  const resize = useCallback(
    throttle(() => {
      const localPos = localStorage.getItem(projectName + '_msw-logoPos-storage');
      if (localPos) {
        const localStoreData = JSON.parse(localPos);
        setPos({
          posX: window.innerWidth * Number(localStoreData.x),
          posY: window.innerHeight * Number(localStoreData.y),
        });
      }
    }, 100),
    [projectName],
  );

  useEffect(() => {
    if (pos) {
      // 百分比存储
      const storePercentPos = {
        x: pos.posX / window.innerWidth,
        y: pos.posY / window.innerHeight,
      };
      localStorage.setItem(projectName + '_msw-logoPos-storage', JSON.stringify(storePercentPos));
    }
  }, [pos, projectName]);

  useEffect(() => {
    //初始化时候读取本地msw位置
    resize();
  }, [resize]);
  const handlePosition = useCallback((e: any) => {
    const divRect = dragRef.current.offsetWidth;
    const maxWidth = window.innerWidth - divRect;
    const maxHeight = window.innerHeight - divRect;
    setPos({
      posX:
        e.pageX <= initPos.current.offsetInitX
          ? 0
          : e.pageX >= maxWidth
          ? maxWidth
          : e.pageX - (initPos.current.offsetInitX || 0),
      posY:
        e.pageY <= initPos.current.offsetInitY
          ? 0
          : e.pageY > maxHeight
          ? maxHeight
          : e.pageY - (initPos.current.offsetInitY || 0),
    });
  }, []);
  const onMouseDown = useCallback((e: any) => {
    clickTimeStamp.current = new Date().getTime();
    initPos.current = {
      posX: e.clientX,
      posY: e.clientY,
      offsetInitX: e.clientX - dragRef.current.getBoundingClientRect().left,
      offsetInitY: e.clientY - dragRef.current.getBoundingClientRect().top,
    };
    handlePosition(e);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseUp);
  }, []);
  const onMouseMove = useCallback((e: any) => {
    document.body.style.userSelect = 'none';
    isDragRef.current = true;
    handlePosition(e);
  }, []);
  const unbindEvent = useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseUp);
  }, []);
  const onMouseUp = useCallback(
    (e?: any) => {
      // click 点击的时候有时候时候可能会小距离位移，所以光靠mouseMove加标志可能没有用
      // 增加一点时间限制可以避免这种情况
      const upTimeStamp = new Date().getTime();
      const isClickCircle = e?.target.closest('.msw_container_circle');
      if (isClickCircle && (!isDragRef.current || upTimeStamp - clickTimeStamp.current < 200)) {
        isClickCallback?.();
      }
      document.body.style.userSelect = 'auto';
      isDragRef.current = false;
      unbindEvent();
    },
    [unbindEvent],
  );
  useEffect(() => {
    dragRef.current?.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', resize);
    return () => {
      unbindEvent();
      window.removeEventListener('resize', resize);
    };
  }, [resize]);
  return {
    dragRef,
    pos,
  };
};
