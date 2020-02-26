 # NodeJS ExternalList Demo
 
 This demo's purpose is to show a little example of a Node Server that acts as an external service sending data in real time to a GladToLink ExternalList.
 
 The Server uses two parameters: **"search"** and **"data"**, these two parameters are used for filtering the data is about to be sent as a response (plain search and which page).
 
 Whether the http request is a GET or a POST request, the server is prepared for handling both cases, retrieving the parameters from the headers or from the request body.
