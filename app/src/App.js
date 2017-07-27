import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReactCountdownClock from 'react-countdown-clock';


class App extends Component {
  constructor() {
    super();
    this.state = {
      pushedAt: Math.floor(Date.now() / 1000) - 100,
      pusher: 'anonymous pusher'
    };
    this.pushButton = this.pushButton.bind(this);
    this.countdownZero = this.countdownZero.bind(this);
  }
  render() {
    return (
      <div className="App">
        <div className="App-canvasContainer">
          <ReactCountdownClock seconds={this.timeLeft().rawSeconds}
                               color="#000"
                               alpha={0.9}
                               size={250}
                               onComplete={this.countdownZero} />
        </div>
      </div>
    );
  }
  pushButton() {

  }

  countdownZero() {
    //alert("zero");
  }

  nowInSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  timeLeft() {
    var secondsLeft = this.nowInSeconds() - this.state.pushedAt;
    return {rawSeconds: secondsLeft, minutes: Math.floor(secondsLeft/60), seconds: secondsLeft % 60};
  }

}

export default App;
