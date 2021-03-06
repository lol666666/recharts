/**
 * @fileOverview Render a group of scatters
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import pureRender from '../util/PureRender';
import Layer from '../container/Layer';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes } from '../util/ReactUtils';
import Curve from '../shape/Curve';
import Symbol from '../shape/Symbol';
import Animate from 'react-smooth';
import _ from 'lodash';

const PI = Math.PI;
const SYMBOL_STYLE = { transformOrigin: 'center center' };

@pureRender
class Scatter extends Component {

  static displayName = 'Scatter';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,

    legendType: PropTypes.string,
    xAxisId: PropTypes.number,
    yAxisId: PropTypes.number,
    zAxisId: PropTypes.number,
    line: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.object, PropTypes.func, PropTypes.element,
    ]),
    lineType: PropTypes.oneOf(['fitting', 'joint']),
    className: PropTypes.string,

    activeIndex: PropTypes.number,
    activeShape: PropTypes.oneOfType([
      PropTypes.object, PropTypes.func, PropTypes.element,
    ]),
    shape: PropTypes.oneOfType([
      PropTypes.oneOf(['circle', 'cross', 'diamond', 'square', 'star', 'triangle', 'wye']),
      PropTypes.element,
      PropTypes.func,
    ]),
    points: PropTypes.arrayOf(PropTypes.shape({
      cx: PropTypes.number,
      cy: PropTypes.number,
      size: PropTypes.number,
      payload: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      }),
    })),
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    fill: '#fff',
    xAxisId: 0,
    yAxisId: 0,
    zAxisId: 0,
    legendType: 'scatter',
    lineType: 'joint',
    data: [],
    onClick() {},
    onMouseEnter() {},
    onMouseLeave() {},
    shape: 'circle',
  };

  state = {
    activeIndex: -1,
  };

  handleSymbolMouseEnter(data, index, e) {
    const { onMouseEnter } = this.props;

    if (onMouseEnter) {
      onMouseEnter(data, index, e);
    }
  }

  handleSymbolMouseLeave = () => {
    const { onMouseLeave } = this.props;

    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  handleSymbolClick(data, index, e) {
    const { onClick } = this.props;

    if (onClick) {
      onClick(data, index, e);
    }
  }

  renderSymbolItem(option, props) {
    let symbol;

    if (React.isValidElement(option)) {
      symbol = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      symbol = option(props);
    } else {
      symbol = <Symbol {...props} type={option}/>;
    }

    return symbol;
  }


  renderSymbols() {
    const { points, shape, activeShape, activeIndex } = this.props;
    const baseProps = getPresentationAttributes(this.props);

    return points.map((entry, i) => {
      const props = {
        key: `symbol-${i}`,
        ...baseProps,
        ...entry,
      };
      return (
        <Layer
          className="recharts-scatter-symbol"
          onMouseEnter={this.handleSymbolMouseEnter.bind(this, entry, i)}
          onMouseLeave={this.handleSymbolMouseLeave}
          onClick={this.handleSymbolClick.bind(this, entry, i)}
          key={`symbol-${i}`}
        >
          {this.renderSymbolItem(activeIndex === i ? activeShape : shape, props)}
        </Layer>
      );
    });
  }

  renderLine() {
    const { points, line, lineType } = this.props;
    const scatterProps = getPresentationAttributes(this.props);
    const customLineProps = getPresentationAttributes(line);
    let linePoints;

    if (lineType === 'joint') {
      linePoints = points.map(entry => ({ x: entry.cx, y: entry.cy }));
    }
    const lineProps = {
      ...scatterProps,
      fill: 'none',
      stroke: scatterProps.fill,
      ...customLineProps,
      points: linePoints,
    };
    let lineItem;
    if (React.isValidElement(line)) {
      lineItem = React.cloneElement(line, lineProps);
    } else if (_.isFunction(line)) {
      lineItem = line(lineProps);
    } else {
      lineItem = <Curve {...lineProps} />;
    }

    return (
      <Layer className="recharts-scatter-line" key="recharts-scatter-line">
        {lineItem}
      </Layer>
    );
  }

  render() {
    const { points, line, className } = this.props;

    if (!points || !points.length) { return null; }

    const layerClass = classNames('recharts-scatter', className);

    return (
      <Layer className={layerClass}>
        {line && this.renderLine()}
        <Layer key="recharts-scatter-symbols">
          {this.renderSymbols()}
        </Layer>
      </Layer>
    );
  }
}

export default Scatter;
