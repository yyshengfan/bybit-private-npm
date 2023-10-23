
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf definition
const packageDefinition = protoLoader.loadSync('path/to/your/proto/file.proto');
const myServiceProto = grpc.loadPackageDefinition(packageDefinition).myService;

// Create a gRPC client
const client = new myServiceProto.MyService('localhost:50051', grpc.credentials.createInsecure());

// Make a gRPC request
client.myMethod({}, (error, response) => {
  if (error) {
    console.error('Error:', error);
  } else {
    // Decode the response using the decode function
    const decodedResponse = grpc.decode(response, myServiceProto.MyResponse);

    // Access the decoded data
    console.log('Decoded response:', decodedResponse);
  }
});