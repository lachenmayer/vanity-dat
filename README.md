# vanity-dat


> Create [dat](https://datproject.org/) archives with a prefix of your choice.

![vanity-dat demo](demo.gif)

The bitcoin horde [wastes as much energy as Iceland](https://digiconomist.net/bitcoin-energy-consumption) trying to find hashes starting with lots of 0s - why shouldn't we do the same thing to get cool [dat](https://datproject.org/) addresses?

Dat addresses are hex representations of [Ed25519](https://ed25519.cr.yp.to/) public keys. With a little bit of imagination, you can represent lots of words in ["hexspeak"](https://en.wikipedia.org/wiki/Hexspeak).

This program generates lots of Ed25519 keypairs, and checks that they have the given word as a prefix. The top 3 longest prefixes are shown while the program is still searching.

You can choose to write the keypair to a file, or you can create a dat archive that has the generated key as its address.

## Install

```
npm install -g vanity-dat
```

## Usage

```
vanity-dat [word]
```

Options:

- `--create-dat [location]`
  Create a dat archive with the generated key in the given location.
- `--write-file [filename]`
  Writes the resulting keys into `filename.key` and `filename.secret_key`.

## Notes

Prefixes of length 4 or less are discovered more or less instantly, but the time it takes to find longer prefixes obviously scales very quickly (by a factor of 16).

My laptop can generate roughly 20000 keypairs at a time - given that, worst case times are:

| prefix | time (s) |
|---|---|
| 3 | 0.2 |
| 4 | 3.3 |
| 5 | 52.4 |
| 6 | 838.9 (~14 mins) |
| 7 | 13421.8 (~3.7 hours) |
| 8 | 214748.4 (~59.6 hours) |
| 9 | 3435973.8 (~39.7 days) |

ie. it probably doesn't make sense to try to generate a prefix longer than 8 characters, unless you have a lot of time on your hands :~)

Currently, this only uses one CPU core. You thus will want to run several instances at once to use all capacity - one for every core.

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2017 harry lachenmayer
