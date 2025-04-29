import "./data.css";
import React from "react";
import $ from "jquery";
import "jquery.marquee";
import { Collapse, Button, Spinner } from "react-bootstrap";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import NavigationMenu from "./navigationMenu";

class Data extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nyse_word: "",
      nasdaq_word: "",
      nyse_stuff: [],
      nyse_counter: 0,
      nasdaq_stuff: [],
      nasdaq_counter: 0,
      stuff: {},
      mq: null,
      dividends: null,
      marketCountDown: "",
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
      questionMarkSymbol: "&#x1F31B;",
      searchMode: null,
      searchOptions: ["ticker", "name", "ticker/name"],
      source: null,
      sourceOptions: ["NYSE", "NASDAQ"],
      filter: null,
      filterOptions: ["equals", "including"],
      word: null,
      titleColorSwitch: 0,
      anchorEl_help: null,
      anchorEl_table: null,
      nyse_keys: null,
      serverStatus: null,
      showShow: false,
      showSpinner: false,
    };

    this.handleChangeWord = this.handleChangeWord.bind(this);
    this.handleSubmitWord = this.handleSubmitWord.bind(this);
    this.updateInputInstr = this.updateInputInstr.bind(this);
  }

  handleChangeWord(event) {
    this.setState({ word: event.target.value });
  }

  handleSubmitWord(event) {
    this.setState({ stuff: {} });
    this.setState({ mq: "" });
    this.setState({ dividends: "" });
    this.setState({ showSpinner: !this.state.showSpinner });

    // this.setState(
    //   { mq: "Requesting data from server...\nPlease Wait..." },
    //   function () {
    //     console.log("loading");
    //   }
    // );

    let searchModeInput = document.getElementById("select_searchMode");
    let resultFilterInput = document.getElementById("select_resultFilter");
    let sourceInput = document.getElementById("select_source");

    let searchVal = searchModeInput.value;
    let resultVal = resultFilterInput.value;
    let sourceVal = sourceInput.value;

    if (sourceVal === "NYSE") {
      this.get_nyse(this.state.word, searchVal, resultVal);
    } else if (sourceVal === "NASDAQ") {
      this.get_nasdaq(this.state.word, searchVal, resultVal);
    }
    event.preventDefault();
  }

  updateInputInstr(event) {
    console.log(event.target.value);
    let updateInstr = document.getElementById("updateInstr");
    updateInstr.innerText = `Enter ${event.target.value}`;
  }

  get_nyse(keyWord, searchMode, filter) {
    var self1 = this;

    axios
      .post("https://backend684.herokuapp.com/nyse", {
        params: {
          keyWord: keyWord,
          mode: searchMode,
          filter: filter,
        },
      })
      .then(function (response) {
        //console.log(response.data[0]);
        //console.log(response.data[1]);
        //console.log(response.data[2]);
        if (response.data[0] != false) {
          localStorage.setItem("currentData", JSON.stringify(response.data[0]));
          //self1.setState({ mq: response.data[0] });
          //self1.setState({ dividends: response.data[1] });
          let keys = [];
          Object.keys(response.data[0]).forEach((key) => {
            keys.push(key);
          });
          localStorage.setItem("nyse_keys", JSON.stringify(keys));

          self1.setState({ nyse_keys: JSON.stringify(keys) });
          self1.setState({ stuff: response.data[0] }, function () {
            self1.setState({ showSpinner: !this.state.showSpinner });
            this.handleCheckboxChange();
          });
        } else {
          self1.setState({ mq: "NO MATCH..." });
        }
      })
      .catch(function (err) {
        console.log(err);

        self1.setState({ stuff: false });
      });
  }

  get_nasdaq(keyWord, searchMode, filter) {
    this.setState({ dividends: "" });
    var self1 = this;

    axios
      .post("https://backend684.herokuapp.com/nasdaq", {
        params: {
          keyWord: keyWord,
          mode: searchMode,
          filter: filter,
        },
      })
      .then(function (response) {
        self1.setState({ mq: "" });
        let table_div = document.getElementById("table-div");

        if (keyWord === "help") {
          self1.setState({ mq: response.data });
        } else if (keyWord === "--all") {
          let arr = [];
          Object.keys(response.data).forEach((key) => {
            arr.push(response.data[key]);
          });
          self1.setState({ nasdaq_stuff: arr });
        } else if (keyWord === "market-info" || keyWord === "--l") {
          if (keyWord === "--l") {
            let msgStr = "";
            for (let i = 0; i < response.data.length; i++) {
              Object.keys(response.data[i]).map((key, index) => {
                msgStr += `${response.data[i][key]}`;
                if (index == 0) {
                  msgStr += ": ";
                }
              });
              msgStr += "\n";
            }
            //table_div.innerText = "";
            self1.setState({ stuff: {} });
            self1.setState({ mq: msgStr });
            return false;
          }
          self1.setState({ stuff: response.data.data });
        } else {
          //console.log("response.data");
          //console.log(typeof response.data);
          //console.log(response.data);
          if (response.data !== false) {
            self1.setState({ stuff: response.data[0] });
          } else {
            self1.setState({ stuff: false });
            self1.setState({ mq: "NO MATCH..." });
          }
        }
      })
      .catch(function (err) {
        console.log(err);
        self1.setState({ stuff: false });
      });
  }

  get_marketCountdown(keyWord) {
    return new Promise(function (resolve, reject) {
      axios
        .post("https://backend684.herokuapp.com/nasdaq", {
          params: {
            keyWord: "market-info",
            mode: "",
            filter: "",
          },
        })
        .then(function (response) {
          if (
            typeof response.data.data["marketCountDown"] !== "undefined" ||
            response.data.data["marketCountDown"] !== null
          ) {
            resolve(response.data.data["marketCountDown"]);
          } else {
            return false;
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  }

  showCountdown() {
    var $mq = this.$el;
    let self2 = this;
    //let marketCountDown = this.state.marketCountDown;

    $mq
      .marquee({
        duration: 15000,
        delayBeforeStart: 0,
      })
      .bind("finished", () => {
        $mq.marquee("destroy");
        //document.getElementById("marquee").innerHTML = new Date().toString();
        document.getElementById("marquee").innerHTML =
          this.state.marketCountDown;
        self2.showCountdown();
      });
  }

  showNasdaq() {
    let $nasdaq = this.$nasdaq;
    let self = this;

    $nasdaq
      .marquee({
        duration: 15000,
        delayBeforeStart: 0,
      })
      .bind("finished", () => {
        $nasdaq.marquee("destroy");
        //document.getElementById("marquee").innerHTML = new Date().toString();
        let nasdaq_arr = self.state.nasdaq_stuff;
        let counter = self.state.nasdaq_counter;
        let msg_str = "";
        let sliced_arr = nasdaq_arr.slice(counter, counter + 5);
        for (let a = 0; a < sliced_arr.length; a++) {
          msg_str += `${sliced_arr[a]["Symbol"]}: ${sliced_arr[a]["last"]}     `;
        }
        document.getElementById("nasdaq").innerHTML = msg_str;
        if (nasdaq_arr.length - counter < 5) {
          sliced_arr = nasdaq_arr.slice(
            counter,
            counter + (nasdaq_arr.length - counter)
          );
          self.setState({ nasdaq_counter: 0 });
        } else {
          self.setState({ nasdaq_counter: self.state.nasdaq_counter + 5 });
        }
        self.showNasdaq();
      });
  }

  showNyse() {
    let $nyse = this.$nyse;
    let self = this;

    $nyse
      .marquee({
        duration: 7000,
        delayBeforeStart: 0,
      })
      .bind("finished", () => {
        $nyse.marquee("destroy");
        //document.getElementById("marquee").innerHTML = new Date().toString();
        let nyse_arr = self.state.nasdaq_stuff;

        let counter = self.state.nyse_counter;
        let msg_str = "";
        let sliced_arr = nyse_arr.slice(counter, counter + 5);
        //console.log(sliced_arr);
        for (let a = 0; a < sliced_arr.length; a++) {
          msg_str += `${sliced_arr[a]["Symbol"]}: ${sliced_arr[a]["last"]}     `;
        }
        //console.log(msg_str);
        document.getElementById("nyse").innerHTML = msg_str;
        if (nyse_arr.length - counter < 5) {
          sliced_arr = nyse_arr.slice(
            counter,
            counter + (nyse_arr.length - counter)
          );
          self.setState({ nyse_counter: 0 });
        } else {
          self.setState({ nyse_counter: self.state.nyse_counter + 5 });
        }

        self.showNyse();
      });
  }

  test() {
    let self = this;
    axios
      .get("https://backend684.herokuapp.com/test")
      .then(function (response) {
        console.log(response);
        self.setState({ serverStatus: `Online (last checked: ${new Date()})` });
      })
      .catch(function (err) {
        console.log(err);
        self.setState({ serverStatus: `Online (last checked: ${new Date()})` });
      });
  }

  updateCountdown(countdown) {
    this.setState({ marketCountDown: countdown });
  }

  componentDidMount() {
    document.body.style.backgroundImage = "none";
    let local_mode = localStorage.getItem("mode");
    //console.log(`mode=${localStorage.getItem("mode")}`);
    if (local_mode !== null) {
      this.changeColor(local_mode);
    } else {
      this.changeColor(this.state.mode);
    }

    let self1 = this;
    this.showCountdown();
    this.showNasdaq();

    this.test();
    setInterval(function () {
      self1.test();
    }, 60 * 1000);

    this.get_marketCountdown().then(function (countdown) {
      //console.log(countdown);
      let split_str = countdown.split(" ");
      if (split_str[split_str.length - 1].search("S") !== -1) {
        countdown = countdown.split(" ").slice(0, -1).join(" ");
      }
      self1.updateCountdown(`${countdown}`);
    });

    this.interval = setInterval(function () {
      self1.get_marketCountdown().then(function (countdown) {
        //console.log("................");
        let split_str = countdown.split(" ");
        if (split_str[split_str.length - 1].search("S") !== -1) {
          countdown = countdown.split(" ").slice(0, -1).join(" ");
        }
        self1.updateCountdown(`${countdown}`);
      });
    }, 60 * 1000);

    this.get_nasdaq("--all", null, null);

    this.interval1 = setInterval(function () {
      //create redirect function if data is not initially available
      self1.get_nasdaq("--all", null, null);
    }, 60 * 15 * 1000);

    //create function to retrieve nyse data in batches to display in marquee

    let searchModeInput = document.getElementById("select_searchMode");
    let updateInstr = document.getElementById("updateInstr");
    updateInstr.innerText = `Enter ${searchModeInput.value}`;
  }

  handleSearchMode = (selectedSearchMode) => {
    this.setState({ searchMode: selectedSearchMode });
  };

  handleSource = (selectedSource) => {
    this.setState({ source: selectedSource });
  };

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

  handleCheckboxChange() {
    //let nyse_keys = localStorage.getItem("nyse_keys");

    let nyse_keys = this.state.nyse_keys;
    let currentData = JSON.parse(localStorage.getItem("currentData"));
    //console.log("currentData...");
    //console.log(currentData);

    if (nyse_keys !== null) {
      let keys_arr = JSON.parse(nyse_keys);
      for (let i = 0; i < keys_arr.length; i++) {
        //console.log(
        //`${keys_arr[i]}: ${document.getElementById(`${keys_arr[i]}`).checked}`
        //);
        if (document.getElementById(`${keys_arr[i]}`) !== null) {
          if (document.getElementById(`${keys_arr[i]}`).checked == false) {
            delete currentData[`${keys_arr[i]}`];
          }
        }
      }
      this.setState({ stuff: currentData });
    }
  }

  render() {
    let stuff = this.state.stuff;

    const dataAvailable = () => {
      let tableDiv = document.getElementById("table-div");

      //conditional rendering

      if (stuff !== false && typeof stuff === "object") {
        if (Object.keys(stuff).length !== 0) {
          if (tableDiv !== null) {
            tableDiv.style.display = "block";
          }
          let tableMake = Object.keys(stuff).map((key, index) => {
            return (
              <tr key={`${index}a`}>
                <td id="data" key={`${index}b`}>
                  {key}
                </td>
                <td id="data" key={`${index}c`}>
                  {stuff[key].toString()}
                </td>
              </tr>
            );
          });
          //return tableMake;
          return (
            <table id="data">
              <tbody>{tableMake}</tbody>
            </table>
          );
        }
      } else {
        tableDiv.style.display = "none";
      }
    };

    const renderSearchOptions = () => {
      if (this.state.searchOptions.length !== 0) {
        let options = this.state.searchOptions.map(function (el, i) {
          return <option value={`${el}`}>{`${el}`}</option>;
        });
        return options;
      } else {
        return <option>NO OPTIONS AVAILABLE</option>;
      }
    };

    const renderSourceOptions = () => {
      if (this.state.sourceOptions.length !== 0) {
        let options = this.state.sourceOptions.map(function (el, i) {
          return <option value={`${el}`}>{`${el}`}</option>;
        });
        return options;
      } else {
        return <option>NO OPTIONS AVAILABLE</option>;
      }
    };

    const renderFilterOptions = () => {
      if (this.state.filterOptions.length !== 0) {
        let options = this.state.filterOptions.map(function (el, i) {
          return <option value={`${el}`}>{`${el}`}</option>;
        });
        return options;
      } else {
        return <option>NO OPTIONS AVAILABLE</option>;
      }
    };

    const renderCheck = () => {
      let self = this;
      let nyse_keys = localStorage.getItem("nyse_keys");
      if (nyse_keys !== null) {
        let boxes = JSON.parse(nyse_keys).map(function (el, i) {
          return (
            <div key={i}>
              <input
                id={el}
                key={el}
                value={el}
                type="checkbox"
                defaultChecked="true"
                onChange={() => self.handleCheckboxChange()}
              />
              <span>{` ${el}`}</span>
            </div>
          );
        });
        let title = <h4 style={{ textAlign: "center" }}>Data options</h4>;
        boxes = (
          <div style={{ height: "100px", overflowY: "scroll" }}>
            {title}

            {boxes}
          </div>
        );
        return boxes;
      }
    };

    const renderSpinner = () => {
      let showSpinner = this.state.showSpinner;
      if (showSpinner == true) {
        return (
          <div style={{ textAlign: "center" }}>
            <Spinner id="spinner123" animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        );
      } else if (showSpinner == false) {
        let spinner123 = document.getElementById("spinner123");
        // if (spinner123 !== null) {
        //   spinner123.parentNode.removeChild(spinner123);
        // }
      }
    };

    const renderServerStatus = () => {
      let serverStatus = this.state.serverStatus;
      if (serverStatus == null) {
        return (
          <p style={{ fontSize: "12px", color: "green" }}>
            Contacting server, please wait...
          </p>
        );
      } else {
        return (
          <p
            style={{ fontSize: "12px", color: "green" }}
          >{`Server Status: ${this.state.serverStatus}`}</p>
        );
      }
    };

    let mode = this.state.mode;
    let open_help = Boolean(this.state.anchorEl_help);
    let open_table = Boolean(this.state.anchorEl_table);
    //console.log(`showShow=${this.state.showShow}`);

    return (
      <div id="main">
        <div
          style={{ paddingBottom: "1rem" }}
          id="marquee"
          ref={(el) => (this.$el = $(el))}
        >
          Retrieving data from servers...
        </div>
        <div id="nasdaq" ref={(nasdaq) => (this.$nasdaq = $(nasdaq))}></div>
        <div id="nyse" ref={(nyse) => (this.$nyse = $(nyse))}></div>

        <div id="main">
          <main>
            <NavigationMenu
              title={"NYSE/NASDAQ data"}
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
          </main>
          <div style={{ textAlign: "center" }}>{renderServerStatus()}</div>

          <div id="header">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto auto auto",
              }}
            >
              <div class="grid1">
                <h4>Search mode</h4>

                <select onChange={this.updateInputInstr} id="select_searchMode">
                  {renderSearchOptions()}
                </select>
              </div>
              <div class="grid1">
                <h4>Result filter</h4>

                <select id="select_resultFilter">
                  {renderFilterOptions()}
                </select>
              </div>
              <div class="grid1">
                {" "}
                <h4>Source mode</h4>
                <select id="select_source">{renderSourceOptions()}</select>
              </div>
              <div>
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    this.setState({ showShow: !this.state.showShow });
                  }}
                >
                  Table Settings
                </button>
                <Collapse in={this.state.showShow}>
                  <div>{renderCheck()}</div>
                </Collapse>
              </div>
              <div id="search" class="grid1" style={{ textAlign: "center" }}>
                <form onSubmit={this.handleSubmitWord}>
                  <label>
                    <div id="updateInstr" style={{ paddingBottom: "1rem" }}>
                      {}
                    </div>
                    <div style={{ paddingBottom: "1rem" }}>
                      <input
                        type="text"
                        id="name"
                        value={this.state.word}
                        onChange={this.handleChangeWord}
                      />
                    </div>
                  </label>
                  <input type="submit" value="Submit" />
                </form>
              </div>
            </div>
          </div>

          <div id="dataDisp" style={{ paddingTop: "2rem" }}>
            <div id="table-div" style={{ display: "none" }}>
              {dataAvailable()}
            </div>

            <div>
              {renderSpinner()}
              <p id="mq" style={{ whiteSpace: "pre-wrap" }}>
                {this.state.mq}
              </p>
            </div>
            <div>
              <p id="dividends">{this.state.dividends}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Data;
