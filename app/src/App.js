import React, { Component } from 'react';
import './App.css';
import ReactCountdownClock from 'react-countdown-clock';
import AWS from 'aws-sdk';

class App extends Component {
  constructor() {
    super();
    this.state = {
      thingState: {},
      secondsLeft: NaN,
      paused: true
    };
    this.pushButton = this.pushButton.bind(this);
    this.countdownZero = this.countdownZero.bind(this);
    this.tick = this.tick.bind(this);
    AWS.config.update({
      region: process.env.REACT_APP_Region,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: process.env.REACT_APP_IdentityPoolId
      })
    });
    this.thingName = process.env.REACT_APP_THING_NAME;
    this.iotdata = new AWS.IotData({
      endpoint: process.env.REACT_APP_IOT_ENDPOINT,
    });
  }
  componentDidMount() {
    this.tick();
    this.timer = setInterval(this.tick, 1000);
  }
  componentWillUnmount () {
      clearInterval(this.timer);
  }
  render() {
    return (
      <div className="App">
        <div className="App-canvasContainer">
          <ReactCountdownClock ref={(countdown) => { this._countdown = countdown; }}
                               seconds={this.state.secondsLeft}
                               paused={this.state.paused}
                               pausedText="▐▐ "
                               color="#000"
                               alpha={0.9}
                               size={250}
                               onComplete={this.countdownZero}
                               onClick={this.pushButton}
                               />
        </div>
      </div>
    );
  }

  pushButton() {
    this.setState({secondsLeft: NaN});
    this.setState({secondsLeft: 60});
    var params = {
      payload: JSON.stringify({state: {desired: {pushedAt: this.nowInSeconds(), pusher: 'Anonymous App User', intervalSeconds: 60}}}),
      thingName: this.thingName
    };
    this.iotdata.updateThingShadow(params, function(err, data) {
      if (err) console.warn(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  }

  tick() {
    this.iotdata.getThingShadow({thingName: this.thingName}, function(err, data) {
      if (err) {
        console.warn(err, err.stack);
      }
      else {
        var payload = JSON.parse(data.payload);
        // console.log("data from thing shadow");
        // console.log(payload);
        if (payload.state.reported === undefined) {
          payload.state.reported = payload.state.desired;
          console.warn("no reported thing state, using desired");
        }
        var stateChanges = {thingState: payload, paused: false};
        if (this.state.thingState.state) console.log(this.state.thingState.state.reported.pushedAt);
        if (this.state.thingState.state === undefined || payload.state.reported.pushedAt !== this.state.thingState.state.reported.pushedAt) {
          stateChanges.secondsLeft = this.timeLeft(payload);
        }
        this.setState(stateChanges);
      }
    }.bind(this));
  }

  countdownZero() {
    //alert("zero");
  }

  nowInSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  timeLeft(thingState) {
    if (thingState.state && thingState.state.reported && thingState.state.reported.pushedAt) {
      var secondsLeft = (thingState.state.reported.pushedAt + thingState.state.reported.intervalSeconds) - this.nowInSeconds();
      secondsLeft = secondsLeft < 0 ? 0 : secondsLeft;
      return secondsLeft;
    } else {
      console.log("No reported thing state, returning secondsLeft as NaN :(");
      return NaN
    }
  }
}

export default App;
