import React, {
  useEffect,
  MouseEventHandler,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

export const UIPanel: React.FC<{
  children?: React.ReactNode;
  className?: string;
  borderClassName?: string;
  style?: React.CSSProperties;

  movable?: boolean;
  resizable?: boolean;

  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onAnimationEnd?: React.AnimationEventHandler<HTMLDivElement>;
  onClickOutside?: () => void;
}> = ({
  children,
  className,
  borderClassName = "border-gray-600",
  style,
  onClick,
  onMouseDown,
  onMouseUp,
  onAnimationEnd,
  onClickOutside,
}) => {
  const selfRef = useRef<HTMLDivElement>();

  // const onMouseDown = (): void => {};

  // const onMouseUp = (): void => {};

  useEffect(() => {
    if (onClickOutside) {
      const documentClickHandler = (event: MouseEvent): void => {
        if (selfRef.current && !selfRef.current.contains(event.target as any)) {
          onClickOutside();
        }
      };
      document.addEventListener("mousedown", documentClickHandler);
      return () => {
        document.removeEventListener("mousedown", documentClickHandler);
      };
    }
  }, [onClickOutside]);

  useEffect(() => {}, []);

  return (
    <div
      ref={selfRef}
      onAnimationEnd={onAnimationEnd}
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        // border-blue-600
        // borderWidth: "1px solid rgba(72,72,72,0.8)",
        borderWidth: 1,
        borderStyle: "solid",
        ...(style ? style : {}),
      }}
      className={`relative text-white rounded-md ${borderClassName} border-opacity-45 text-xs ${className}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const Borders: any = ({ directionRef, onMouseDown }: any): any => {
  return (
    <>
      <div
        className="cursor-row-resize"
        style={{
          position: "absolute",
          top: 0,
          left: 0,

          width: "100%",
          height: 2,
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.TOP;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
      <div
        className="cursor-row-resize"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 2,
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.BOTTOM;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
      <div
        className="cursor-col-resize"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 2,
          height: "100%",
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.LEFT;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
      <div
        className="cursor-col-resize"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 2,
          height: "100%",
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.RIGHT;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>

      <div
        className="cursor-nwse-resize"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 5,
          height: 5,
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.TOP_LEFT;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
      <div
        className="cursor-nesw-resize"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 5,
          height: 5,
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.BOTTOM_LEFT;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
      <div
        className="cursor-nwse-resize"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 5,
          height: 5,
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.BOTTOM_RIGHT;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
      <div
        className="cursor-nesw-resize"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 5,
          height: 5,
        }}
        onMouseDown={(event) => {
          directionRef.current = DIRECTIONS.TOP_RIGHT;
          onMouseDown(event);
        }}
        onMouseUp={() => (directionRef.current = null)}
      ></div>
    </>
  );
};

export const UIPanelHeader: React.FC<{
  children?: React.ReactNode;
  className?: string;

  onMouseDown?: MouseEventHandler;
  onMouseUp?: MouseEventHandler;

  onClose?: () => void;
}> = ({ children, className, onMouseDown, onMouseUp, onClose }) => {
  return (
    <div
      style={{ userSelect: "none", padding: "10px 40px" }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      className={`flex justify-center items-center gap-2 relative ${className}`}
    >
      {onClose && (
        <div
          onClick={onClose}
          className="absolute bg-red-400 hover:bg-red-500 active:bg-red-600"
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            top: "50%",
            transform: "translateY(-50%)",
            left: 10,
          }}
        ></div>
      )}
      <div>{children}</div>
    </div>
  );
};

export const ObjectListItem: React.FC<{
  children?: React.ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
}> = ({ children, className, onClick, style }) => {
  return (
    <div
      style={style}
      onClick={onClick}
      role="button"
      className={`bg-gray-400 hover:bg-gray-500 cursor-default ${className}`}
    >
      {children}
    </div>
  );
};

const DIRECTIONS = {
  TOP: 1,
  RIGHT: 2,
  BOTTOM: 3,
  LEFT: 4,

  TOP_RIGHT: 5,
  BOTTOM_RIGHT: 6,
  BOTTOM_LEFT: 7,
  TOP_LEFT: 8,
} as const;

export const uiHeaderHeight = 36;

export const Window: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;

  top?: number;
  left?: number;

  width?: number;
  height?: number;

  title?: string;

  onClose?: () => void;
  focused?: boolean;

  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onAnimationEnd?: React.AnimationEventHandler<HTMLDivElement>;
  onClickOutside?: () => void;
  className?: string;

  resizable?: boolean;
}> = forwardRef(
  (
    {
      style,
      children,
      top = 0,
      left = 0,

      width = 800,
      height = 600,

      title = "",
      onClose,
      focused = false,
      resizable = true,
      onClick,
      onMouseDown: onMouseDownFromParams,
      onAnimationEnd,
      onClickOutside,
      className,
    },
    ref,
  ) => {
    const mouseDownRef = useRef({
      isDown: false,
      clientX: 0,
      clientY: 0,
      initialTop: 0,
      initialLeft: 0,
      initialWidth: 0,
      initialHeight: 0,
    });
    const directionRef = useRef(0);
    const [topLeft, setTopLeft] = useState({ top: top, left: left });
    const [widthHeight, setWidthHeight] = useState({
      width: width,
      height: height,
    });

    useImperativeHandle(ref, () => {
      return {
        setTopLeft: (newTopLeft) => {
          setTopLeft(newTopLeft);
        },
        setWidthHeight: (newWidthHeight) => {
          setWidthHeight(newWidthHeight);
        },
      };
    });

    const onMouseDown: MouseEventHandler = (event): void => {
      mouseDownRef.current.isDown = true;
      mouseDownRef.current.clientX = event.clientX;
      mouseDownRef.current.clientY = event.clientY;

      mouseDownRef.current.initialTop = topLeft.top;
      mouseDownRef.current.initialLeft = topLeft.left;

      mouseDownRef.current.initialWidth = widthHeight.width;
      mouseDownRef.current.initialHeight = widthHeight.height;
    };

    useEffect(() => {
      const mouseMoveHandler = (event: MouseEvent): void => {
        if (!mouseDownRef.current.isDown) {
          return;
        }

        // Prevent text selection
        event.preventDefault();

        const { clientX, clientY } = event;

        const diffX = clientX - mouseDownRef.current.clientX;
        const diffY = clientY - mouseDownRef.current.clientY;

        const nextX = mouseDownRef.current.initialLeft + diffX;
        const nextY = mouseDownRef.current.initialTop + diffY;

        if (directionRef.current) {
          switch (directionRef.current) {
            case DIRECTIONS.TOP: {
              const nextHeight = mouseDownRef.current.initialHeight - diffY;

              setWidthHeight({
                width: mouseDownRef.current.initialWidth,
                height: nextHeight,
              });
              setTopLeft({
                top: nextY,
                left: mouseDownRef.current.initialLeft,
              });
              break;
            }
            case DIRECTIONS.RIGHT: {
              // const nextHeight = mouseDownRef.current.initialHeight + diffY;
              const nextWidth = mouseDownRef.current.initialWidth + diffX;

              setWidthHeight({
                width: nextWidth,
                height: mouseDownRef.current.initialHeight,
              });
              // setTopLeft({
              //   top: nextY,
              //   left: mouseDownRef.current.initialLeft,
              // });
              break;
            }
            case DIRECTIONS.BOTTOM: {
              const nextHeight = mouseDownRef.current.initialHeight + diffY;

              setWidthHeight({
                width: mouseDownRef.current.initialWidth,
                height: nextHeight,
              });
              break;
            }
            case DIRECTIONS.LEFT: {
              // const nextHeight = mouseDownRef.current.initialHeight + diffY;
              const nextWidth = mouseDownRef.current.initialWidth - diffX;

              setWidthHeight({
                width: nextWidth,
                height: mouseDownRef.current.initialHeight,
              });
              setTopLeft({
                top: mouseDownRef.current.initialTop,
                left: nextX,
              });
              break;
            }
            case DIRECTIONS.TOP_RIGHT: {
              const nextHeight = mouseDownRef.current.initialHeight - diffY;
              const nextWidth = mouseDownRef.current.initialWidth + diffX;

              setWidthHeight({
                width: nextWidth,
                height: nextHeight,
              });
              setTopLeft({
                top: nextY,
                left: mouseDownRef.current.initialLeft,
              });
              break;
            }
            case DIRECTIONS.BOTTOM_RIGHT: {
              const nextHeight = mouseDownRef.current.initialHeight + diffY;
              const nextWidth = mouseDownRef.current.initialWidth + diffX;

              setWidthHeight({
                width: nextWidth,
                height: nextHeight,
              });
              // setTopLeft({
              //   top: mouseDownRef.current.initialTop,
              //   left: nextX,
              // });
              break;
            }
            case DIRECTIONS.BOTTOM_LEFT: {
              const nextHeight = mouseDownRef.current.initialHeight + diffY;
              const nextWidth = mouseDownRef.current.initialWidth - diffX;

              setWidthHeight({
                width: nextWidth,
                height: nextHeight,
              });
              setTopLeft({
                top: mouseDownRef.current.initialTop,
                left: nextX,
              });
              break;
            }
            case DIRECTIONS.TOP_LEFT: {
              const nextHeight = mouseDownRef.current.initialHeight - diffY;
              const nextWidth = mouseDownRef.current.initialWidth - diffX;

              setWidthHeight({
                width: nextWidth,
                height: nextHeight,
              });
              setTopLeft({
                top: nextY,
                left: nextX,
              });
              break;
            }
          }
        } else {
          setTopLeft({
            top: nextY,
            left: nextX,
          });
        }
      };

      const mouseUpHandler = (): void => {
        mouseDownRef.current.isDown = false;

        mouseDownRef.current.clientX = 0;
        mouseDownRef.current.clientY = 0;

        mouseDownRef.current.initialTop = 0;
        mouseDownRef.current.initialLeft = 0;
        mouseDownRef.current.initialLeft = 0;
        directionRef.current = 0;
      };

      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", mouseUpHandler);

      return () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
      };
    }, []);

    return (
      <UIPanel
        onClickOutside={onClickOutside}
        onClick={onClick}
        onMouseDown={onMouseDownFromParams}
        onAnimationEnd={onAnimationEnd}
        className={`${focused ? "border-opacity-100" : ""} ${className ? className : ""}`}
        borderClassName={focused ? "border-gray-100" : undefined}
        style={{
          top: topLeft.top,
          left: topLeft.left,

          width: widthHeight.width,
          height: widthHeight.height,

          position: "absolute",

          ...(focused
            ? {
                zIndex: 1,
              }
            : {}),
          ...(style ? style : {}),
        }}
      >
        <UIPanelHeader onClose={onClose} onMouseDown={onMouseDown}>
          {title}
        </UIPanelHeader>
        <div
          style={{
            padding: 10,
            height: `calc(100% - ${uiHeaderHeight}px)`,
            maxHeight: `calc(100% - ${uiHeaderHeight}px)`,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
        {resizable && (
          <Borders onMouseDown={onMouseDown} directionRef={directionRef} />
        )}
      </UIPanel>
    );
  },
);
Window.displayName = "Window";
