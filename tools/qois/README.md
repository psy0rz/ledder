# QOIS encoder test tool

Tooling around the QOIS encoder (`ledder/server/DisplayQOIS.ts`): capture raw frame
sequences from real animations, measure compression, round-trip verify against a JS
reference decoder that implements the full decoder contract (persistent framebuffer +
color index, `QOIS_OP_PREVFRAME`), and dump encoded streams as test vectors for the
[ledstream](https://github.com/psy0rz/ledstream) firmware decoder (`test/host` there).

```sh
npx tsc   # the tool imports the compiled .js

node tools/qois/qois-frames.mjs capture      # render animations -> frames/*.bin (raw RGB)
node tools/qois/qois-frames.mjs size         # bytes/frame with the current encoder
node tools/qois/qois-frames.mjs verify       # size + exact round-trip check
node tools/qois/qois-frames.mjs dump [ppc]   # frames/*.qois firmware test vectors;
                                             # ppc sets the pixels-per-channel header field
                                             # (default 0 = decoder uses its compiled-in value)
```

`frames/` is gitignored: run `capture` once to (re)generate it. Captures depend on
animation randomness, so encoded sizes are only comparable between encoder versions
when measured on the *same* captured `.bin` files.

For whole-frame codec comparisons (QOI vs deflate vs LZ4 etc.) see `npm run qoisbench`.
