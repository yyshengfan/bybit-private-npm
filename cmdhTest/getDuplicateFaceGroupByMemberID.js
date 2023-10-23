/**
 * @description 描述
 * @author hui.tian
 * @date 2022-08-04 19:12:03
 * @last_modified_time 2022-08-04 19:12:03
 */
const { sendGrpc } = require("../index");
const funInfo = {
  funName: "/bybit.kyc.info.v1.InfoAPI/GetDuplicateFaceGroupByMemberID",
  reqPath: "bybit.kyc.info.v1.GetDuplicateFaceGroupByMemberIDRequest",
  resPath: "bybit.kyc.info.v1.GetDuplicateFaceGroupByMemberIDResponse",
  pbRootPath: "/pb",
};

const cmdhInfo = {
  hostGrpc:
    "command-hub-service-cht-test-1.test.efficiency.ww5sawfyut0k.bitsvc.io:9090",
  appname: "piidebug",
  secret: "Zys4bjBLVjJDQytwaXJXcXc4aUxiSkdrb2JJeVgxQU9BSFRERWRnM1JMMD0=",
  pbRootPath: "./pb/proto3",
};

async function main() {
  const res = await sendGrpc(funInfo, cmdhInfo, {
    memberId: [2123123, 45678],
  });
  console.log(res);
}

main();
