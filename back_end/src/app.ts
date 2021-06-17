import axios from "axios";
import path from "path";
import express, { Request, Response, raw } from "express";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require("helmet");
import host from "./host/host";
import getConfig from "./config/config";
import ConfigTemplate from "./config/configTemplate";
import AdmZip from "adm-zip";
import FileType from "file-type";
const bodyParser = require("body-parser");
const config: ConfigTemplate = getConfig();

const app = express();
const port = config.port;

app.use(helmet());
app.use(bodyParser.raw({type: '*/*', limit:'1000mb'}));

app.post("/example", async (req: Request, res: Response) => {
  console.log('Body:' , req.body);
  const requestBodyFileType = await FileType.fromBuffer(req.body);

  if (requestBodyFileType === undefined || requestBodyFileType.mime !== 'application/zip') {
    res.status(400).send('Request body must be a zip!');
    console.log('Returned 400 to user due to request body not being a zip');
    return;
  }
  console.log('The request body is a zip.');

  const inputZip = new AdmZip(req.body);

  const apiJsonEntry = inputZip.getEntry('api.json');
  if (apiJsonEntry === null) {
    res.status(400).send('api.json must be included within the zip!');
    console.log('Returned 400 to user due to api.json not being included in zip');
    return;
  }
  console.log('api.json is included within the zip.');

  const apiJson = JSON.parse(apiJsonEntry.getData().toString());
  console.log(apiJson);

  const numberOfFiles: undefined | number = apiJson["create X Number Of Text Files?"];
  if (numberOfFiles === undefined || !Number.isInteger(numberOfFiles)) {
    res.status(400).send('[create X Number Of Text Files?] must be an integer!!');
    console.log('Returned 400 to user due to number of files not being an integer!');
    return;
  }
  console.log(numberOfFiles);

  const outputZip = new AdmZip();

  for (let i = 0; i <= numberOfFiles; i++) {
    const textFile = Buffer.from(`File ${i}`);
    outputZip.addFile(`File ${i}.txt`, textFile);
  }

  res.writeHead(
    200,
    {
      'Content-Disposition': 'attachment; filename=example-output.zip',
      'Content-Type': 'application/zip'
    }
  ).end(outputZip.toBuffer());
});

export { app, port };
