/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendGrpc } = require("../index");
const funInfo = {
  funName:
    "/bonus.Bonus/RetrieveBonus",
  reqPath: "bonus.RetrieveBonusRequest",
  resPath: "bonus.RetrieveBonusResponse",
  pbRootPath: "./pb",
};

const cmdhInfo = {
  hostGrpc:
    "command-hub-service-unify-test-3.test3.efficiency.ww5sawfyut0k.bitsvc.io:9090",
  appname: "piidebug",
  secret: "Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=",
  pbRootPath: "./pb/proto3",
};

async function main() {
  let i = 0;
  while (i < 1) {
    const res = await sendGrpc(funInfo, cmdhInfo, {
      "brokerId": 0,
      "bizType": 1,
      "userId": 4703809,
      "reqId": "AWAR.4703809.00002"
    });
    console.log(res);
    i++;
  }
}

main();
