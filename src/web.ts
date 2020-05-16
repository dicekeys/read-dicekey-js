import express from 'express';
import * as fs from "fs";
import * as path from "path"
export const app = express();
const port = 3000;
const __dirname = path.resolve();
app.get('/', (req, res) => {
//  res.type("html");
  const data = fs.readFileSync(path.resolve(__dirname,"test.html")).toString("utf-8");
  res.send(data);
});
app.get('/read-dicekey-js.js', (req, res) => {
    res.type("text/javascript");
    res.send(fs.readFileSync(path.resolve(__dirname,"build/read-dicekey-js.js")).toString("utf-8"));
});
app.get('/test.js', (req, res) => {
  res.type("text/javascript");
  res.send(fs.readFileSync(path.resolve(__dirname,"dist/test.js")).toString("utf-8"));
});
app.get('/src/test.ts', (req, res) => {
  res.type("text/javascript");
  res.send(fs.readFileSync(path.resolve(__dirname,"src/test.ts")).toString("utf-8"));
});
app.get('/test.js.map', (req, res) => {
  res.send(fs.readFileSync(path.resolve(__dirname,"dist/test.js.map")).toString("utf-8"));
});
app.get('/read-dicekey-js.wasm', (req, res) => {
    res.type("application/wasm");
    res.send(fs.readFileSync(path.resolve(__dirname,"build/read-dicekey-js.wasm")));
});
// cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg
app.get('/image.jpg', (req, res) => {
    res.type("image/jpeg");
    res.send(fs.readFileSync(path.resolve(__dirname,
        "cpp/read-dicekey/tests/test-lib-read-keysqr/img/B23X21K21Y63F53I50O11H12J40M13G10P40C60S33U23A21W62L60V42D33T32Z61N13E33R63.jpg"
    )));
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});