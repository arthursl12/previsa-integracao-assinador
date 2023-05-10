require("dotenv").config();
const http = require("http");
const https = require("https");
const axios = require("axios");

const path = require("path");
const { sendMailHTMLWithAttachments } = require("./emailer");
const FieldHelper = require("./fields");

const logLib = require("./log");
const { log } = logLib;
const fs = require("fs");
const port = 3000;
PDF_BASE_FOLDER = "pdfs/";

function stripSpaces(str) {
  return str.replace(/^\s+|\s+$/g, "");
}

function downloadPDF(url, filename) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "X-Api-Key": process.env.SIGNER_PREVISA,
      },
    };

    https
      .get(url, options, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to download PDF: ${response.statusCode} - ${response.statusMessage}`
            )
          );
          return;
        }

        const fileStream = fs.createWriteStream(filename);
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          resolve(`PDF saved to ${filename}`);
        });

        fileStream.on("error", (error) => {
          reject(error);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function sendAPIRequest(url, method, headers, body) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: headers,
    };

    const request = https.request(url, options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data,
        });
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (body) {
      request.write(JSON.stringify(body));
      // request.write(body);
    }

    request.end();
  });
}

function findDate(deal_data, logfn = console.log) {
  const keyDataResponsabil = "deal_A667F0F5-6834-4605-B49B-9974108C7843";
  let dataInicio = null;
  for (let i = 0; i < deal_data.OtherProperties.length; i++) {
    const fh = new FieldHelper(deal_data.OtherProperties[i]);
    const correct = fh.findCorrectValue(); // Acha valor preenchido

    // Encontra o nome correto do campo no Ploomes
    const value = correct[2];

    if (deal_data.OtherProperties[i].FieldKey === keyDataResponsabil) {
      dataInicio = value;
      break;
    }
  }
  if (!dataInicio) {
    logfn(
      `[${deal_data.id}] Data de início da responsabilidade vazia, usando a de hoje`
    );
    dataInicio = new Date().toISOString();
    const data = dataInicio.split("T")[0];
    const newDataStr = `${data.slice(8, 10)}/${data.slice(5, 7)}/${data.slice(
      0,
      4
    )}`;
    dataInicio = newDataStr;
  } else {
    logfn(
      `[${deal_data.Id}] Data de início da responsabilidade: ${dataInicio}`
    );
  }

  dataInicio = dataInicio.replace(/\//g, " ");
  return dataInicio;
}

async function handleWebhookRequest(req, res) {
  if (req.method === "POST" && req.url === "/webhook") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    await new Promise((resolve) => {
      req.on("end", resolve);
    });

    try {
      ipAddress =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const url = req.url;
      const hostname = req.headers.host;
      log(`Received POST from ${ipAddress} for URL ${hostname}${url} `);

      const data = await JSON.parse(body);
      console.log("Webhook data received:", data);
      const id = data.event.body.data.documents[0].id;
      const type = data.event.body.data.type;
      log(`Tipo da operação ${type}`);

      if (type === "DocumentConcluded") {
        log(`Requisitando PDF do contrato de id: ${id}`);
        const pdfname = data.event.body.data.documents[0].name + ".pdf";
        log(`O PDF tem nome de: ${pdfname}`);

        // Obter PDF do assinador
        const destPath = PDF_BASE_FOLDER + pdfname;
        await downloadPDF(
          `https://assinador.previsa.com.br/api/documents/${id}/content`,
          destPath
        );
        log(`PDF salvo em ${destPath}`);

        // Obter nome da empresa do assinador
        let response = await sendAPIRequest(
          `https://assinador.previsa.com.br/api/documents/${id}`,
          "GET",
          {
            "X-Api-Key": process.env.SIGNER_PREVISA,
          }
        );
        const contract_data = await JSON.parse(response.body);

        const nome_empresa = stripSpaces(contract_data.folder.name);
        log(`A empresa é ${nome_empresa}`);

        // Obter o informações do cliente
        response = await sendAPIRequest(
          `https://public-api2.ploomes.com/Contacts?$filter=Name+eq+'${nome_empresa}'+and+Status/Name+eq+'Ativo'&$expand=Status`,
          "GET",
          {
            "User-key": process.env.PLOOMES_KEY,
          }
        );
        let client_data = await JSON.parse(response.body);
        client_data = client_data.value[0];
        const cnpj = client_data.CNPJ;
        log(`O CNPJ do cliente é ${cnpj}`);

        // Obter o ID do negócio no estágio 'Ag. Assinatura do contrato'
        const id_ag_assinatura = 206887;
        response = await sendAPIRequest(
          `https://public-api2.ploomes.com/Deals?$filter=ContactName+eq+'${nome_empresa}'+and+StageId+eq+${id_ag_assinatura}&$expand=OtherProperties`,
          "GET",
          {
            "User-key": process.env.PLOOMES_KEY,
          }
        );
        const deal_data = await JSON.parse(response.body);
        const deal_id = deal_data.value[0].Id;
        log(
          `O ID no Ploomes do seu negócio na fase 'Ag. Assinatura do contrato' é ${deal_id}`
        );

        // Obter a data de início da repsonsabilidade previsa
        const dataInicio = findDate(deal_data.value[0]);

        // Email de erro que não conseguiu achar o card
        await sendMailHTMLWithAttachments(
          // "relacionamento@previsa.com.br,"+
          // "tayedaribeiro@previsa.com.br,"+
          // "leonardopereira@previsa.com.br,"+
          "arthursouto@previsa.com.br",
          `Contrato já concluído no assinador - ${nome_empresa} - ${cnpj}$`,
          `Olá,<br><br>O contrato da empresa ${nome_empresa}, de CNPJ: ${cnpj} já foi devidamente assinado no AC e se encontra em anexo.<br><strong>Favor inserí-lo no campo respectivo no estágio no funil 'Oportunidades - Previsa'</strong><br><br>Att.`,
          {
            filename: `${nome_empresa} ${dataInicio} ${cnpj}.pdf`,
            path: `${destPath}`,
          },
          log
        );

        await sendMailHTMLWithAttachments(
          // "carolina@previsa.com.br,"+
          // "ingridbernardes@previsa.com.br,"+
          // "leonardopereira@previsa.com.br,"+
          "arthursouto@previsa.com.br",
          `Contrato já concluído no assinador - ${nome_empresa} - ${cnpj}$`,
          `Olá,<br><br>O contrato da empresa ${nome_empresa}, de CNPJ: ${cnpj} já foi devidamente assinado no AC e se encontra em anexo.<br>Att.`,
          {
            filename: `${nome_empresa} ${dataInicio} ${cnpj}.pdf`,
            path: `${destPath}`,
          },
          log
        );

        // Responder com código 200 para o remetente
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("Dado recebido do webhook\n");
      }
    } catch (error) {
      console.error("Error parsing webhook data:", error);
      res.statusCode = 400;
      res.setHeader("Content-Type", "text/plain");
      res.end("Error parsing webhook data\n");
    }
  } else if (req.method === "GET" && req.url === "/") {
    // Handle GET requests by displaying a simple webpage
    ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const url = req.url;
    const hostname = req.headers.host;
    log(`Received GET from ${ipAddress} for URL ${hostname}${url} `);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.end(
      "<html><body><h1>Welcome to my webhook server!</h1></body></html>\n"
    );
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not found\n");
  }
}

async function startWebhookServer() {
  const server = http.createServer(handleWebhookRequest);

  await new Promise((resolve) => {
    server.listen(port, () => {
      log(`Webhook server listening at http://localhost:${port}`);
      resolve();
    });
  });
}

startWebhookServer().catch((error) => {
  console.error("Error starting webhook server:", error);
});
