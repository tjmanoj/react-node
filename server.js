const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const Document = require('./document');
const IBM = require('ibm-cos-sdk');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(express.static('build'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const uri =
  'mongodb+srv://jeyanthvijay2000:drj23012023@cluster0.izqp1qo.mongodb.net/?retryWrites=true&w=majority';

const config = {
  endpoint: 'https://s3.us-south.cloud-object-storage.appdomain.cloud',
  apiKeyId: 'PPdDPrIZFYjBIcLKnwMJdQEjhhk0681lX9rMIzt9BB1_',
  serviceInstanceId:
    'crn:v1:bluemix:public:cloud-object-storage:global:a/0f7e3a62d36c459f8bddb84c24f289d5:68bf8de0-e518-4295-bbcc-332d06e0be35::',
  signatureVersion: 'iam',
};

const s3 = new IBM.S3(config);

const connectedClientsPerDocument = {};

async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Db connected Successfully');
  } catch (error) {
    console.log('Error occurred: ', error);
  }
}
connectToDatabase();

const defaultValue = '';

app.use(express.static('build'));

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // You can now use the token as needed, for example, logging it
  console.log('Received token from client:', token);
  // You might also want to validate the token or associate it with a user

  // Continue with the connection
  next();
});

io.on('connection', (socket) => {
  let documentId; // Define documentId variable for this connection

  socket.on('get-document', async (docId, documentName) => {
    documentId = docId; // Set the documentId for this connection

    const document = await findOrCreateDocument(documentId, documentName);
    socket.join(documentId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });

    socket.on('bucket-creation', async (bucketName) => {
      await createBucket(bucketName);
      //console.log(bucketName)
    });

    socket.on('save-button', async (file) => {
      await createTextFile(file);
    });

    // Store the connected client name and emit the updated list of connected clients
    const clientName = socket.handshake.auth.token
      ? socket.handshake.auth.token.trim()
      : '';
    if (!connectedClientsPerDocument[documentId]) {
      connectedClientsPerDocument[documentId] = [];
    }
    connectedClientsPerDocument[documentId].push(clientName);
    io.to(documentId).emit(
      'connected-clients',
      connectedClientsPerDocument[documentId]
    );

    socket.on('disconnect', () => {
      // Remove the client name from the list for the specific document
      if (connectedClientsPerDocument[documentId]) {
        connectedClientsPerDocument[documentId] =
          connectedClientsPerDocument[documentId].filter(
            (name) => name !== clientName
          );
        io.to(documentId).emit(
          'connected-clients',
          connectedClientsPerDocument[documentId]
        );
      }
      console.log(connectedClientsPerDocument);
    });

    console.log('connected..');
  });

  console.log('connected..');
});

function createBucket(bucketName) {
  console.log(`Creating new bucket: ${bucketName}`);
  return s3
    .createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: 'us-south',
      },
    })
    .promise()
    .then(() => {
      console.log(`Bucket: ${bucketName} created!`);
    })
    .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

async function findOrCreateDocument(id, name) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, name, data: defaultValue });
}

function createTextFile(filename) {
  console.log(`Creating new item: `);
  // var local = "C:/Users/sanja/OneDrive/Documents/dbms notes.pdf";
  // const fileStream = fs.createReadStream(local);
  // const fileName = path.basename(local);
  return s3
    .putObject({
      Bucket: "ibm-hc-clone",
      Key: filename,
      Body: 'A Sample Document',
    })
    .promise()
    .then(() => {
      console.log(`Item:created!`);
    })
    .catch((e) => {
      console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
