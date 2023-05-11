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
  hostname: "099c-200-199-128-74.ngrok-free.app",
  path: "/webhook",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

// const data = {
//   event: {
//     body: {
//       data: {
//         documents: [
//           {
//             createdBy: null,
//             creationDate: "2023-05-08T12:58:02.2845424+00:00",
//             folder: null,
//             id: "9d86a228-5d36-4b29-8810-239befee37f1",
//             name: "05-Manual_Padronizacao_Contabil (2)",
//           },
//         ],
//         type: "DocumentConcluded",
//       },
//       client_ip: "104.41.26.175",
//     },
//   },
// };

const data = {
  type: "DocumentConcluded",
  data: {
    id: "3530a2b4-6c86-4fd9-8a46-d00876fbac62",
    name: "2427_0_TESTES - LEONARDO (1) (1)",
    creationDate: "2023-05-10T17:35:35.2006422+00:00",
    updateDate: "2023-05-10T17:37:34.0691231+00:00",
    folder: {
      id: "4b067a66-b59b-465d-7b71-08db4fe855fd",
      name: "\t TESTES - LEONARDO",
      parentId: null,
    },
    organization: {
      id: "a9310e80-7497-4d80-423b-08d979cd6e61",
      name: "Previsa Assessoria",
      identifier: "36060956000126",
      owner: null,
    },
    createdBy: {
      id: "56b8a97b-7438-4111-b2ea-7d9b72a39669",
      name: "Leonardo de Oliveira Neves Pereira",
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
