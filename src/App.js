import logo from "./logo.svg";
import "./App.css";
import React, { Fragment } from "react";
import Switch from "react-input-switch";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
let gifInterval;

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

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
      isOpen: false,
    };
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

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

  changeGif() {
    let gifs = [
      "https://media2.giphy.com/media/l3fZLMbuCOqJ82gec/100.webp?cid=ecf05e47se16wo6stm434varsfnedbi90xb5552o87p7jzla&rid=100.webp&ct=g",
      "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjR2bGlleWtyaHhrMGZxYWJ0NW1jNnhieTF5MXp3bnVmN2RxYXdtNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JtBZm3Getg3dqxK0zP/giphy-downsized-large.gif",
      "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmRtaXZlMHo0ZzRsam0wMW9ocGdybjdmYnFueXBteHphMGYwZDF0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/S4178TW2Rm1LW/giphy.gif",
      "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDgwamRucTJmeWExYnA3M2c5NXZkbzU5amc4MjFsOGRqaG56azc0ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l41lZBP84rdzHnWA8/giphy.gif",
    ];

    console.log(gifs.length);
    let gif = document.getElementById("gif");
    let gifContainer = document.getElementById("gif-container");
    if (gif !== null && gifContainer !== null) {
      let i = -1;
      gifInterval = setInterval(function () {
        i++;
        i = i % gifs.length;
        console.log(`i=${i}`);
        console.log(gifs[i]);
        gif.src = gifs[i];
        gifContainer.classList.add("in-out");
        setTimeout(function () {
          gifContainer.classList.remove("in-out");
        }, 2300);
      }, 2400);
    }
  }

  componentDidMount() {
    document.body.style.backgroundSize = "100% 100vh";
    let local_mode = localStorage.getItem("mode");
    console.log(`mode=${localStorage.getItem("mode")}`);
    if (local_mode !== null) {
      this.changeColor(local_mode);
    } else {
      this.changeColor(this.state.mode);
    }
  }

  componentWillUnmount() {
    clearInterval(gifInterval);
  }

  render() {
    return (
      <div>
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
                {/* Watchlist Title */}
                <h2 style={{ margin: 0, color: "white" }}>Home</h2>

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
                <StyledLink to="/watchlist">Watchlist</StyledLink>
                <StyledLink to="/data">NYSE/NASDAQ data search</StyledLink>
                <StyledLink to="/radio">Bloomberg Radio</StyledLink>
                <StyledLink to="/tv">Bloomberg TV</StyledLink>
                <StyledLink to="/charts">Charts</StyledLink>
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
            </div>
          </div>
        </nav>
        <div></div>
      </div>
    );
  }
}
