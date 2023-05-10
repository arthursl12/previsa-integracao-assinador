/**
 * Classe FieldHelper:
 * Trata campos advindos da requisição 'OtherProperties' da API do Ploomes
 */
class FieldHelper {
  constructor(json) {
    this.jsonField = json;
  }

  /**
   * Filtra apenas os campos 'Value' não nulos desse campo
   * @returns {Array} Array de triplas: [código do campo, tipo da resposta, valor da resposta]
   */
  getNonNullValues() {
    const nonNull = [];
    for (const key of Object.keys(this.jsonField)) {
      // Encontrar os valor(es) não-nulo(s) relacionado(s) a esse campo
      if (key.includes("Value") && this.jsonField[key] !== null) {
        nonNull.push([this.jsonField.FieldKey, key, this.jsonField[key]]);
      }
    }
    return nonNull;
  }

  /**
   * Encontra o valor preenchido (resposta) do campo
   * @returns {Array} A tripla com o valor preenchido: [código do campo, tipo da resposta, valor da resposta]
   */
  findCorrectValue() {
    const nonNull = this.getNonNullValues();
    if (nonNull.length === 1 && nonNull[0][1] !== "DateTimeValue") {
      // Só uma subpropriedade não-nula e não é data => só uma possibilidade
      return nonNull[0];
    }
    if (nonNull.length === 1) {
      // Só uma subpropriedade e é data => transforma e retorna
      const data = nonNull[0][2].split("T")[0];
      const newDataStr = `${data.slice(8, 10)}/${data.slice(5, 7)}/${data.slice(
        0,
        4
      )}`;
      nonNull[0][2] = newDataStr;
      return nonNull[0];
    }

    // Mais de uma, há que decidir
    if (nonNull.length == 3 && nonNull.find((e) => e[1] == "ObjectValueName")) {
      // Campo preenchido com opções cadastradas
      return nonNull.find((e) => e[1] == "ObjectValueName");
    }
    if (nonNull.length == 4 && nonNull.find((e) => e[1] == "UserValueName")) {
      // Campo preenchido com um usuário
      return nonNull.find((e) => e[1] == "UserValueName");
    }
    if (
      nonNull.length == 3 &&
      nonNull.find((e) => e[1] == "AttachmentValueName")
    ) {
      /*
       * Campo preenchido com um anexo
       * TODO: baixar o arquivo ao invés de só passar o nome
       */
      return nonNull.find((e) => e[1] == "AttachmentValueName");
    }
    // Outro tipo de preenchimento, há que fazer outra regra
    console.error("Sem regras para :");
    console.error(nonNull);
  }
}

module.exports = FieldHelper;
