import React from "react";
import Hls from "hls.js";
import axios from "axios";
import NavigationMenu from "./navigationMenu";
const baseUrl = "https://www.bloomberg.com/media-manifest/streams";
const euUrl = baseUrl + "/eu.m3u8";
const usUrl = baseUrl + "/phoenix-us.m3u8";

export default class Tv extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hls: new Hls(),
      stream_Url:
        "https://www.bloomberg.com/media-manifest/streams/phoenix-us.m3u8",
      stream_Url1: "",
      streamInfos: [],
      region: "us",
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
    };

    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleStreamSettingsChange =
      this.handleStreamSettingsChange.bind(this);
  }

  changeColor = (mode) => {
    localStorage.setItem("mode", mode);
    this.setState({ mode });
    let color = mode === "dark" ? "#000000" : "#FFFFFF";
    document.body.style.backgroundColor = color;

    let emojiMode = document.getElementById("modeEmoji");
    if (emojiMode !== null) {
      emojiMode.innerHTML = this.state.modeEmojis[mode];
    }
  };

  handleSourceChange(event) {
    const choice = event.target.value;

    if (choice === "europe") {
      this.setState({ stream_Url: euUrl, region: "europe" }, () =>
        this.collectStreamInfo()
      );
    } else if (choice === "us") {
      this.setState({ stream_Url: usUrl, region: "us" }, () =>
        this.collectStreamInfo()
      );
    }
  }

  handleStreamSettingsChange(event) {
    const choice1 = event.target.value;
    if (choice1) {
      this.setState({ stream_Url1: choice1 });
    }
  }

  setupPlayer() {
    const { stream_Url1, hls } = this.state;
    const video = document.getElementById("bloomberg_stream");

    if (Hls.isSupported() && stream_Url1 && video) {
      hls.loadSource(stream_Url1);
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_PARSED, () => {
        video.muted = false;
      });
    }
  }

  collectStreamInfo() {
    axios.get(this.state.stream_Url).then((response) => {
      const body = response.data;
      if (body) {
        const split_arr = body.split(/\r?\n/);
        const infObjs = [];

        for (let i = 0; i < split_arr.length; i++) {
          if (
            split_arr[i].includes("BANDWIDTH") &&
            split_arr[i].includes("RESOLUTION")
          ) {
            const bw = split_arr[i].split("BANDWIDTH=")[1].split(",")[0];
            const res = split_arr[i].split("RESOLUTION=")[1].split(",")[0];
            const codecs = split_arr[i].split('CODECS="')[1].split('"')[0];
            const streamUrl = split_arr[i + 1];

            infObjs.push({ bw, res, codecs, streamUrl });
          }
        }

        this.setState({ streamInfos: infObjs }, () => {
          const choice1 = document.getElementById("choice1")?.value;
          if (choice1) {
            this.setState({ stream_Url1: choice1 });
          }
        });
      }
    });
  }

  handleModeChangeNavigationMenu = (newMode) => {
    this.setState({ mode: newMode });
  };

  componentDidMount() {
    this.collectStreamInfo();
    document.body.style.backgroundImage = "none";

    const local_mode = localStorage.getItem("mode");
    this.changeColor(local_mode || this.state.mode);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.stream_Url1 !== this.state.stream_Url1) {
      this.setupPlayer();
    }
  }

  render() {
    const { mode, streamInfos, stream_Url } = this.state;

    const renderFilterOptions = () => {
      return streamInfos.length ? (
        streamInfos.map((el, i) => (
          <option key={i} value={el.streamUrl}>
            BANDWIDTH: {el.bw}, RESOLUTION: {el.res}, CODECS: {el.codecs}
          </option>
        ))
      ) : (
        <option>Loading stream options...</option>
      );
    };

    return (
      <div id="root">
        <NavigationMenu
          title={"Bloomberg TV"}
          onChangeMode={this.handleModeChangeNavigationMenu}
          additional={{ darkMode: true }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginTop: "2rem",
          }}
        >
          {/* Source Selector */}
          <div style={{ textAlign: "left", minWidth: "250px" }}>
            <label
              htmlFor="choice"
              style={{
                color: mode === "dark" ? "#fff" : "#000",
                fontWeight: "bold",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              🌐 Select Region:
            </label>
            <select
              id="choice"
              onChange={this.handleSourceChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: mode === "dark" ? "#222" : "#fff",
                color: mode === "dark" ? "#fff" : "#000",
              }}
            >
              <option value="us">🇺🇸 United States</option>
              <option value="europe">🇪🇺 Europe</option>
            </select>
          </div>

          {/* Stream Settings Selector */}
          <div style={{ textAlign: "left", minWidth: "250px" }}>
            <label
              htmlFor="choice1"
              style={{
                color: mode === "dark" ? "#fff" : "#000",
                fontWeight: "bold",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              🎛 Stream Quality:
            </label>
            <select
              id="choice1"
              onChange={this.handleStreamSettingsChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: mode === "dark" ? "#222" : "#fff",
                color: mode === "dark" ? "#fff" : "#000",
              }}
            >
              {renderFilterOptions()}
            </select>
          </div>
        </div>

        <p
          style={{
            color: mode === "dark" ? "#aaa" : "#333",
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.9rem",
          }}
        >
          Currently viewing:{" "}
          <strong>
            {this.state.region == "europe" ? "Europe" : "United States"}
          </strong>{" "}
          stream
        </p>

        <div
          id="stream-container"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "4rem",
            padding: "1rem",
          }}
        >
          <video
            id="bloomberg_stream"
            controls
            style={{
              width: "90%",
              maxWidth: "800px",
              backgroundColor: "#000",
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>
      </div>
    );
  }
}
