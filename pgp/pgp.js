/* Key Generation */
async function generateKey() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const passphrase = document.getElementById("passphrase").value;

  const key = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 4096,
    userIDs: [{ name, email }],
    passphrase
  });

  document.getElementById("publicKey").value = key.publicKey;
  document.getElementById("privateKey").value = key.privateKey;
}

/* Load Key File */
function loadKeyFile(event, targetId) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById(targetId).value = reader.result;
  };
  reader.readAsText(file);
}

/* Encrypt */
async function encryptMessage() {
  const publicKey = await openpgp.readKey({
    armoredKey: document.getElementById("encryptPublicKey").value
  });

  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({
      text: document.getElementById("encryptMessage").value
    }),
    encryptionKeys: publicKey
  });

  document.getElementById("encryptedOutput").value = encrypted;
}

/* Decrypt */
async function decryptMessage() {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: document.getElementById("decryptPrivateKey").value
    }),
    passphrase: document.getElementById("decryptPassphrase").value
  });

  const message = await openpgp.readMessage({
    armoredMessage: document.getElementById("encryptedInput").value
  });

  const { data } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey
  });

  document.getElementById("decryptedOutput").value = data;
}

/* Sign */
async function signMessage() {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({
      armoredKey: document.getElementById("signPrivateKey").value
    }),
    passphrase: document.getElementById("signPassphrase").value
  });

  const signed = await openpgp.sign({
    message: await openpgp.createCleartextMessage({
      text: document.getElementById("signMessage").value
    }),
    signingKeys: privateKey
  });

  document.getElementById("signedOutput").value = signed;
}

/* Verify */
async function verifyMessage() {
  const message = await openpgp.readCleartextMessage({
    cleartextMessage: document.getElementById("signedMessageInput").value
  });

  const publicKey = await openpgp.readKey({
    armoredKey: document.getElementById("verifyPublicKey").value
  });

  const verification = await openpgp.verify({
    message,
    verificationKeys: publicKey
  });

  try {
    await verification.signatures[0].verified;
    document.getElementById("verifyResult").innerText = "✅ Signature is valid";
  } catch {
    document.getElementById("verifyResult").innerText = "❌ Signature is NOT valid";
  }
}

/* Utilites */
function copyText(id) {
  navigator.clipboard.writeText(document.getElementById(id).value);
}

function downloadText(id, filename) {
  const text = document.getElementById(id).value;
  if (!text) return;

  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
