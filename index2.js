const apiKey = YourApiKey;
const accessKey = YourAccessKey;
const accessToken = YourAccessToken;

const project = grandeur.init(apiKey, accessKey, accessToken);
project.auth().login(YourUserEmail, YourUserPassword);

project.devices().device(YourDeviceId).data().on("millis", (path, value) => document.getElementById("data").innerHTML = value);