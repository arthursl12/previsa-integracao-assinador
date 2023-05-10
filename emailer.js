const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Envia um email usando a biblioteca nodemailer no outlook.
 * O remetente e sua senha deverão estar no arquivo ".env" do projeto como
 * "MAIL_USER" e "MAIL_PASSWORD"
 * @param {Array[String]|String} recipients Destinatários (lista de)
 * @param {Array} attachments Lista de anexos (objetos {filename:"mypdf.pdf", path:"Z:/myfolder/thepdf.pdf"})
 * @param {String} subject Assunto do email
 * @param {String} text Texto do email
 * @param {function} logfn Função de logging
 */
async function sendMailWithAttachments(
  recipients,
  subject,
  text,
  attachments = undefined,
  logfn = console.log
) {
  // Gerenciador de email
  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // Trata lista de destinatários
  let cleanRecipients = "";
  if (Array.isArray(recipients)) {
    let i = 0;
    for (const rec of recipients) {
      cleanRecipients += rec;
      if (i < recipients.length - 1) {
        cleanRecipients += ",";
      }
      i += 1;
    }
  } else {
    cleanRecipients = recipients;
  }

  // Opções do email
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: cleanRecipients,
    subject,
    text,
    attachments,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logfn(error);
        reject(error);
      } else {
        logfn(`Email enviado:${info.response}`);
        resolve(info);
      }
    });
  });
}

/**
 * Envia um email com HTML no texto usando a biblioteca nodemailer no outlook.
 * O remetente e sua senha deverão estar no arquivo ".env" do projeto como
 * "MAIL_USER" e "MAIL_PASSWORD"
 * @param {Array[String]|String} recipients Destinatários (lista de)
 * @param {Array} attachments Lista de anexos (objetos {filename:"mypdf.pdf", path:"Z:/myfolder/thepdf.pdf"})
 * @param {String} subject Assunto do email
 * @param {String} html Texto do email (html)
 * @param {function} logfn Função de logging
 */
async function sendMailHTMLWithAttachments(
  recipients,
  subject,
  html,
  attachments = undefined,
  logfn = console.log
) {
  // Gerenciador de email
  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // Trata lista de destinatários
  let cleanRecipients = "";
  if (Array.isArray(recipients)) {
    let i = 0;
    for (const rec of recipients) {
      cleanRecipients += rec;
      if (i < recipients.length - 1) {
        cleanRecipients += ",";
      }
      i += 1;
    }
  } else {
    cleanRecipients = recipients;
  }

  // Opções do email
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: cleanRecipients,
    subject,
    html,
    attachments,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logfn(error);
        reject(error);
      } else {
        logfn(`Email enviado:${info.response}`);
        resolve(info);
      }
    });
  });
}

module.exports = {
  sendMailWithAttachments,
  sendMailHTMLWithAttachments,
};
