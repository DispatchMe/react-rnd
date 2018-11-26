import React from 'react';
import { Rnd } from "@dispatch/react-rnd";

import './App.css';

const snapY = [0, 75, 190, 400];
const snapX = [0,50,100,150,200,250,300,350,400,450,500,550,600,650];

function findNearestSnapY(yPosition) {
  for(let dex = 0; dex < snapY.length; dex += 1)
    if (snapY[dex] <= yPosition && (dex === snapY.length -1 || (snapY[dex + 1] > yPosition))) return snapY[dex];
  return snapY[0];
}

function findNearestSnapX(xPosition) {
  for(let dex = 0; dex < snapX.length; dex += 1)
    if (snapX[dex] <= xPosition && (dex === snapX.length -1 || (snapX[dex + 1] > xPosition))) return snapX[dex];
  return snapX[0];
}

function findNearestSnapHeight(yPosition) {
  for(let dex = 0; dex < snapY.length; dex += 1)
    if (snapY[dex] <= yPosition && (dex === snapY.length -1 || (snapY[dex + 1] > yPosition))) return snapY[dex+1] - snapY[dex];
  return 0;
}

const defaultElementHeight = 50;

class App extends React.Component {
  state = { x: 0, y: 0, width: 100, height: defaultElementHeight };
  renderSnapLines() {
    return snapY
      .map(yPosition => <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: '#444', top: `${yPosition}px`, left: '0px' }}></div>)
      .concat(snapX
        .map(xPosition => <div style={{ position: 'absolute', height: '100%', width: '1px', backgroundColor: '#444', left: `${xPosition}px`, top: '0px' }}></div>)
      );
  }
  onDrag = (domEvent, event) => {
    const { x, relativeMouseY } = event;
    console.log('relative', relativeMouseY)
    this.setState({ x, y: findNearestSnapY(relativeMouseY), height: findNearestSnapHeight(relativeMouseY) });
  }
  onDragStop = (domEvent, event) => {
    this.setState({ height: defaultElementHeight });
  }
  onResize = (domEvent, direction, element, delta) => {
    this.setState(delta.position)
  }
  render() {
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#fafafa' }}>
        <div style={{ position: 'absolute', left: '100px', top: '100px', backgroundColor: '#eaeaea', width: '500px', height: '500px', overflow: 'auto' }}>
          {this.renderSnapLines()}
          <Rnd
            default={{ width: 100, height: 100, x: 0, y: 0 }}
            onDrag={this.onDrag}
            onDragStop={this.onDragStop}
            onResize={this.onResize}
            position={{ x: this.state.x, y: this.state.y }}
            size={{ width: this.state.width, height: this.state.height }}
            resizeGrid={[50, 1]}
            dragGrid={[50, 1]}
          >
            <div style={{ width: '100%', height: '100%', backgroundColor: 'red' }}>Drag Me</div>
          </Rnd>
        </div>
      </div>
    );
  }
}

export default App;
