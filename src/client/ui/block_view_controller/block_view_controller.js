import React from 'react';

export default class BlockViewController extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="BVC"></div>
    );
  }
}
