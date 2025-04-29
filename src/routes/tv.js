import React from "react";
import Hls from "hls.js";
import axios from "axios";
import NavigationMenu from "./navigationMenu";

export default class Tv extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: "hello",
      hls: new Hls(),
      stream_Url:
        "https://www.bloomberg.com/media-manifest/streams/phoenix-us.m3u8",
      stream_Url1: "",
      streamInfos: [],
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
    };

    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleStreamSettingsChange =
      this.handleStreamSettingsChange.bind(this);
  }

  changeColor = (mode) => {
    localStorage.setItem("mode", mode);
    this.setState({ mode: mode });
    let color = "";
    let emojiMode = document.getElementById("modeEmoji");
    let body = document.body;

    if (mode == "dark") {
      color = "#000000";
      //emojiMode.innerHTML = this.state.modeEmojis[mode];
    } else if (mode == "light") {
      color = "#FFFFFF";
      //emojiMode.innerHTML = this.state.modeEmojis[mode];
    }

    body.style.backgroundColor = color;

    if (emojiMode !== null) {
      emojiMode.innerHTML = this.state.modeEmojis[mode];
    }
  };

  handleSourceChange(event) {
    let euUrl = "https://www.bloomberg.com/media-manifest/streams/eu.m3u8";
    let usUrl =
      "https://www.bloomberg.com/media-manifest/streams/phoenix-us.m3u8";

    let choice = event.target.value;
    if (choice !== null) {
      console.log(`choice=${choice}`);
      if (choice == "europe") {
        this.setState({ stream_Url: euUrl }, function () {
          console.log(this.state.stream_Url);
          this.collectStreamInfo();
        });
      } else if (choice == "us") {
        this.setState({ stream_Url: usUrl }, function () {
          console.log(this.state.stream_Url);
          this.collectStreamInfo();
        });
      }
    }
  }

  handleStreamSettingsChange(event) {
    let choice1 = event.target.value;
    if (choice1 !== null) {
      console.log(choice1);
      this.setState({ stream_Url1: choice1 });
    }
  }

  setupPlayer() {
    let self = this;
    let streamUrl1 = this.state.stream_Url1;
    console.log("streamURL1");
    console.log(streamUrl1);
    let bloomberg_stream = document.getElementById("bloomberg_stream");
    if (Hls.isSupported() && streamUrl1 !== null) {
      var hls = this.state.hls;
      console.log(bloomberg_stream);
      if (hls !== null && bloomberg_stream !== null) {
        hls.loadSource(streamUrl1);
        hls.attachMedia(bloomberg_stream);
        hls.on(Hls.Events.MEDIA_PARSED, function () {
          bloomberg_stream.muted = false;
        });
      }
    }
  }

  collectStreamInfo() {
    let self = this;
    axios.get(this.state.stream_Url).then(function (response) {
      let body = response.data;
      if (body !== null) {
        let split_arr = body.split(/\r?\n/);
        let infObjs = [];
        for (let i = 0; i < split_arr.length; i++) {
          if (
            split_arr[i].search("BANDWIDTH") !== -1 &&
            split_arr[i].search("RESOLUTION") !== -1
          ) {
            var infObj = new Object();
            let bw = split_arr[i].split("BANDWIDTH=")[1].split(",")[0];
            let res = split_arr[i].split("RESOLUTION=")[1].split(",")[0];
            let codecs = split_arr[i].split('CODECS="')[1].split('"')[0];
            infObj["bw"] = bw;
            infObj["res"] = res;
            infObj["codecs"] = codecs;
            infObj["streamUrl"] = split_arr[i + 1];
            infObjs.push(infObj);
          }
        }
        self.setState({ streamInfos: infObjs }, function () {
          console.log(self.state.streamInfos);
          let choice1 = document.getElementById("choice1").value;
          if (choice1 !== null) {
            console.log(choice1);
            this.setState({ stream_Url1: choice1 });
          }
        });
      }
    });
  }

  componentDidMount() {
    this.collectStreamInfo();
    document.body.style.backgroundImage = "none";
    let local_mode = localStorage.getItem("mode");
    console.log(`mode=${localStorage.getItem("mode")}`);
    if (local_mode !== null) {
      this.changeColor(local_mode);
    } else {
      this.changeColor(this.state.mode);
    }
  }

  componentDidUpdate() {
    this.setupPlayer();
  }

  render() {
    const renderFilterOptions = () => {
      if (this.state.streamInfos.length !== 0) {
        let options = this.state.streamInfos.map(function (el, i) {
          return (
            <option
              key={`${i}_i`}
              value={`${el.streamUrl}`}
            >{`BANDWITH: ${el.bw}, RESOLUTION: ${el.res}, CODECS: ${el.codecs}`}</option>
          );
        });
        return options;
      } else {
        return <option>NO OPTIONS AVAILABLE</option>;
      }
    };

    return (
      <div id="root">
        <NavigationMenu
          title={"Bloomberg TV"}
          additional={{ darkMode: true }}
        />

        <div
          style={{
            justifyContent: "center",
            textAlign: "center",
            paddingBottom: "1rem",
          }}
        >
          <label>Source: </label>
          <select id="choice" onChange={this.handleSourceChange}>
            <option value="us">US</option>
            <option value="europe">EUROPE</option>
          </select>
        </div>
        <div style={{ justifyContent: "center", textAlign: "center" }}>
          <label>Stream settings: </label>
          <select id="choice1" onChange={this.handleStreamSettingsChange}>
            {renderFilterOptions()}
          </select>
        </div>
        <div
          id="stream-container"
          style={{
            justifyContent: "center",
            textAlign: "center",
            paddingTop: "10rem",
          }}
        >
          <video
            style={{ backgroundColor: "#FF0000" }}
            controls
            id="bloomberg_stream"
          ></video>
        </div>
      </div>
    );
  }
}
