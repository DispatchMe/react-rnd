import React from "react";
import Draggable from "react-draggable";
import Resizable from "@dispatch/re-resizable";

const resizableStyle = {
  width: "auto",
  height:  "auto",
  display:  "inline-block",
  position:  "absolute",
  top: 0,
  left: 0,
};

export class Rnd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: (props.position && props.position.x) || (props.defaultPosition && props.defaultPosition.x) || 0,
      y: (props.position && props.position.y) || (props.defaultPosition && props.defaultPosition.y) || 0,
      bounds: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    };

    this.onResizeStart = this.onResizeStart.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
  }

  getParent() {
    return this.resizable && (this.resizable).parentNode;
  }

  getStatePosition() {
    return {
      x: this.state.x,
      y: this.state.y,
    };
  }

  getStateSize() {
    return {
      width: this.state.width,
      height: this.state.height,
    };
  }

  getPosition() {
    return this.props.position || this.getStatePosition();
  }

  getSize() {
    return this.props.size || this.getStateSize();
  }

  getUpdatedPositionForResize(direction, delta) {
    const unconsumedDelta = {
      width: delta.width - this.consumedResizeDelta.width,
      height: delta.height - this.consumedResizeDelta.height,
    };

    this.consumedResizeDelta = delta;

    const currentPosition = this.getPosition();
    const currentSize = this.getSize();
    const updatedPosition = { ...currentPosition, ...currentSize };

    if (direction === 'left' || direction === 'topLeft') {
      updatedPosition.x = updatedPosition.x - unconsumedDelta.width;
    }
    if (direction === 'top' || direction === 'topLeft') {
      updatedPosition.y = updatedPosition.y - unconsumedDelta.height;
    }

    updatedPosition.width += unconsumedDelta.width;
    updatedPosition.height += unconsumedDelta.height;

    return updatedPosition;
  }

  getSelfElement(){
    return this.resizable && this.resizable.resizable;
  }

  initiateElementOffset(event, data) {
    const currentElementOffset = this.getOffsetFromParent();
    data.parentScrollX = currentElementOffset.parentScrollX;
    data.parentScrollY = currentElementOffset.parentScrollY;
    data.mouseOffsetX = event.clientX - currentElementOffset.x - currentElementOffset.parentX;
    data.mouseOffsetY = event.clientY - currentElementOffset.y - currentElementOffset.parentY;
    data.parentX = currentElementOffset.parentX;
    data.parentY = currentElementOffset.parentY;
    data.relativeMouseX = event.clientX - data.parentX + data.parentScrollX;
    data.relativeMouseY = event.clientY - data.parentY + data.parentScrollY;
    this.initialOffsetInfo = data;
    return data;
  }

  updateElementOffset(event, data) {
    const currentElementOffset = this.getOffsetFromParent(true);
    data.parentX = currentElementOffset.parentX;
    data.parentY = currentElementOffset.parentY;
    data.parentScrollX = currentElementOffset.parentScrollX;
    data.parentScrollY = currentElementOffset.parentScrollY;
    data.relativeMouseX = event.clientX - data.parentX + data.parentScrollX;
    data.relativeMouseY = event.clientY - data.parentY + data.parentScrollY;

    data.mouseOffsetX = this.initialOffsetInfo.mouseOffsetX;
    data.mouseOffsetY = this.initialOffsetInfo.mouseOffsetY;
    return data;
  }

  onDragStart(e, data) {
    this.initiateElementOffset(e, data);

    if (this.props.onDragStart) this.props.onDragStart(e, data);
  }

  onDrag(e, data) {
    this.updateElementOffset(e, data);

    if (!this.isContolled()) this.setState({ x: data.x, y: data.y });

    if (this.props.onDrag) this.props.onDrag(e, data);
  }

  onDragStop(e, data) {
    this.updateElementOffset(e, data);

    if (!this.isContolled()) this.setState({ x: data.x, y: data.y });

    if (this.props.onDragStop) this.props.onDragStop(e, data);
  }

  onResizeStart(e, dir, elementRef) {
    const data = {};
    this.initiateElementOffset(e, data);
    this.consumedResizeDelta = { width: 0, height: 0 };
    this.resizeStartPosition = this.getPosition();
    e.stopPropagation();
    if (this.props.onResizeStart) this.props.onResizeStart(e, dir, elementRef, data);
  }

  onResize(e, direction, elementRef, data) {
    this.updateElementOffset(e, data);
    const updatedPosition = this.getUpdatedPositionForResize(direction, data);
    data.position = updatedPosition;
    if (!this.isContolled()) this.setState(updatedPosition);
    if (this.props.onResize) this.props.onResize(e, direction, elementRef, data);
  }

  onResizeStop(e, direction, elementRef, data) {
    this.updateElementOffset(e, data);
    const updatedPosition = this.getUpdatedPositionForResize(direction, data);
    data.position = updatedPosition;
    if (!this.isContolled()) this.setState(updatedPosition);
    if (this.props.onResizeStop) this.props.onResizeStop(e, direction, elementRef, data);
  }

  isContolled() {
    return !!this.props.position;
  }

  isSizeControlled() {
    return !!this.props.size;
  }

  updateSize(size) {
    if (!this.resizable) return;
    this.resizable.updateSize({ width: size.width, height: size.height });
  }

  updatePosition(position) {
    this.draggable.setState(position);
  }

  getOffsetFromParent(useCachedOffset = false) {
    const parent = this.getParent();
    const parentRect = parent ? parent.getBoundingClientRect() : { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };
    const selfRect = !useCachedOffset && this.getSelfElement().getBoundingClientRect();

    this.initialOffset = {
      x: useCachedOffset ? this.initialOffset.x : (selfRect.x - parentRect.x),
      y: useCachedOffset ? this.initialOffset.y : (selfRect.y - parentRect.y),
      parentX: parentRect.x,
      parentY: parentRect.y,
      parentScrollX: parent.scrollLeft,
      parentScrollY: parent.scrollTop,
    };

    return this.initialOffset;
  }

  getStyle() {
    const {
      disableDragging,
      style,
      dragHandleClassName,
    } = this.props;

    const result = resizableStyle;
    resizableStyle.cursor = (disableDragging || dragHandleClassName) ? "auto" : "move";
    if (style) {
      return Object.assign({}, result, style);
    }
    return result;
  }

  refResizable = (ref) => {
    this.resizable = ref;
  }

  refDraggable = (ref) => {
    this.draggable = ref;
  }

  render() {
    const {
      disableDragging,
      dragHandleClassName,
      onMouseDown,
      dragAxis,
      dragGrid,
      bounds,
      enableUserSelectHack,
      cancel,
      children,
      resizeHandleStyles,
      resizeHandleClasses,
      enableResizing,
      resizeGrid,
      resizeHandleWrapperClass,
      resizeHandleWrapperStyle,
      default: defaultValue,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      lockAspectRatio,
      lockAspectRatioExtraWidth,
      lockAspectRatioExtraHeight,
      size,
      onClick,
      onMouseUp,
    } = this.props;

    const innerStyle = this.getStyle();

    return (
      <Draggable
        ref={this.refDraggable}
        handle={dragHandleClassName ? `.${dragHandleClassName}` : undefined}
        defaultPosition={defaultValue}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onStart={this.onDragStart}
        onDrag={this.onDrag}
        onStop={this.onDragStop}
        axis={dragAxis}
        disabled={disableDragging}
        grid={dragGrid}
        bounds={bounds}
        position={this.getPosition()}
        enableUserSelectHack={enableUserSelectHack}
        cancel={cancel}
      >
        <Resizable
          ref={this.refResizable}
          defaultSize={defaultValue}
          size={size}
          enable={enableResizing}
          onResizeStart={this.onResizeStart}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          style={innerStyle}
          minWidth={minWidth}
          minHeight={minHeight}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          grid={resizeGrid}
          handleWrapperClass={resizeHandleWrapperClass}
          handleWrapperStyle={resizeHandleWrapperStyle}
          lockAspectRatio={lockAspectRatio}
          lockAspectRatioExtraWidth={lockAspectRatioExtraWidth}
          lockAspectRatioExtraHeight={lockAspectRatioExtraHeight}
          handleStyles={resizeHandleStyles}
          handleClasses={resizeHandleClasses}
          onClick={onClick}
        >
          {children}
        </Resizable>
      </Draggable>
    );
  }
}
