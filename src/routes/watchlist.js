import { Link } from "react-router-dom";
import React, { useState, useEffect, Fragment } from "react";
import Switch from "react-input-switch";
import Popover from "@mui/material/Popover";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { IconContext } from "react-icons";
import {
  IoIosHelpCircleOutline,
  IoIosMusicalNotes,
  IoIosDownload,
  IoMdMegaphone,
} from "react-icons/io";
import styled from "styled-components";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import ReactDOMServer from "react-dom/server";
import html2pdf from "html2pdf-jspdf2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
const axios = require("axios");
const kaching = require("../sounds/kaching.ogg");
const kachingAudio = new Audio(kaching);
const lobby = require("../sounds/lobby.ogg");
const lobbyAudio = new Audio(lobby);
lobbyAudio.loop = true;
const synth = window.speechSynthesis;
let debounceTimer;

function get_nyse(keyWord) {
  return new Promise(function (resolve, reject) {
    axios
      .post(
        "https://vast-citadel-83110.herokuapp.com/nyse",
        `keyWord=${keyWord}`
      )
      .then(function (response) {
        resolve(response.data);
      });
  });
}

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

const DataTable = ({ data, type, logo_dev_key }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [searchFilter, setSearchFilter] = useState("contains");
  const [selectedHeader, setSelectedHeader] = useState("");
  const [draggedHeader, setDraggedHeader] = useState(null);
  const [hoveredHeader, setHoveredHeader] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [secondSearchTerm, setSecondSearchTerm] = useState(""); // For 'between' filter
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupImage, setPopupImage] = useState(""); // To hold the clicked image source
  const [headersWithCheckbox, setHeadersWithCheckbox] = useState([]);
  const [anchorEl_add, setAnchorEl_add] = useState(null);
  const [anchorEl_cols, setAnchorEl_cols] = useState(null);

  let rows = Array.isArray(data?.data) ? data.data : [];
  let open_add = Boolean(anchorEl_add);
  let open_cols = Boolean(anchorEl_cols);

  rows = rows.map((item) => ({
    ...item,
    logo: `https://img.logo.dev/ticker/${item.symbol}?token=${logo_dev_key}`,
    chart: item.symbol,
  }));

  rows = rows.filter((row) => {
    const hasKeys = Object.keys(row).length > 0;
    const hasValidValues = Object.values(row).some(
      (value) => value !== null && value !== undefined && value !== ""
    );
    return hasKeys && hasValidValues;
  });

  const handleSubmit_ticker = (event) => {
    event.preventDefault();
    let ticker = event.target[0].value;
    let submissionType = event.nativeEvent.submitter.value;

    if (submissionType == "Add") {
      axios
        .post(
          "https://vast-citadel-83110.herokuapp.com/add",
          `keyWord=${ticker}`
        )
        .then(function (response) {
          if (response.data == true) {
            toast(`${ticker} added to watchlist!!!`);
          } else {
            toast(response.data);
          }
        });
    } else if (submissionType == "Delete") {
      axios
        .post(
          "https://vast-citadel-83110.herokuapp.com/delete",
          `keyWord=${ticker}`
        )
        .then(function (response) {
          if (response.data == true) {
            toast(`${ticker} deleted from watchlist!!!`);
          } else {
            toast(response.data);
          }
        });
    }
    event.preventDefault();
  };

  // Determine if the column is numeric
  const isNumericColumn = (column) => {
    return rows.some((row) => !isNaN(parseFloat(row[column])));
  };

  const handleImageClick = (imageSrc) => {
    setPopupImage(imageSrc); // Set the clicked image as the popup source
    setIsPopupOpen(true); // Open the popup
  };

  const closePopup = () => {
    setIsPopupOpen(false); // Close the popup
    setPopupImage(""); // Clear the popup image source
  };

  useEffect(() => {
    // Step 1: Populate headers from `data`
    const allHeadersSet = new Set();
    rows.forEach((row) => {
      Object.keys(row).forEach((header) => allHeadersSet.add(header));
    });
    let initialHeaders = Array.from(allHeadersSet);

    if (type == "watchlist_data") {
      // Retrieve stored headers from local storage
      let storedHeaders = localStorage.getItem("headers");

      // Safeguard: Parse and set headersWithCheckbox, or default to initialHeaders
      const parsedHeaders = storedHeaders ? JSON.parse(storedHeaders) : null;
      const headersWithCheckbox =
        parsedHeaders ||
        initialHeaders.map((header) => ({
          name: header,
          checked: true, // Default to checked if no stored headers
        }));

      setHeadersWithCheckbox(headersWithCheckbox);
    }

    initialHeaders.map((header) => ({
      name: header,
      checked: true, // Default to checked if no stored headers
    }));

    // Step 2: Filter headers based on `checkedHeaders`
    initialHeaders = initialHeaders.filter((header) => {
      const headerObj = headersWithCheckbox.find((h) => h.name === header);
      return headerObj ? headerObj.checked : true; // Include if checked or not in `checkedHeaders`
    });

    // Step 3: Reorder the headers, moving "logo" after "symbol"
    if (initialHeaders.includes("symbol") && initialHeaders.includes("logo")) {
      const symbolIndex = initialHeaders.indexOf("symbol");
      const logoIndex = initialHeaders.indexOf("logo");

      // Remove 'logo' from the array
      initialHeaders.splice(logoIndex, 1);
      // Insert 'logo' after 'symbol'
      initialHeaders.splice(symbolIndex + 1, 0, "logo");
    }

    // Update headers state if it has changed
    if (
      headers.length === 0 ||
      headers.some((h, i) => h !== initialHeaders[i])
    ) {
      setHeaders(initialHeaders);
    }

    // Step 4: Reset filter if selected header changes to a non-numeric one
    if (selectedHeader && !isNumericColumn(selectedHeader)) {
      setSearchFilter("contains"); // Reset filter to a non-numeric option
      setSearchTerm("");
      setSecondSearchTerm(""); // Clear the second search term for non-numeric headers
    }
  }, [data, selectedHeader]); // Re-run when data or selected header changes

  useEffect(() => {
    // Update headers to include only items where checked is true
    if (type == "watchlist_data") {
      setHeaders(
        headersWithCheckbox
          .filter((item) => item.checked)
          .map((item) => item.name)
      );
    }
  }, [headersWithCheckbox]);

  if (rows.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <p>No data available.</p>
      </div>
    );
  }

  const parseValue = (value, column) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (column === "marketcap" || column === "shares") {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (trimmedValue.endsWith("M")) {
          return parseFloat(trimmedValue.slice(0, -1)) * 1_000_000;
        } else if (trimmedValue.endsWith("B")) {
          return parseFloat(trimmedValue.slice(0, -1)) * 1_000_000_000;
        }
      }
    }

    const parsedValue = typeof value === "number" ? value : parseFloat(value);
    return isNaN(parsedValue) ? value : parsedValue;
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = () => {
    if (!sortColumn || !sortDirection) {
      return rows;
    }

    return [...rows].sort((a, b) => {
      const valueA = parseValue(a[sortColumn], sortColumn);
      const valueB = parseValue(b[sortColumn], sortColumn);

      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return 1;
      if (valueB === null) return -1;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });
  };

  // Adjust filtering logic for numeric filters
  const filteredData = sortedData().filter((item) => {
    const value = parseValue(item[selectedHeader], selectedHeader);
    const term = parseFloat(searchTerm);

    if (
      (searchFilter === "not" || searchFilter === "is") &&
      !searchTerm.trim()
    ) {
      // If the "Not" filter is selected and search term is empty, return all rows
      return true;
    }

    if (!selectedHeader || selectedHeader === "all") {
      return Object.values(item).some((value) => {
        const valueStr = String(value).toLowerCase();
        return searchFilter === "is"
          ? valueStr === searchTerm.toLowerCase()
          : valueStr.includes(searchTerm.toLowerCase());
      });
    } else {
      const valueStr = String(item[selectedHeader] || "").toLowerCase();
      if (searchFilter === "not") {
        return !valueStr.includes(searchTerm.toLowerCase());
      } else if (searchFilter === "greaterThan") {
        return value > term;
      } else if (searchFilter === "lessThan") {
        return value < term;
      } else if (searchFilter === "between") {
        const secondTerm = parseFloat(secondSearchTerm);
        return value >= term && value <= secondTerm;
      } else {
        const valueStr = String(item[selectedHeader] || "").toLowerCase();
        return searchFilter === "is"
          ? valueStr === searchTerm.toLowerCase()
          : valueStr.includes(searchTerm.toLowerCase());
      }
    }
  });

  const getRowColor = (item) => {
    const changeValue = item.pctchg;
    if (changeValue < 0) {
      return "bg-red-100";
    } else if (changeValue > 0) {
      return "bg-green-100";
    } else {
      return "";
    }
  };

  const handleDragStart = (header) => {
    setDraggedHeader(header);
  };

  const handleDragOver = (e, targetHeader, rect) => {
    e.preventDefault();

    const mouseX = e.clientX;
    const isLeftHalf = mouseX < rect.left + rect.width / 2;

    setIsDraggingLeft(isLeftHalf);
    setHoveredHeader(targetHeader);

    if (draggedHeader && draggedHeader !== targetHeader) {
      const newHeaders = [...headers];
      const draggedIndex = newHeaders.indexOf(draggedHeader);
      const targetIndex = newHeaders.indexOf(targetHeader);

      // Remove the dragged header and insert it before/after based on mouse position
      newHeaders.splice(draggedIndex, 1);
      newHeaders.splice(
        isLeftHalf ? targetIndex : targetIndex + 1,
        0,
        draggedHeader
      );

      setHeaders(newHeaders);
    }
  };

  const handleDrop = () => {
    setDraggedHeader(null);
    setHoveredHeader(null);
    setIsDraggingLeft(false);

    // Update headersWithCheckbox to match the new headers order
    setHeadersWithCheckbox((prevHeadersWithCheckbox) => {
      // Separate checked and unchecked elements
      const checkedElements = prevHeadersWithCheckbox.filter((h) => h.checked);

      // Create a map of checked elements for fast lookup
      const headerMap = new Map(checkedElements.map((h) => [h.name, h]));

      // Reorder only checked elements based on the `headers` array
      const reorderedCheckedElements = headers
        .map((header) => {
          const headerInfo = headerMap.get(header);
          return headerInfo
            ? { name: header, checked: headerInfo.checked }
            : null;
        })
        .filter(Boolean); // Filter out null values

      // Reinsert unchecked elements in their original positions
      const result = prevHeadersWithCheckbox.map((header) => {
        return header.checked
          ? reorderedCheckedElements.shift() // Pull from reordered checked elements
          : header; // Keep unchecked elements as is
      });
      // Optionally, persist the updated order in local storage
      localStorage.setItem("headers", JSON.stringify(result));
      return result;
    });
  };

  const handleDragLeave = () => {
    setHoveredHeader(null);
    setIsDraggingLeft(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="w-full max-w-5xl mx-auto">
        {/* Search Bar Section */}
        <div className="mb-4 flex items-center">
          <select
            value={selectedHeader}
            onChange={(e) => setSelectedHeader(e.target.value)}
            className="px-4 py-2 border rounded-lg mr-2"
          >
            <option value="all">All Headers</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header.charAt(0).toUpperCase() + header.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg mr-2"
          >
            <option value="contains">Contains</option>
            <option value="is">Is</option>
            <option value="not">Not</option>
            {isNumericColumn(selectedHeader) && (
              <>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="between">Between</option>
              </>
            )}
          </select>
          {searchFilter === "between" ? (
            <>
              <input
                type="number"
                placeholder="From"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg mr-2"
              />
              <input
                type="number"
                placeholder="To"
                value={secondSearchTerm}
                onChange={(e) => setSecondSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg mr-2"
              />
            </>
          ) : isNumericColumn(selectedHeader) ? (
            <input
              type="number"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full"
            />
          ) : (
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full"
            />
          )}
        </div>
        <div className="pb-10 text-left">
          <button
            className="mr-4 text-xl text-red-500 bg-green-500 border-2 border-green-500 px-5 br-10 rounded-[30px]"
            onClick={(event) => {
              setAnchorEl_add(event.currentTarget);
            }} // Close the popup when clicking "X"
          >
            Modify
          </button>
          {type == "watchlist_data" ? (
            <button
              className="text-xl text-red-500 bg-green-500 border-2 border-green-500 px-5 br-10 rounded-[30px]"
              onClick={(event) => {
                setAnchorEl_cols(event.currentTarget);
              }} // Close the popup when clicking "X"
            >
              Customize columns
            </button>
          ) : null}
          <ToastContainer />
          <Popover
            anchorEl={anchorEl_add}
            open={open_add}
            id={open_add}
            onClose={() => {
              setAnchorEl_add(null);
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
            <div className="flex justify-center items-center">
              <form onSubmit={handleSubmit_ticker} className="space-y-2">
                <label className="pb-4 px-2 flex flex-col items-center">
                  <span className="text-sm pb-4">Enter ticker</span>
                  <div className="flex items-center border rounded py-1">
                    <input
                      type="text"
                      id="ticker"
                      className="text-center outline-none ml-2 w-24"
                    />
                  </div>
                </label>

                <div className="pb-2 flex justify-center space-x-2">
                  <input
                    type="submit"
                    value="Add"
                    className="px-2 py-1 text-sm border rounded cursor-pointer"
                  />
                  <input
                    type="submit"
                    value="Delete"
                    className="px-2 py-1 text-sm border rounded cursor-pointer"
                  />
                </div>
              </form>
            </div>
          </Popover>
          <Popover
            anchorEl={anchorEl_cols}
            open={open_cols}
            id={open_cols}
            onClose={() => {
              setAnchorEl_cols(null);
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
            <div
              style={{ padding: "1rem", height: "300px", overflowY: "auto" }}
            >
              {headersWithCheckbox && headersWithCheckbox.length > 0 ? (
                <>
                  {/* Master Checkbox for Check/Uncheck All */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="check-all"
                      style={{ marginRight: "0.5rem" }}
                      checked={headersWithCheckbox.every(
                        (header) => header.checked
                      )} // Check if all are checked
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedHeaders = headersWithCheckbox.map(
                          (header) => ({
                            ...header,
                            checked: isChecked, // Update all to the new state
                          })
                        );
                        setHeadersWithCheckbox(updatedHeaders); // Update the state
                        const storageKey = "headers";

                        // Save the modified or new data back to localStorage
                        localStorage.setItem(
                          storageKey,
                          JSON.stringify(updatedHeaders)
                        );
                      }}
                    />
                    <label htmlFor="check-all">Check/Uncheck All</label>
                  </div>

                  {/* Individual Checkboxes */}
                  {headersWithCheckbox.map((header, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`header-checkbox-${index}`}
                        name={`header-checkbox-${index}`}
                        style={{ marginRight: "0.5rem" }}
                        checked={header.checked} // Bind the checkbox to the checked property
                        onChange={(e) => {
                          const updatedHeaders = [...headersWithCheckbox];
                          updatedHeaders[index].checked = e.target.checked; // Update the checkbox value
                          setHeadersWithCheckbox(updatedHeaders); // Update the state

                          const storageKey = "headers";

                          // Check if the item exists in localStorage
                          let existingData = localStorage.getItem(storageKey);

                          if (existingData) {
                            // Parse the existing data (assuming it's stored as an array of objects)
                            existingData = JSON.parse(existingData);

                            // Update the corresponding element in the array
                            existingData[index] = {
                              ...existingData[index],
                              checked: e.target.checked,
                            };
                          } else {
                            // If no existing data, initialize with the updatedHeaders array
                            existingData = updatedHeaders;
                          }

                          // Save the modified or new data back to localStorage
                          localStorage.setItem(
                            storageKey,
                            JSON.stringify(existingData)
                          );
                        }}
                      />
                      <label htmlFor={`header-checkbox-${index}`}>
                        {header.name}
                      </label>
                    </div>
                  ))}
                </>
              ) : (
                <p>No headers available</p>
              )}
            </div>
          </Popover>
        </div>
        {/* Main Data Table */}
        <div
          style={{
            maxHeight: "60vh",
          }}
          className="overflow-x-auto"
        >
          <table
            className="min-w-full bg-white border border-gray-300"
            style={{
              width: "800px", // Set a fixed width for the table
              tableLayout: "auto", // Ensures columns take up equal width or respect set widths
            }}
          >
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="relative px-2 py-1 border-b-2 border-gray-200 text-left text-blue-500 tracking-wider cursor-pointer text-sm align-middle sticky top-0 bg-white"
                    draggable
                    onDragStart={() => handleDragStart(header)}
                    onDragOver={(e) =>
                      handleDragOver(
                        e,
                        header,
                        e.target.getBoundingClientRect()
                      )
                    }
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeave}
                    onClick={() => handleSort(header)}
                    style={{
                      transition: "margin 0.2s ease", // Smooth transition when dragging
                      marginLeft:
                        draggedHeader &&
                        hoveredHeader === header &&
                        isDraggingLeft
                          ? "10px"
                          : "0",
                      marginRight:
                        draggedHeader &&
                        hoveredHeader === header &&
                        !isDraggingLeft
                          ? "10px"
                          : "0",
                      backgroundColor:
                        draggedHeader === header ? "lightgray" : "transparent", // Highlight the dragged header
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex-grow text-left">
                        {header.charAt(0).toUpperCase() + header.slice(1)}
                      </span>
                      <div className="flex flex-col items-center">
                        <div
                          style={{
                            color:
                              sortColumn === header && sortDirection === "asc"
                                ? "black"
                                : "#D1D5DB",
                            fontSize: "10px",
                            userSelect: "none",
                          }}
                        >
                          &#9650; {/* Up Arrow */}
                        </div>
                        <div
                          style={{
                            color:
                              sortColumn === header && sortDirection === "desc"
                                ? "black"
                                : "#D1D5DB",
                            fontSize: "10px",
                            userSelect: "none",
                          }}
                        >
                          &#9660; {/* Down Arrow */}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-blue-100 ${getRowColor(item)}`}
                  >
                    {headers.map((header) => {
                      if (header == "logo") {
                        return (
                          <td
                            key={header}
                            className="px-6 py-4 border-b border-gray-200 text-sm text-gray-500"
                          >
                            <img
                              src={`https://img.logo.dev/ticker/${item.symbol}?token=${logo_dev_key}`}
                              alt="--"
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "contain",
                              }}
                              onClick={() =>
                                handleImageClick(
                                  `https://img.logo.dev/ticker/${item.symbol}?token=${logo_dev_key}`
                                )
                              }
                              className="cursor-pointer"
                            />
                          </td>
                        );
                      } else if (header == "chart") {
                        return (
                          <Link
                            to={{
                              pathname: "/charts",
                              state: { symbol: item.symbol },
                            }}
                            onClick={function () {
                              localStorage.setItem("name", item.desc);
                              localStorage.setItem("symbol", item.symbol);
                            }}
                          >
                            View chart
                          </Link>
                        );
                      } else {
                        return (
                          <td
                            key={header}
                            className="px-6 py-4 border-b border-gray-200 text-sm text-gray-500"
                          >
                            {item[header] !== null && item[header] !== undefined
                              ? item[header].toString()
                              : "--"}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-6 py-4 border-b border-gray-200 text-center text-sm text-gray-500"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Popup Modal for Larger Image */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg relative">
              <button
                className="absolute top-0 right-0 p-2 text-red-500"
                onClick={closePopup} // Close the popup when clicking "X"
              >
                Close
              </button>
              <img
                src={popupImage}
                alt="Large Logo"
                className="max-w-full max-h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default class watchlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticker: "",
      text: "",
      mode: "dark",
      modeEmojis: { dark: "&#x1F31B;", light: "&#x1F31E;" },
      anchorEl: null,
      serverStatus: null,
      watchlistArr: [],
      progress: null,
      nyse_keys: null,
      showShow: false,
      lobbyPlay: false,
      lobbyPlayHandler: true,
      speechUtter: null,
      displayData: {},
      type: null,
      alignment: "show_list",
      isOpen: false,
      logo_dev_key: null,
    };

    this.showList = this.showList.bind(this);
    this.showWatchlist = this.showWatchlist.bind(this);
    this.collectWatchlistData = this.collectWatchlistData.bind(this);
  }

  toggleMenu = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

  handleChange = (event, newAlignment) => {
    if (newAlignment == "show_list") {
      this.showList(event);
    } else if (newAlignment == "show_watchlist") {
      this.showWatchlist(event);
    } else if (newAlignment == "watchlist_data") {
      this.collectWatchlistData(event);
    }
    this.setState({ alignment: newAlignment });
  };

  debounce = (callback, time) => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(callback, time);
  };

  showList = (event) => {
    let self = this;
    if (event != null) {
      this.setState({ type: event.target.value });
    }
    axios
      .get("https://vast-citadel-83110.herokuapp.com/list")
      .then(function (response) {
        let body = response.data;
        self.setState({
          displayData: {
            data: body,
          },
        });
      });
  };

  showWatchlist = (event) => {
    let self = this;
    this.setState({ type: event.target.value });
    axios
      .get("https://vast-citadel-83110.herokuapp.com/watchlist")
      .then(function (response) {
        if (typeof response.data === "object") {
          if (response.data.length === 0) {
            this.setState({
              displayData: {
                data: null,
              },
            });
          } else {
            self.setState({
              displayData: {
                data: response.data,
              },
            });
          }
        }
      });
  };

  collectWatchlistData = (event) => {
    this.setState({ type: event.target.value });
    localStorage.removeItem("watchlistArr");

    let promises = [];
    let self = this;

    axios
      .get("https://vast-citadel-83110.herokuapp.com/watchlist")
      .then(function (response) {
        response.data.forEach((el) => {
          promises.push(get_nyse(el.ticker));
        });

        kachingAudio.play();
        self.setState(
          {
            watchlistArr: [],
            progress: 0, // Initialize progress state
          },
          function () {
            const totalPromises = promises.length;

            for (let i = 0; i < promises.length; i++) {
              promises[i].then(function (response) {
                let watchObj = {};
                watchObj = response;
                self.setState(
                  {
                    watchlistArr: self.state.watchlistArr.concat(watchObj),
                    progress: ((i + 1) / totalPromises) * 100, // Update progress
                  },
                  function () {
                    localStorage.setItem(
                      "watchlistArr",
                      JSON.stringify(this.state.watchlistArr)
                    );
                    this.setState({
                      displayData: {
                        data: this.state.watchlistArr,
                      },
                    });

                    kachingAudio.play();
                  }
                );
              });
            }
          }
        );
      });
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

  ping() {
    let self = this;
    axios
      .get("https://vast-citadel-83110.herokuapp.com/ping")
      .then(function (response) {
        self.setState({ serverStatus: `Online (last checked: ${new Date()})` });
      })
      .catch(function (err) {
        self.setState({
          serverStatus: `Offline (last checked: ${new Date()})`,
        });
      });
  }

  renderWatchlist4pdf() {
    let watchlistArr = localStorage.getItem("watchlistArr");
    if (watchlistArr !== null) {
      watchlistArr = JSON.parse(watchlistArr);
      if (watchlistArr.length !== null) {
        let thingObj = watchlistArr.map(function (el, i) {
          return (
            <tr>
              <td>{el.desc}</td>
              <td>{el.symbol}</td>
              <td>{el.prev}</td>
            </tr>
          );
        });
        return (
          <>
            <table>
              {" "}
              {/* Wrap the table properly */}
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Ticker</th>
                  <th>Prev($)</th>
                </tr>
              </thead>
              <tbody>{thingObj}</tbody>
            </table>
            <div className="html2pdf__page-break"></div>
          </>
        );
      }
    }
  }

  testPdf() {
    let htmlThing = <table>{this.renderWatchlist4pdf()}</table>;
    htmlThing = ReactDOMServer.renderToStaticMarkup(htmlThing);
    let worker = html2pdf();
    worker.set({ margin: 10 }).from(htmlThing).save();
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

  componentDidMount() {
    this.setState({ logo_dev_key: process.env.REACT_APP_LOGO_DEV_KEY });
    let self = this;
    this.setState({ serverStatus: "Retrieving status please wait..." });
    localStorage.removeItem("watchlistArr");
    document.body.style.backgroundImage = "none";
    let local_mode = localStorage.getItem("mode");
    if (local_mode !== null) {
      this.changeColor(local_mode);
    } else {
      this.changeColor(this.state.mode);
    }

    this.showList(null);

    this.ping();
    setInterval(function () {
      self.ping();
    }, 60 * 1000);
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

    return (
      <div className="watchlist">
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
                <h2 style={{ margin: 0, color: "white" }}>Watchlist</h2>

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
                <StyledLink to="/">Home</StyledLink>
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

              {/* Help Button and Popover */}
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
                  Help
                  <br />
                  <br />
                  listing directory
                  <br />
                  Show the NYSE listing directory
                  <br />
                  <br />
                  watchlist directory
                  <br />
                  show entries stored in watchlist
                  <br />
                  <br />
                  watchlist data fetch
                  <br />
                  retrieve data related to stocks listed in the watchlist Source
                  mode
                  <br />
                  <br />
                  The input box can be used to add a company to the watchlist,
                  delete a company from the watchlist or search for a company in
                  the watchlist.
                </Popover>
              </span>

              {/* Music Button */}
              <span>
                <button
                  id="lobby_music"
                  type="button"
                  onClick={(event) => {
                    this.setState(
                      { lobbyPlay: !this.state.lobbyPlay },
                      function () {
                        this.setState({ lobbyPlayHandler: !lobbyPlayHandler });
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
              <span>
                <button onClick={() => this.testPdf()}>
                  <IconContext.Provider
                    value={{
                      color: "white",
                      size: 32,
                      className: "global-class-name",
                    }}
                  >
                    <IoIosDownload />
                  </IconContext.Provider>
                </button>
              </span>
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
            </div>
          </div>
        </nav>

        <div style={{ textAlign: "center" }}>
          <p
            style={{ fontSize: "12px", color: "white" }}
          >{`Server Status: ${this.state.serverStatus}`}</p>
        </div>
        <div className="pb-2">
          <ToggleButtonGroup
            color="primary"
            value={this.state.alignment}
            exclusive
            onChange={this.handleChange}
            aria-label="Platform"
          >
            <ToggleButton
              value="show_list"
              sx={{
                color:
                  this.state.alignment === "show_list"
                    ? "inherit"
                    : "rgba(153, 153, 153, 1)", // Default color for selected button, white for others
              }}
            >
              Listing Directory
            </ToggleButton>
            <ToggleButton
              value="show_watchlist"
              sx={{
                color:
                  this.state.alignment === "show_watchlist"
                    ? "inherit"
                    : "rgba(153, 153, 153, 1)", // Default color for selected button, white for others
              }}
            >
              Watchlist Directory
            </ToggleButton>
            <ToggleButton
              value="watchlist_data"
              sx={{
                color:
                  this.state.alignment === "watchlist_data"
                    ? "inherit"
                    : "rgba(153, 153, 153, 1)", // Default color for selected button, white for others
              }}
            >
              Watchlist Data Fetch
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div
          id="lists"
          style={{
            textAlign: "center",
            position: "relative",
            paddingBottom: "10rem",
          }}
        >
          {
            <DataTable
              data={this.state.displayData}
              type={this.state.type}
              logo_dev_key={this.state.logo_dev_key}
            />
          }
        </div>
      </div>
    );
  }
}
