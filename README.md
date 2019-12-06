# Tour de Passe Passe

*Apple Wallet Signing JS Example*

This repository is an example of how to use the
[`walletpass/pass-js`](https://github.com/walletpass/pass-js) JS package
to create and sign Apple Wallet passes, and how to deploy it on Heroku.

Made with ❤️ during the batch #321 of [Le Wagon Paris](https://www.lewagon.com)

## Introduction word

The `pass-js`  documentation was not super clear at the time I wrote this,
I hope this can clarify things.

⚠️ Signing Apple Wallet Passes requires a paid Apple Developer account, you will
need to register before following this guide.

⚠️ This is purely for demonstration purposes and not safe for production

⚙️ As many Apple specific features, this is only easily doable on a Mac OS
computer (this example requires using for the Keychain Access).

## 1. Initial setup

```sh
git clone https://github.com/adipasquale/passe-passe.git
cd passe-passe
yarn install
```

## 2. Official Apple Wallet Steps

Follow the Apple Wallet Developer Guide, especially the
"Setting the Pass Type Identifier and Team ID" section on the
[Building Your First Pass](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/YourFirst.html#//apple_ref/doc/uid/TP40012195-CH2-SW1)

ℹ️ You **do not need** to install XCode nor compile the `signpass` tool

The important things you need to have after following this guide are :

- your Team Identifier, which looks like A939494
- a certificate file installed in your keychain

## 3. Export your certificate

- From the Keychain Access tool on your computer, find and export your
certificate as a `.p12` file.
Use the pass identifier you setup on Apple as the filename,
like `pass.com.your-app.p12`.
- It will ask you to enter a first password (let's call it `pass1`).
This is a new password, you can create it, just keep track of it.
- Copy the exported `.p12` file into the local `./certificates` directory.

Notes:

- ⚠️ do not select the `.pem` export format directly
- ℹ️ If the `.p12` export format does not show up, make sure you have selected
"My certificates" on the left sidebar:

## 4. Convert from p12 to pem

From this respository's root directory, you should be able to run:

```sh
passkit-keys certificates

# you may eventually need to fallback to:
./node_modules/@walletpass/pass-js/bin/passkit-keys certificates
```

Notes:

- You will first be asked for a 'Import password', which is the `pass1` that you
created in the previous step.
- You will then be asked for a pass phrase (let's call it `pass2`). You'll have
to repeat it once. This is a new pass phrase, so you can enter anything you'd
like.
- ⚠️ Make sure `pass2` is not too simple, and do not use cmd+c to paste it.
Both of these problems would fail silently and you'd get a broken certificate.
- `pass2` can be a simple sentence with a few words like "spider pyramid"
- Make sure that the generated `pass.com.your-app.pem` file contains two big
blocks, a CERTIFICATE one and a ENCRYPTED PRIVATE KEY one.

## 5. Prepare your environment variables

This repository uses the `dotenv` package. Locally, the only environment
variables you need to enter there are:

```sh
# in your local .env file

WALLET_TEAM_IDENTIFIER=A99999
WALLET_PEM_PRIVATE_KEY_PASSPHRASE=pass2
```

🚀 You can now run the app locally and browse [http://localhost:3001]
using Safari:

```sh
yarn start
```

## 6. Prepare deployment

In production, you usually don't want to rely on local `.pem` files, but rather
use environment variables (especially on Heroku).

Open your local `certificates/pass.com.your-app.pem` file and extract the first
big block that starts with `-----BEGIN CERTIFICATE-----`.

⚠️ You need to inline the big blocks of texts:

- add `\n` after the first line and before the last one
- remove all carriage returns

It should look like this:

```
-----BEGIN CERTIFICATE-----\nXXXXXXXXXXXXXXXXXXXXXX\n-----END CERTIFICATE-----
```

You can then proceed to remove all the carriage returns and copy this big blob
into your local `.env` file as the `WALLET_PEM_CERTIFICATE` environment variable

Repeat this step with the second block `ENCRYPTED PRIVATE KEY` and store it
as the `WALLET_PEM_PRIVATE_KEY` environment variable.

Now remove the `certificates/.pem` files and make sure the app still runs fine
locally with `yarn start`

🏁 You can now deploy in production and set the environment variables
accordingly 🏁
