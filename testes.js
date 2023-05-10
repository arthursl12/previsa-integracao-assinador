const http = require("http");
const https = require("https");

// const options = {
//   hostname: "localhost",
//   port: 3000,
//   path: "/webhook",
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
// };

const options = {
  hostname: "2397-138-122-106-146.ngrok-free.app",
  path: "/webhook",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

const data = {
  event: {
    body: {
      data: {
        documents: [
          {
            createdBy: null,
            creationDate: "2023-05-08T12:58:02.2845424+00:00",
            folder: null,
            id: "9d86a228-5d36-4b29-8810-239befee37f1",
            name: "05-Manual_Padronizacao_Contabil (2)",
          },
        ],
        type: "DocumentConcluded",
      },
      client_ip: "104.41.26.175",
    },
  },
};

const requestData = JSON.stringify(data);

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on("data", (d) => {
    process.stdout.write(d);
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(requestData);
req.end();
