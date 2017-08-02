import React, { Component } from 'react';
import './App.css';
import ReactCountdownClock from 'react-countdown-clock';
import AWS from 'aws-sdk';
import AWSIoTData from 'aws-iot-device-sdk';

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
    this.handleNewThingState = this.handleNewThingState.bind(this);
    this.getThingState = this.getThingState.bind(this);
    this.shadowRegistered = false;
    AWS.config.update({
      region: process.env.REACT_APP_Region,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: process.env.REACT_APP_IdentityPoolId
      })
    });
    this.thingName = process.env.REACT_APP_THING_NAME;
    // this.iotdata = new AWS.IotData({
    //   endpoint: process.env.REACT_APP_IOT_ENDPOINT,
    // });
  }
  componentDidMount() {
    //
    // Create the AWS IoT shadows object.  Note that the credentials must be
    // initialized with empty strings; when we successfully authenticate to
    // the Cognito Identity Pool, the credentials will be dynamically updated.
    //
    this.shadows = AWSIoTData.thingShadow({
       //
       // Set the AWS region we will operate in.
       //
       region: AWS.config.region,
       //
       //Set the AWS IoT Host Endpoint
       //
       host: process.env.REACT_APP_IOT_ENDPOINT,
       //
       // Use a random client ID.
       //
       clientId: 'button/app/' + (Math.floor((Math.random() * 100000) + 1)),
       //
       // Connect via secure WebSocket
       //
       protocol: 'wss',
       //
       // Set the maximum reconnect time to 8 seconds; this is a browser application
       // so we don't want to leave the user waiting too long for reconnection after
       // re-connecting to the network/re-opening their laptop/etc...
       //
       maximumReconnectTimeMs: 8000,
       //
       // Enable console debugging information (optional)
       //
       debug: true,
       //
       // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
       // initialized with empty strings.
       //
       accessKeyId: '',
       secretKey: '',
       sessionToken: ''
    });
    console.log("this.shadows");
    console.log(this.shadows);
    var cognitoIdentity = new AWS.CognitoIdentity();
    AWS.config.credentials.get(function(err, data) {
       if (!err) {
          console.log('retrieved identity: ' + AWS.config.credentials.identityId);
          console.log(data);
          var params = {
             IdentityId: AWS.config.credentials.identityId
          };
          cognitoIdentity.getCredentialsForIdentity(params, function(err, data) {
             if (!err) {
                //
                // Update our latest AWS credentials; the MQTT client will use these
                // during its next reconnect attempt.
                //
                this.shadows.updateWebSocketCredentials(data.Credentials.AccessKeyId,
                   data.Credentials.SecretKey,
                   data.Credentials.SessionToken);
             } else {
                console.log('error retrieving credentials: ' + err);
                alert('error retrieving credentials: ' + err);
             }
          }.bind(this));
       } else {
          console.log('error retrieving identity:' + err);
          alert('error retrieving identity: ' + err);
       }
    }.bind(this));

    this.shadows.on('connect', function() {
    //
    // After connecting to the AWS IoT platform, register interest in the
    // Thing Shadow named 'button'.
    //
      if (!this.shadowRegistered) {
        console.log('registering ' + this.thingName);
        this.shadows.register(this.thingName, {}, function() {
          console.log('register callback');
          this.getThingState();
        }.bind(this));
        this.shadowRegistered = true;
      } else {
        this.getThingState();
      }
    }.bind(this));

    this.shadows.on('status', function(thingName, stat, clientToken, stateObject) {
      console.log('Operation ' + clientToken + " status: " + stat);
      if (clientToken === this.clientTokenUpdate) {
        if (stat === 'accepted') {
          this.handleNewThingState(stateObject);
        }
      } else if (clientToken === this.clientTokenGet) {
        if (stat === 'accepted') {
          this.handleNewThingState(stateObject);
        }
      }
      console.log(stateObject);
    }.bind(this));

    this.shadows.on('foreignStateChange', function(thingName, operation, stateObject) {
      console.log('foreignStateChange ' + operation);
      console.log(stateObject);
      if (operation === "update") {
        this.handleNewThingState(stateObject);
      }
    }.bind(this));
  }
  getThingState() {
    console.log("getting thing "+ this.thingName);
    this.clientTokenGet = this.shadows.get(this.thingName);
    console.log("sent request " + this.clientTokenGet);
  }
  handleNewThingState(stateObject) {
    if (stateObject.state.reported === undefined) {
      stateObject.state.reported = stateObject.state.desired;
      console.warn("no reported thing state, using desired");
    }
    var stateChanges = {thingState: stateObject, paused: false};
    if (this.state.thingState.state) console.log(this.state.thingState.state.reported.pushedAt);
    if (this.state.thingState.state === undefined || stateObject.state.reported.pushedAt !== this.state.thingState.state.reported.pushedAt) {
      stateChanges.secondsLeft = this.timeLeft(stateObject);
    }
    this.setState({secondsLeft: NaN, paused: false});
    this.setState(stateChanges);
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
    var state = {state: {desired: {pushedAt: this.nowInSeconds(), pusher: 'Anonymous App User', intervalSeconds: 60}}};
    this.clientTokenUpdate = this.shadows.update(this.thingName, state);
    //
    // The update method returns a clientToken; if non-null, this value will
    // be sent in a 'status' event when the operation completes, allowing you
    // to know whether or not the update was successful.  If the update method
    // returns null, it's because another operation is currently in progress and
    // you'll need to wait until it completes (or times out) before updating the
    // shadow.
    //
    if (this.clientTokenUpdate === null) {
      console.warn('update shadow failed, other operation still in progress');
    } else {
      console.log("Shadow service received update " + this.clientTokenUpdate);
    }
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
