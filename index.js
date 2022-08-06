const protoLoader = require("@grpc/proto-loader");
const { createHmac } = require("crypto");
const protobuf = require("protobufjs");
const grpc = require("@grpc/grpc-js");
const path = require("path");
const long = require("long");
const fs = require("fs");

const MSB = 0x80;
const REST = 0x7f;
const MSBALL = ~REST;

const pbRootPathDefault = "./node_modules/@sec-rc/cmdh-node-sdk/proto3";
let clientGrpc, pbRoot;

/**
 * pb项目目录，所有使用的请求主目录
 */

/**
 * 获取pb下所有的pb文件目录
 * @param {*} dir
 * @param {*} list
 * @returns
 */
function getFiles(dir, list = []) {
  const arr = fs.readdirSync(dir);
  while (arr.length) {
    const item = arr.pop();
    const fullpath = path.join(dir, item);
    const stats = fs.statSync(fullpath);
    if (!stats.isDirectory()) {
      if (/\.proto$/.test(fullpath)) list.push(fullpath);
    } else {
      getFiles(fullpath, list);
    }
  }
  return list;
}

/**
 * 数字转换为buffer
 * @param {*} num 数字
 * @returns
 */
function encode(num) {
  if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(`Could not encode ${num} as varint`);
  }
  const buffer = [];
  let bytes = 0;

  const newNum = long.fromNumber(num);
  let numLong = newNum.shl(1);

  if (numLong < 0) {
    numLong = ~numLong;
  }
  while (numLong & MSBALL) {
    buffer[bytes++] = (numLong & REST) | MSB;
    numLong = numLong.shr(7);
  }
  buffer[bytes] = numLong | 0;

  return buffer;
}

/**
 * 业务签名方法，参数固定
 * @param {*} params 参数
 * @param {*} base64secret 业务传入
 * @returns
 */
function getCmdhSign(params, base64secret) {
  const funcNamebuf = Buffer.from(params.name);
  const appNamebuf = Buffer.from(params.invoke.app_name);
  const argTypebuf = Buffer.from(params.args.type);
  const payloadbuf = Buffer.from(params.args.payload);
  const apiLevelbuf = Buffer.from(encode(params.api_level));
  const noncebuf = Buffer.from(encode(params.invoke.nonce));
  const signatureModebuf = Buffer.from(encode(params.invoke.signature_mode));
  const operatorTypebuf = Buffer.from(encode(params.operator.type));
  const requestTimebuf = Buffer.from(encode(params.invoke.request_time_e6));
  const operatorIdbuf = Buffer.from(encode(params.operator.id));

  const buf = Buffer.concat([
    funcNamebuf,
    appNamebuf,
    argTypebuf,
    payloadbuf,
    apiLevelbuf,
    noncebuf,
    signatureModebuf,
    operatorTypebuf,
    requestTimebuf,
    operatorIdbuf,
  ]);

  const secret = Buffer.from(base64secret, "base64").toString("ascii");
  const hmac = createHmac("sha256", secret);
  const sign = hmac.update(buf).digest("base64");
  return sign;
}

function initClientGrpc(cmdhInfo) {
  const { hostGrpc, pbRootPath = pbRootPathDefault } = cmdhInfo;
  const protoPath = path.join(process.cwd(), pbRootPath);
  if (!clientGrpc) {
    const protoCmdPath = path.join(
      process.cwd(),
      `${pbRootPath}/cmd/command.proto`
    );
    const options = {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protoPath],
    };
    const packageDefinition = protoLoader.loadSync(protoCmdPath, options);
    const commandProto = grpc.loadPackageDefinition(packageDefinition);
    clientGrpc = new commandProto.cmd.Commander(
      hostGrpc,
      grpc.credentials.createInsecure()
    );
  }

  if (!pbRoot) {
    // 项目下所有的pb转换为pb树
    pbRoot = protobuf.loadSync(getFiles(protoPath));
  }
}

/**
 * 请求方法
 * @param {*} funInfo 业务请求信息
 * @param {*} cmdhInfo cmdh配置信息
 * @param {*} payload 业务请求参数
 * @returns
 */
async function sendGrpc(funInfo, cmdhInfo, payload) {
  const { hostGrpc, appname, secret } = cmdhInfo;
  // init
  initClientGrpc(cmdhInfo);
  const ReqObject = pbRoot.lookupType(funInfo.reqPath);
  const ResObject = pbRoot.lookupType(funInfo.resPath);
  const user = ReqObject.encode(payload).finish();

  let d = Date.now();
  const data = {
    invoke: {
      nonce: Math.floor(d / 1000),
      request_time_e6: d * 1000,
      app_name: appname,
      signature_mode: 1,
    },
    operator: { type: 1, id: 1 },
    name: funInfo.funName,
    api_level: 1,
    args: {
      type: "pb",
      payload: user,
    },
  };

  const sign = getCmdhSign(data, secret);
  if (!clientGrpc) {
    clientGrpc = new commandProto.cmd.Commander(
      hostGrpc,
      grpc.credentials.createInsecure()
    );
  }
  const meta = new grpc.Metadata();
  meta.add("signature", sign);

  return new Promise((resolve, reject) => {
    clientGrpc.Execute(data, meta, function (err, response) {
      if (err) {
        reject(err);
      } else {
        const resInfo = ResObject.decode(response.result.payload);
        resolve(resInfo);
      }
    });
  });
}

/**
 * 预留方法
 */
async function sendHttp() {}

module.exports = { sendGrpc, sendHttp };
