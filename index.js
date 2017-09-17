const fs = require('fs')
const crypto = require('hypercore/lib/crypto')
const argv = require('minimist')(process.argv.slice(2))
const neatLog = require('neat-log')
const output = require('neat-log/output')

if (argv._.length < 1) {
  console.error('usage: vanity-dat [word]')
  console.error('options:')
  console.error('  -o filename - write keys to filename.key and filename.secret_key - defaults to [word]')
  process.exit(1)
}

const word = argv._[0]
const hexWord = wordToHex(word)
const filename = argv.o || word
const startTime = Date.now()
const topLimit = 3

const log = neatLog(view)

function view (state) {
  const runtime = Math.floor((Date.now() - startTime) / 1000)
  if (state.done) {
    return output`
      done! :)
      your vanity wasted ${runtime} seconds of computing power.
      here's your public key: ${state.top[0].publicKey}
      you can find the key pair in the files ${filename}.public and ${filename}.secret
    `
  }
  const tops = state.top.map(({prefixLength, publicKey, secretKey}) => {
    return output`
      prefix: ${prefixLength}
      public: ${publicKey}
      secret: ${secretKey}
    `
  }).join('\n\n')
  return output`
    searching: ${word} (${hexWord})
    runtime: ${runtime} seconds
    iterations: ${state.i} (${runtime > 0 ? state.i / runtime : 0} keys/s)

    ${tops}
  `
}

log.use((state, bus) => {
  state.top = []
  state.i = 0
  bus.on('found', keyPair => {
    state.i++
    state.top.push(keyPair)
    if (state.top.length > topLimit) {
      state.top.sort((a, b) => b.prefixLength - a.prefixLength)
      state.top = state.top.slice(0, topLimit)
    }
    bus.emit('render')
  })
  bus.emit('render')
})

log.use((state, bus) => {
  while (bestPrefixLength(state.top) < hexWord.length) {
    bus.emit('found', keyPairWithPrefix(hexWord))
  }
  if (state.top.length > 0) {
    state.done = true
    bus.emit('render')
  }
})

function keyPairWithPrefix (searchString) {
  const keyPair = crypto.keyPair()
  const publicKey = keyPair.publicKey.toString('hex')
  let prefixLength = 0
  for (let i = 0; i < searchString.length; i++) {
    if (searchString[i] !== publicKey[i]) break
    prefixLength++
  }
  return {
    prefixLength,
    publicKey,
    secretKey: keyPair.secretKey.toString('hex'),
    keyPair, // original key pair containing buffers so that they can be written to files at the end
  }
}

// top is sorted
function bestPrefixLength (top) {
  if (top.length >= 1) {
    return top[0].prefixLength
  }
  return 0
}

function writeKeys (filename, keyPair) {
  fs.writeFileSync(`${filename}.key`, keyPair.publicKey)
  fs.writeFileSync(`${filename}.secret_key`, keyPair.secretKey)
}

function wordToHex (word) {
  const hexspeak = {
    'b': '3',
    'g': '9',
    'i': '1',
    'l': '1',
    'o': '0',
    'r': '2',
    's': '5',
    't': '7',
  }

  let hexWord = ''
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase()
    if (isHex(char)) {
      hexWord += char
    } else if (char in hexspeak) {
      hexWord += hexspeak[char]
    } else {
      throw new Error(`word ${word} can not be turned into hex :(`)
    }
  }
  return hexWord
}

function isHex (char) {
  const c = char.charCodeAt(0)
  return c >= 0x30 && c <= 0x39 // 0-9
      || c >= 0x41 && c <= 0x46 // A-F
      || c >= 0x61 && c <= 0x66 // a-f
}
