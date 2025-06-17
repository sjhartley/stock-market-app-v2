import React, { Component, Fragment } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Switch from "react-input-switch";
import {
  IoIosHelpCircleOutline,
  IoIosMusicalNotes,
  IoIosDownload,
  IoMdMegaphone,
} from "react-icons/io";
import { IconContext } from "react-icons";
import Popover from "@mui/material/Popover";
const lobby = require("../sounds/lobby.ogg");
const lobbyAudio = new Audio(lobby);
const synth = window.speechSynthesis;
lobbyAudio.loop = true;

const menuItems = {
  Home: "/",
  "NYSE/NASDAQ data search": "/data",
  Watchlist: "/watchlist",
  "Bloomberg Radio": "/radio",
  "Bloomberg TV": "/tv",
  Charts: "/charts",
};

const StyledLink = styled(Link)`
  font-family: "Roboto", sans-serif;
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff; /* White text for better contrast against a darkened background */
  text-align: center;
  margin: 0 auto;
  padding: 10px 20px; /* Adds more padding for a balanced look */
  background-color: rgba(
    0,
    0,
    0,
    0.5
  ); /* Dark translucent background to enhance text visibility */
  background-size: cover; /* Ensure the image covers the entire background */
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Prevent the image from repeating */
  border-radius: 8px; /* Rounded corners for a polished look */
  width: fit-content; /* Ensure the background fits snugly around the text */
  // box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.5); /* Add depth with a stronger shadow */
  // text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Adds a subtle shadow to the text for better readability */
  text-decoration: none;
  &:hover {
    background-color: rgba(
      255,
      255,
      255,
      0.2
    ); /* Highlight with a lighter background */
    // box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.7); /* Add more depth on hover */
    transform: scale(1.05); /* Slightly enlarge the link for emphasis */
  }
`;

class NavigationMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      lobbyPlayHandler: true,
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
      additional: null,
      title: null,
      anchorEl: null,
    };
  }

  readoutStocks() {
    let watchlistArr = localStorage.getItem("watchlistArr");
    let utterances = [];
    utterances.push("Reading out stock market data...");
    function splitSymbol(symbol) {
      if (!symbol) return "Unknown"; // If symbol is empty, return "Unknown"
      return symbol.split("").join("-");
    }
    if (watchlistArr !== null) {
      watchlistArr = JSON.parse(watchlistArr);
      if (watchlistArr.length !== 0) {
        watchlistArr.map(function (el, i) {
          utterances.push(
            `Company Name:!${el.desc}!Symbol:!${splitSymbol(el.symbol)}!Prev:!${
              el.prev
            } dollars!`
          );
        });
      } else {
        utterances.push("No data available");
      }
      for (let i = 0; i < utterances.length; i++) {
        const i1 = i;

        let splitComma = utterances[i1].split(",");
        for (let a = 0; a < splitComma.length; a++) {
          setTimeout(function () {
            let speakThis = new SpeechSynthesisUtterance(splitComma[a]);
            speakThis.rate = 0.7;
            synth.speak(speakThis);
          }, 2000);
        }
      }
    }
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

  changeColor = (mode) => {
    this.props.onChangeMode(mode);
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
    this.setState({ additional: this.props.additional });
    this.setState({ title: this.props.title });
  }

  render() {
    let open = Boolean(this.state.anchorEl);
    let lobbyPlay = this.state.lobbyPlay;
    let lobbyPlayHandler = this.state.lobbyPlayHandler;
    if (lobbyPlay == true && lobbyPlayHandler == true) {
      if (lobbyPlayHandler == true) {
        let lobby_music = document.getElementById("lobby_music");
        if (lobby_music !== null) {
          lobby_music.style.backgroundColor = "red";
        }
        lobbyAudio.play();
        this.setState({ lobbyPlayHandler: !this.state.lobbyPlayHandler });
      }
    } else if (lobbyPlay == false) {
      let lobby_music = document.getElementById("lobby_music");
      if (lobby_music !== null) {
        lobby_music.style.removeProperty("background-color");
      }
      lobbyAudio.pause();
    }
    const additional = this.props.additional;
    return (
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem",
          backgroundImage: `url("https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
          backgroundSize: "cover",
          backgroundPosition: "center 60%",
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 1,
          display: "flex",
          flexDirection: "column", // Ensure vertical stacking of elements
          alignItems: "center", // Center align everything horizontally
        }}
      >
        <div className="pt-2">
          <div style={{ textAlign: "center", padding: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "15px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "4rem",
              }}
            >
              <h2 style={{ margin: 0, color: "white" }}>{this.props.title}</h2>

              {/* Bento Menu Icon / X Button */}
              <div
                onClick={this.toggleMenu}
                style={{
                  cursor: "pointer",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {!this.state.isOpen ? (
                  // 3×3 Dot Grid (Bento Menu)
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gridGap: "4px",
                      width: "24px",
                      height: "24px",
                    }}
                  >
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: "6px",
                          height: "6px",
                          background: "white",
                          borderRadius: "50%",
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  // X icon
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "white",
                      lineHeight: "30px",
                    }}
                  >
                    ✕
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Menu */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: this.state.isOpen ? 1 : 0,
                height: this.state.isOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.3 }}
              style={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "center",
                alignItems: "center",
                paddingTop: "10px",
              }}
            >
              {Object.keys(menuItems).map((key) => {
                if (key != this.state.title) {
                  return <StyledLink to={menuItems[key]}>{key}</StyledLink>;
                }
              })}
            </motion.div>
          </div>
        </div>
        <div style={{ paddingTop: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "4rem",
            }}
          >
            {/* Mode Display and Switch */}
            {additional.darkMode == true ? (
              <div
                className="pt-10"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  id="modeEmoji"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "-45px",
                  }}
                ></span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "-45px",
                  }}
                >
                  <Fragment>
                    <span
                      style={{
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {this.state.mode}
                    </span>
                    <Switch
                      on="light"
                      off="dark"
                      value={this.state.mode}
                      onChange={(mode) => this.changeColor(mode)}
                    />
                  </Fragment>
                </span>
              </div>
            ) : null}
            {additional.help == true ? (
              <span>
                <button
                  type="button"
                  onClick={(event) => {
                    this.setState({ anchorEl: event.currentTarget });
                  }}
                >
                  <IconContext.Provider
                    value={{
                      color: "white",
                      size: 32,
                      className: "global-class-name",
                    }}
                  >
                    <IoIosHelpCircleOutline />
                  </IconContext.Provider>
                </button>
                <Popover
                  anchorEl={this.state.anchorEl}
                  open={open}
                  id={open ? "simple-popover" : undefined}
                  onClose={() => {
                    this.setState({ anchorEl: null });
                  }}
                  transformOrigin={{
                    horizontal: "center",
                    vertical: "top",
                  }}
                  anchorOrigin={{
                    horizontal: "center",
                    vertical: "bottom",
                  }}
                >
                  {additional.popoverContent}
                </Popover>
              </span>
            ) : null}
            {/* Music Button */}
            {additional.music == true ? (
              <span>
                <button
                  id="lobby_music"
                  type="button"
                  onClick={(event) => {
                    this.setState(
                      { lobbyPlay: !this.state.lobbyPlay },
                      function () {
                        this.setState({
                          lobbyPlayHandler: !lobbyPlayHandler,
                        });
                      }
                    );
                  }}
                >
                  <IconContext.Provider
                    value={{
                      color: "white",
                      size: 32,
                      className: "global-class-name",
                    }}
                  >
                    <IoIosMusicalNotes />
                  </IconContext.Provider>
                </button>
              </span>
            ) : null}
            {additional.dictation == true ? (
              <span>
                <button onClick={() => this.readoutStocks()}>
                  <IconContext.Provider
                    value={{
                      color: "white",
                      size: 32,
                      className: "global-class-name",
                    }}
                  >
                    <IoMdMegaphone />
                  </IconContext.Provider>
                </button>
              </span>
            ) : null}
          </div>
        </div>
      </nav>
    );
  }
}

export default NavigationMenu;
