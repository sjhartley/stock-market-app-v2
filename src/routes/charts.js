import React from "react";
import CanvasJSReact from "./canvasjs.stock.react";
import axios from "axios";
import { withRouter } from "./withRouter"; // Import the HOC
import NavigationMenu from "./navigationMenu";
var CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart;

class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      dataPoints1: [],
      dataPoints2: [],
      dataPoints3: [],
      isLoaded: false,
      list: [],
      name: "",
      symbol: "CZR",
      loading: false,
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
    };
    this.myRef = React.createRef();

    this.getHist = this.getHist.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getHist() {
    let self = this;
    this.setState({
      loading: true,
    });
    axios
      .post("https://backend684.herokuapp.com/hist", {
        params: {
          symbol: this.state.symbol,
        },
      })
      .then(function (response) {
        let body = response.data;

        if (body != "Err") {
          let points1 = [];
          let keys = ["open", "high", "low", "close"];
          let points2 = [];
          let points3 = [];
          let rows = body.data.tradesTable.rows;
          for (let i = 0; i < rows.length; i++) {
            let points1Obj = new Object();
            let points2Obj = new Object();
            let date = new Date(rows[i].date);
            points1Obj.x = date;
            points1Obj.y = [];
            for (let b = 0; b < keys.length; b++) {
              points1Obj.y.push(parseFloat(rows[i][keys[b]].split("$")[1]));
            }
            points2Obj.x = date;
            points2Obj.y = parseFloat(
              rows[i].volume.toString().replace(",", "")
            );
            points1.push(points1Obj);
            points2.push(points2Obj);
            points3.push({ x: date, y: Number(rows[i].close.split("$")[1]) });
          }
          self.setState({
            isLoaded: true,
            dataPoints1: points1,
            dataPoints2: points2,
            dataPoints3: points3,
            loading: false,
          });
        } else {
          self.setState({ loading: false, isLoaded: false });
          alert("Ticker not found");
        }
      })
      .catch(function (err) {
        alert(err);
      });
  }

  handleChange(event) {
    this.setState({ symbol: event.target.value });
  }

  handleSubmit(event) {
    //alert('A ticker was submitted: ' + this.state.symbol);
    var self = this;

    event.preventDefault();
    axios
      .post(
        "https://vast-citadel-83110.herokuapp.com/search",
        `keyWord=${self.myRef.current.value}`
      )
      .then(function (response) {
        if (response.data[0] != null) {
          if (
            response.data[0]["name"] != null &&
            response.data[0]["ticker"] != null
          ) {
            self.setState(
              {
                name: response.data[0]["name"],
                symbol: response.data[0]["ticker"],
              },
              () => {
                self.getHist();
              }
            );
          }
        } else {
          alert(`No data for ${self.myRef.current.value}`);
        }
      });
  }

  debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
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

  handleModeChangeNavigationMenu = (newMode) => {
    this.setState({ mode: newMode });
  };

  componentDidMount() {
    const propsSymbol = this.props?.location?.state?.symbol || "AMZN";
    const propsName = this.props?.location?.state?.name || "AMAZON COM INC";
    this.setState({ symbol: propsSymbol });
    this.setState({ name: propsName });
    let self = this;
    axios
      .get("https://vast-citadel-83110.herokuapp.com/list")
      .then(function (response) {
        let body = response.data;
        let keys = ["name", "ticker", "url"];
        self.setState({ list: body });
      });

    this.getHist();
    document.body.style.backgroundSize = "100% 100vh";
    let local_mode = localStorage.getItem("mode");
    if (local_mode !== null) {
      this.setState({ mode: local_mode }, () => {
        this.changeColor(this.state.mode);
      });
    } else {
      this.changeColor(this.state.mode);
    }
  }

  render() {
    const options = {
      theme: "light2",
      animationEnabled: true,
      //title:{
      //  text: `Historical quotes for ${this.state.symbol}`,
      //  fontSize: 16
      //},
      exportEnabled: true,
      exportFileName: `${this.state.symbol}_historical_quotes`,
      toolbar: {
        itemBackgroundColor: "#d3d3d3", //Change it to "red"
        itemBackgroundColorOnHover: "#3e3e3e",
      },
      rangeSelector: {
        buttonStyle: {
          //backgroundColor: "grey",
          labelFontSize: 16,
        },
        inputFields: {
          style: {
            fontSize: 16,
          },
        },
      },
      // subtitles: [{
      //   text: "Price-Volume Trend"
      // }],
      charts: [
        {
          zoomEnabled: true,
          axisX: {
            lineThickness: 5,
            tickLength: 0,
            labelFormatter: function (e) {
              return "";
            },
            crosshair: {
              enabled: true,
              snapToDataPoint: true,
              labelFormatter: function (e) {
                return "";
              },
            },
          },
          axisY: {
            title: `${this.state.symbol.toUpperCase()} stock price`,
            prefix: "$",
            tickLength: 10,
          },
          toolTip: {
            shared: true,
          },
          data: [
            {
              //risingColor: "green",
              //color: "red",
              name: "Price (in USD)",
              yValueFormatString: "$#,###.##",
              type: "candlestick",
              dataPoints: this.state.dataPoints1,
            },
          ],
        },
        {
          //height: 100,
          axisX: {
            crosshair: {
              enabled: true,
              snapToDataPoint: true,
            },
          },
          axisY: {
            title: "Volume",
            //prefix: "$",
            tickLength: 0,
          },
          toolTip: {
            shared: true,
          },
          data: [
            {
              name: "Volume",
              yValueFormatString: "#,###.##",
              type: "column",
              dataPoints: this.state.dataPoints2,
            },
          ],
        },
      ],
      navigator: {
        data: [
          {
            dataPoints: this.state.dataPoints3,
          },
        ],
        slider: {
          minimum: new Date("2012-08-10"),
          maximum: this.state.date,
        },
      },
    };
    const containerProps = {
      width: "100%",
      height: "100vh",
      margin: "auto",
    };

    return (
      <div>
        <NavigationMenu
          title={"Charts"}
          onChangeMode={(newMode) =>
            this.handleModeChangeNavigationMenu(newMode)
          }
          additional={{ darkMode: true, music: true, dictation: false }}
        />
        <div
          style={{
            textAlign: "center",
            fontSize: "28px",
            color: this.state.mode == "dark" ? "white" : "black",
          }}
        >
          Historical quotes for {this.state.symbol} / {this.state.name}
        </div>
        <div style={{ paddingTop: "0em" }}>
          <form
            onSubmit={this.handleSubmit}
            style={{
              textAlign: "center",
              paddingBottom: "2rem",
            }}
          >
            <label
              style={{ color: this.state.mode == "dark" ? "white" : "black" }}
            >
              Ticker:{" "}
              <input
                style={{
                  color: "black",
                  border: this.state.mode == "light" ? "1px solid black" : null,
                }}
                ref={this.myRef}
                type="text"
                value={this.state.value}
              />
            </label>
            <input
              style={{ color: this.state.mode == "dark" ? "white" : "black" }}
              className="pl-4"
              type="submit"
              value="Submit"
            />
          </form>
          {this.state.loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh", // or set a fixed height like "400px"
              }}
            >
              <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGJic2t2bHVqdmlvY2wxeWVxOGl4ZGwxdmVxb3doYnJkZzBvdXYyNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0IyccD7Am8P2f02Y/giphy.gif" />
            </div>
          )}
          {this.state.isLoaded && !this.state.loading && (
            <CanvasJSStockChart
              containerProps={containerProps}
              options={options}
              /* onRef = {ref => this.chart = ref} */
            />
          )}
        </div>
      </div>
    );
  }
}
export default withRouter(Charts);
