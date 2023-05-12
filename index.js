const protoLoader = require("@grpc/proto-loader");
const { createHmac } = require("crypto");
const protobuf = require("protobufjs");
const axios = require("axios");
const { snakeCase, isObject, forIn } = require("lodash");
const grpc = require("@grpc/grpc-js");
const path = require("path");
const long = require("long");
const fs = require("fs");

const MSB = 0x80;
const REST = 0x7f;
const MSBALL = ~REST;
const pbRootPathDefault = "./node_modules/@sec-rc/cmdh-node-sdk/pb/proto3";
const pbFunRootPathDefault = "./node_modules/@sec-rc/cmdh-node-sdk/pb";

let clientGrpc,
  pbRoot = {};

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

function snakeCaseObj(params) {
  const obj = {};
  forIn(params, (value, key) => {
    obj[`${snakeCase(key)}`] = isObject(value) ? snakeCaseObj(value) : value;
  });
  return obj;
}

/**
 * 业务签名方法，参数固定
 * @param {*} params 参数
 * @param {*} base64secret 业务传入
 * @returns
 */
function getCmdhSign(params, base64secret) {
  params = params.args.type === "json" ? snakeCaseObj(params) : params;
  const funcNamebuf = Buffer.from(params.name);
  const appNamebuf = Buffer.from(params.invoke.app_name);
  const argTypebuf = Buffer.from(params.args.type);
  const payloadbuf =
    params.args.type === "json"
      ? Buffer.from(params.args.payload, "base64")
      : Buffer.from(params.args.payload);
  const apiLevelbuf = Buffer.from(encode(params.api_level));
  const noncebuf = Buffer.from(encode(params.invoke.nonce));
  const signatureModebuf = Buffer.from(encode(params.invoke.signature_mode));
  const operatorTypebuf = Buffer.from(encode(params.operator.type));
  const requestTimebuf = Buffer.from(
    encode(params.invoke.request_time_e6 || params.invoke.request_time_e_6)
  );
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

/**
 * pb初始化，参数固定
 * @param {*} cmdhInfo 参数
 * @param {*} funInfo 参数
 * @returns
 */
function initClientGrpc(cmdhInfo, funInfo) {
  const { hostGrpc, pbRootPath = pbRootPathDefault } = cmdhInfo;
  let { pbRootPath: funPbRootPath } = funInfo;
  if (!funPbRootPath) funPbRootPath = pbFunRootPathDefault;
  const cmdhPbPath = path.join(process.cwd(), pbRootPath);
  const funPbPath = path.join(process.cwd(), funPbRootPath);
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
      includeDirs: [pbRootPath],
    };
    const packageDefinition = protoLoader.loadSync(protoCmdPath, options);
    const commandProto = grpc.loadPackageDefinition(packageDefinition);
    clientGrpc = new commandProto.cmd.Commander(
      hostGrpc,
      grpc.credentials.createInsecure(),
      {
        keepalive_time_ms: 2 * 60 * 60 * 1000,
        keepalive_timeout_ms: 60 * 1000,
      }
    );
  }

  if (!pbRoot["cmdh"]) {
    // 项目下所有的pb转换为pb树
    pbRoot["cmdh"] = protobuf.loadSync(getFiles(cmdhPbPath));
  }
  if (!pbRoot[funInfo.funName]) {
    // 项目下所有的pb转换为pb树
    const res = getFiles(funPbPath);
    pbRoot[funInfo.funName] = protobuf.loadSync(res);
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
  await initClientGrpc(cmdhInfo, funInfo);
  const ReqObject = pbRoot[funInfo.funName].lookupType(funInfo.reqPath);
  const ResObject = pbRoot[funInfo.funName].lookupType(funInfo.resPath);
  const user = ReqObject.encode(payload).finish();

  let d = Date.now();
  const data = {
    invoke: {
      app_name: appname,
      nonce: Math.floor(d / 1000),
      request_time_e6: d * 1000,
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
async function sendHttp(funcName, cmdhConf, payload) {
  try {
    const { host, route } = cmdhConf;
    const { appname: appName, secret } = cmdhConf;
    const requestTime = ~~(+new Date() / 1000) * 1e6;
    const signData = {
      invoke: {
        appName,
        nonce: 123,
        requestTimeE6: requestTime,
        signatureMode: 1,
      },
      operator: {
        type: 1,
        id: 123,
      },
      name: funcName,
      apiLevel: 1,
      args: {
        type: "json",
        payload: Buffer.from(JSON.stringify(payload)).toString("base64"),
      },
    };

    const sign = getCmdhSign(signData, secret);
    const res = await axios({
      url: `${host}${route}`,
      data: signData,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Grpc-Metadata-signature": sign,
      },
    })
    const respayload = Buffer.from(res.data.result.payload, "base64").toString(
      "utf8"
    );
    const item = JSON.parse(respayload) || {};
    return item;
  } catch (error) {
    throw error;
  }
}

module.exports = { sendGrpc, sendHttp };
