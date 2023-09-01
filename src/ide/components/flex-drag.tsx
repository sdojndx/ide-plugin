import React, { useCallback, useRef, useState } from 'react';
import { useIdeStore } from '../store';

interface Event {
  clientX: number;
  clientY: number;
}
export default function FlexDrag({
  className,
  dragSides,
  children,
  style,
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
  width,
  height,
  setWidth,
  setHeight
}: {
  className?: string;
  dragSides?: string[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  width?: number;
  height?: number;
  setWidth?:(width:number)=>void;
  setHeight?:(height:number)=>void;
}) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { setDragType } = useIdeStore();
  const updateWidth = useCallback((width: number) => {
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
    }
    if (minWidth && width < minWidth) {
      width = minWidth;
    }
    setWidth?.(width);
  }, [setWidth]);
  const updateHeight = useCallback((height: number) => {
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
    }
    if (minHeight && height < minHeight) {
      height = minHeight;
    }
    setHeight?.(height);
  }, [setHeight]);

  const startDrag = useCallback((event: Event, side: string) => {
    if (!contentRef.current) {
      return;
    }
    setIsActive(true);
    const orgX = event.clientX;
    const orgY = event.clientY;
    const { clientHeight, clientWidth } = contentRef.current;
    setDragType((side === 'left' || side === 'right') ? 'col' : 'row');

    const dragMove = (event: MouseEvent) => {
      // event.stopPropagation()
      event.preventDefault();
      const { clientX, clientY } = event;
      const x = clientX - orgX;
      const y = clientY - orgY;
      switch (side) {
        case 'left':
          updateWidth(clientWidth - x);
          break;
        case 'right':
          updateWidth(clientWidth + x);
          break;
        case 'top':
          updateHeight(clientHeight - y);
          break;
        case 'bottom':
          updateHeight(clientHeight + y);
          break;
        default:
          break;
      }
    };
    const dragOver = (event: MouseEvent) => {
      dragMove(event);
      setDragType(undefined);
      setIsActive(false);
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('mouseup', dragOver);
    };
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragOver);
  }, []);

  return <div className={className} ref={contentRef} style={{
    ...style,
    position: 'relative',
    width,
    height
  }}>
    {children}
    {
      dragSides?.map(side => (
        <div key={side} className={`drag_${side} drag_side ${isActive ? 'drag_active' : ''}`} onMouseDown={(event) => startDrag(event, side)}></div>
      ))
    }
  </div>;
}
