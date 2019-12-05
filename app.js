const fs = require('fs');
const { Template, constants } = require("@walletpass/pass-js");
const parseISO = require('date-fns/parseISO')
require('dotenv').config()

const pemPassFilename = fs.readdirSync(`${__dirname}/certificates`).
  find(e => e.startsWith("pass.") && e.endsWith(".pem"))

const createPass = async () => {
  const template = await Template.load(
    `${__dirname}/Showtime.pass`,
  );
  template.teamIdentifier = process.env.WALLET_TEAM_IDENTIFIER;
  if (pemPassFilename) {
    console.log(`using local file certificates/${pemPassFilename}`)
    await template.loadCertificate(
      `${__dirname}/certificates/${pemPassFilename}`,
      process.env.WALLET_PEM_PRIVATE_KEY_PASSPHRASE
    );
  } else {
    console.log(`using environment variables`)
    template.setCertificate(process.env.WALLET_PEM_CERTIFICATE);
    template.setPrivateKey(
      process.env.WALLET_PEM_PRIVATE_KEY,
      process.env.WALLET_PEM_PRIVATE_KEY_PASSPHRASE
    );
  }
  const pass = template.createPass();
  // const buf = await pass.asBuffer();
  // await fs.writeFile(`${__dirname}/newPass.pkpass`, buf, () => console.log('test'));
  return pass;
}

const express = require('express')
const app = express()
const port = process.env.PORT || 3001

app.use(express.urlencoded());
app.use(express.json());

app.get('/', async (req, res) => {
  res.send(`
    <form action='/passes' method='POST'>
      <div><label>Movie Name <input name='movie_name' value="Les miserables" /></label></div>
      <div><label>Theater Name <input name='theater_name' value="MK2 Gambet" /></label></div>
      <div><label>Date <input name='time' value='2014-02-11T11:30:30' /></label></div>
      <input type='submit' />
    </form>
  `)
})

app.post('/passes', async (req, res) => {
  const pass = await createPass();
  pass.primaryFields.add({ key: "event", label: "Film", value: req.body.movie_name });
  pass.auxiliaryFields.add({ key: "loc", label: "Cinéma", value: req.body.theater_name });
  pass.auxiliaryFields.add({
    key: "time",
    label: "Heure",
    value: parseISO(req.body.time),
    dateStyle: constants.dateTimeFormat.SHORT,
    timeStyle: constants.dateTimeFormat.SHORT
  });
  // await pass.images.add("thumbnail", "/Users/adipasquale/Downloads/thumbnail.png", "1x")
  // await pass.images.add("thumbnail", "/Users/adipasquale/Downloads/thumbnail@2x.png", "2x")
  pass.barcodes = [
    {
      message: "1234567890",
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    }
  ]
  const body = await pass.asBuffer();
  res.type('application/vnd.apple.pkpass');
  res.send(body)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
