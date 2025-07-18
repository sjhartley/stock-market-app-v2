import "./radio.css";
import React from "react";
import Hls from "hls.js";
import axios from "axios";
import NavigationMenu from "./navigationMenu";
import "./radio.css";
import $ from "jquery";
import "jquery.marquee";
import SnowBackground from "./SnowBackground";

const cheerio = require("cheerio");

function get_bloomberg() {
  const url =
    "https://playerservices.streamtheworld.com/api/livestream?transports=hls&version=1.8&mount=WBBRAMAAC48";

  return axios.get(url).then((response) => {
    const body = cheerio.load(response.data, { xmlMode: true });
    const server_ip = body("server ip").first().text();
    const mount = body("mount").text();
    const transport_suf = body("transport").attr("mountSuffix");
    return `https://${server_ip}/${mount}${transport_suf}`;
  });
}

class Radio extends React.Component {
  constructor(props) {
    super(props);
    this.audioRef = React.createRef();
    this.state = {
      playing: false,
      volume: 1.0,
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
      loading: true,
    };
  }

  changeColor = (mode) => {
    localStorage.setItem("mode", mode);
    this.setState({ mode: mode });
    let color = "";
    let emojiMode = document.getElementById("modeEmoji");
    let body = document.body;

    if (mode == "dark") {
      color = "#000000";
    } else if (mode == "light") {
      color = "#FFFFFF";
    }

    body.style.backgroundColor = color;

    if (emojiMode !== null) {
      emojiMode.innerHTML = this.state.modeEmojis[mode];
    }
  };

  componentDidMount() {
    const audio = this.audioRef.current;
    let local_mode = localStorage.getItem("mode");

    if (local_mode !== null) {
      this.changeColor(local_mode);
    } else {
      this.changeColor(this.state.mode);
    }

    get_bloomberg().then((playlistUrl) => {
      axios.get(playlistUrl).then((res) => {
        const sessionStreamUrl = res.data
          .toString()
          .match(/https:\/\/.*\.m3u8/)[0];

        const setReady = () => this.setState({ loading: false });

        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(sessionStreamUrl);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, setReady);
        } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
          audio.src = sessionStreamUrl;
          audio.addEventListener("canplay", setReady);
        }
      });
    });
  }

  togglePlay = () => {
    const audio = this.audioRef.current;
    if (this.state.playing) {
      audio.pause();
    } else {
      audio.play();
    }
    this.setState((prev) => ({ playing: !prev.playing }));
  };

  handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    this.audioRef.current.volume = volume;
    this.setState({ volume });
  };

  render() {
    return (
      <div>
        <NavigationMenu
          title={"Bloomberg Radio"}
          additional={{ darkMode: true, music: true, dictation: false }}
        />
        <SnowBackground />
        <div
          style={{
            color: "#00FF00",
            height: "30px", // 👈 Reserve vertical space
            overflow: "hidden", // 👈 Prevent content from spilling
            whiteSpace: "nowrap", // 👈 Prevent wrapping
          }}
          id="marquee"
          ref={(el) => (this.$el = $(el))}
        ></div>
        <div className="radio-card-wrapper">
          <div className="radio-card">
            {/* Image here */}
            {this.state.loading ? (
              <div className="loading-indicator">
                <img
                  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHU3NjV2dXk0MzUyeXZycnhxNG93OXo1aWllMzJoOXppMmVzOGRlOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m12EDnP8xGLy8/giphy.gif"
                  alt="loading"
                  className="radio-image"
                />
              </div>
            ) : (
              <img
                src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExczR3anhpcTIxdDRuNmxvNXA1NG14eDYwajZ3MWYzcnZnMzJnMmc2cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/78nXADhnE4BQfG4gup/giphy.gif" // adjust this path as needed
                alt="Bloomberg Radio"
                className="radio-image"
              />
            )}

            <audio ref={this.audioRef} preload="none" />
            <div className="radio-controls">
              <button onClick={this.togglePlay} className="play-button">
                {this.state.playing ? "Pause" : "Play"}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={this.state.volume}
                onChange={this.handleVolumeChange}
                className="volume-slider"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Radio;
