import logo from "./logo.svg";
import "./App.css";
import React, { Fragment } from "react";
import Switch from "@mui/material/Switch";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Auth from "./routes/Auth.js";
import NavigationMenu from "./routes/navigationMenu.js";
let gifInterval;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      darkModeLabel: "dark",
      darkMode: true,
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
      isOpen: false,
    };
  }

  changeColor = (value) => {
    const darkModeLabel = value ? "dark" : "light";
    const color = value ? "#000000" : "#FFFFFF";
    const emoji = this.state.modeEmojis[darkModeLabel];
    const emojiMode = document.getElementById("modeEmoji");

    this.setState({ darkMode: value, darkModeLabel });
    localStorage.setItem("darkMode", value);
    document.body.style.backgroundColor = color;

    if (emojiMode !== null) {
      emojiMode.innerHTML = emoji;
    }
  };

  // changeColor = (value) => {
  //   console.log(value);
  //   let darkModeLabel = "";
  //   this.setState({ darkMode: value });
  //   let color = "";
  //   let emojiMode = document.getElementById("modeEmoji");
  //   let body = document.body;

  //   if (value == true) {
  //     color = "#000000";
  //     darkModeLabel = "dark";
  //   } else if (value == false) {
  //     color = "#FFFFFF";
  //     darkModeLabel = "light";
  //   }
  //   this.setState({ darkModeLabel: darkModeLabel });
  //   console.log(darkModeLabel);
  //   localStorage.setItem("darkMode", value);

  //   body.style.backgroundColor = color;

  //   if (emojiMode !== null) {
  //     console.log("emojiMode not null");
  //     console.log(darkModeLabel);
  //     emojiMode.innerHTML = this.state.modeEmojis[darkModeLabel];
  //   }
  // };

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
    const local_mode = localStorage.getItem("darkMode");
    console.log(`mode=${local_mode}`);
    if (local_mode !== null) {
      const isDark = local_mode === "true"; // ✅ Convert string to boolean
      this.changeColor(isDark);
    } else {
      this.changeColor(this.state.darkMode);
    }
  }

  componentWillUnmount() {
    clearInterval(gifInterval);
  }

  render() {
    return (
      <div>
        <NavigationMenu
          title={"Home"}
          additional={{
            darkMode: true,
            help: true,
            popoverContent: (
              <>
                Help
                <br />
                <br />
                <strong>Search mode</strong>
                <br />
                There are 3 options in search mode: "ticker", "name", and
                "ticker/name".
                <br />
                <br />
                <strong>Result filter</strong>
                <br />
                There are 2 options: "equals" and "including".
                <br />
                "equals" → user input exactly matches an entry
                <br />
                "including" → user input is included in an entry
                <br />
                This filtering is not implemented yet.
                <br />
                <br />
                <strong>Source mode</strong>
                <br />
                There are 2 options: "NYSE" (New York Stock Exchange) and
                "NASDAQ".
              </>
            ),
          }}
        />
        <div>
          <Auth />
        </div>
      </div>
    );
  }
}
