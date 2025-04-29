import "./radio.css";
import React from "react";
import Hls from "hls.js";
import $ from "jquery";
import "jquery.marquee";
import axios from "axios";
import NavigationMenu from "./navigationMenu";
const cheerio = require("cheerio");

const loading_img = require("../images/loading.png");
const loaded_img = require("../images/ready.png");

function get_bloomberg() {
  var url =
    "https://playerservices.streamtheworld.com/api/livestream?transports=hls&version=1.8&mount=WBBRAMAAC48";
  //this url is used to retrieve the bloomberg stream url

  return new Promise(function (resolve, reject) {
    axios.get(url).then(function (response) {
      var body = cheerio.load(response.data, { xmlMode: true });
      var transport_suf = body("transport");
      console.log(`transport_suf=${transport_suf}`);
      var server_ip = body("server ip");
      console.log(`server_ip=${server_ip}`);
      var mount = body("mount");
      console.log(`mount=${mount}`);
      var playlistUrl = `https://${server_ip
        .first()
        .text()}/${mount.text()}${transport_suf.attr("mountSuffix")}`;
      console.log(`playlistUrl=${playlistUrl}`);
      resolve(playlistUrl);
    });
  });
}

class Radio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stream_url: "Loading...",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
    };
  }

  setupPlayer() {
    return new Promise(function (resolve, reject) {
      get_bloomberg().then(function (playlistUrl) {
        axios.get(playlistUrl).then(function (response) {
          var body = response.data.toString();
          console.log(body);
          var http_search = body.search("https://");
          console.log(http_search);
          var sessionStreamUrl = body.slice(http_search).split("\n")[0];
          console.log(playlistUrl);
          console.log(`bloomberg radio session stream=${sessionStreamUrl}`);

          let bloomberg_stream = document.getElementById("bloomberg_stream");
          if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(sessionStreamUrl);
            hls.attachMedia(bloomberg_stream);
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
              bloomberg_stream.muted = false;
              bloomberg_stream.poster = loaded_img;
              resolve(sessionStreamUrl);
            });
          } else {
            reject();
          }
        });
      });
    });
  }

  showMarquee() {
    this.$el
      .marquee({
        duration: 10000,
        delayBeforeStart: 0,
      })
      .bind("finished", () => {
        this.$el.marquee("destroy");
        document.getElementById("marquee").innerHTML = this.state.stream_url;
        this.showMarquee();
      });
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
    let self = this;
    let local_mode = localStorage.getItem("mode");
    if (local_mode !== null) {
      this.changeColor(local_mode);
    } else {
      this.changeColor(this.state.mode);
    }
    this.setupPlayer().then(function (url) {
      console.log(url);
      self.setState({ stream_url: `Streaming at ${url}` }, function () {
        self.showMarquee();
      });
    });
  }

  render() {
    return (
      <div id="root">
        <NavigationMenu
          title={"Bloomberg Radio"}
          additional={{ darkMode: true, music: true, dictation: false }}
        />
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

        <div id="stream-container">
          <video
            style={{ backgroundColor: "#FF0000" }}
            controls
            poster={loading_img}
            id="bloomberg_stream"
          ></video>
        </div>
      </div>
    );
  }
}

export default Radio;
