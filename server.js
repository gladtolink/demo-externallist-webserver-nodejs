const http = require("http");
const randomCollection = require("./randomCollection");

const SERVER_IP = "127.0.0.1";
const SERVER_PORT = 3000;
const ELEMENTS_PER_PAGE = 25;
const COLLECTION = randomCollection(90); //collection of max x elements

var pages = [];


//create server and define request handling behaviour
let server = http.createServer((req, res) => {

  let method = req.method;

  //setting headers and status
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods","GET,PUT,POST,DELETE,PATCH,OPTIONS");

  // this variable will store settings data
  let jsonData = "{}";

  //if it's a GET request, it'll retrieve the data from the headers and assemble an stringified JSON with it.
  if (method === "GET") {
    let search = req.headers.search;
    let page = req.headers.page;
    if (search != null && page != null)
      jsonData = `{"search":"${search}" ,"page":${page}}`;
    console.log("jsonData", jsonData);
  }

  //if it's a POST request, this listener retrieves POST data.
  req.on("data", data => {
    jsonData += data.toString();
  });

  //once the request process has ended, it will start writing data on the response.
  req.on("end", () => {
    if (method === "GET" || method === "POST")
      treatResponse(JSON.parse(jsonData), res);
    res.end();
  });
});




setUpPages();
startLogs();
server.listen(SERVER_PORT, SERVER_IP); //start server
console.log("Server running\n");




//Functions

//this function starts printing the server info logs
function startLogs(){
  console.log("\n=========Collection===========\n");
  console.log(COLLECTION);
  console.log("\ntotal number of elements: ", COLLECTION.length);
  console.log("\n============Pages=============\n");
  console.log(pages);
  console.log("\ntotal pages: ", pages.length);
  console.log("\n==============================\n");
}

//this function handles errors and the response writing.
function treatResponse(data, res) {
  try {
    sendPage(data, res);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.write("Error: ", e);
  }
}

//this function writes on the response the current page.
function sendPage(json, res) {
  let pagesToSent = pages;
  
  if (json["search"]) { // if it has search criteria, pagesTo
    pagesToSent = filterPages(json["search"]);
  }
  
  try {
    console.log("\n============Request===========\n");
    console.log("Page: ", json["page"], "|  Search: ", json["search"]);
    if (pagesToSent[json["page"] - 1]) {
      res.write(JSON.stringify(pagesToSent[json["page"] - 1]));
      console.log("\n============Response========\n");
      console.log("Sent: ", pagesToSent[json["page"] - 1]);
    } else {
      res.write("");
    }
  } catch (e) {
    throw e;
  }
}

//this function divides all the items into an array of pages and sets it global
function setUpPages() {
  let totalPages = COLLECTION.length / ELEMENTS_PER_PAGE;

  // if (totalPages > 1) {
  let index = 0;
  for (let i = 0; i < totalPages; i++) {
    let page = [];
    for (let j = 0; j < ELEMENTS_PER_PAGE && index + j < COLLECTION.length; j++) {
      page.push(COLLECTION[j + index]);
    }
    index += ELEMENTS_PER_PAGE;
    pages.push(page);
  }
}

//this function performs a plain search through all the items and divides them into pages. Returns the filtered pages
function filterPages(crit) {
  let filteredPages = [];
  let pagesCount = 0;

  let createFilteredPage = () => {
    if (filteredPages[pagesCount]) {
      return filteredPages[pagesCount];
    } else {
      let filteredPage = [];
      filteredPages[pagesCount] = filteredPage;
      return filteredPages[pagesCount];
    }
  };

  for (let page of pages) {
    let filteredPage = createFilteredPage();

    for (let i = 0; i < page.length; i++) {
      if (page[i].value.toString().includes(crit)) {
        filteredPage.push(page[i]);
        if (filteredPage.length == ELEMENTS_PER_PAGE) {
          pagesCount++;
          filteredPage = createFilteredPage();
        }
      }
    }
  }

  return filteredPages;
}
