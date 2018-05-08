exports.getOutputHashFormat = function (option, length = 6) {
  const hashFormats = {
    none: { chunk: '[name]', extract: '[name]', file: '[name]', script: '[name]' },
    media: { chunk: '[name]', extract: '[name]', file: `[hash:${length}]`, script: '[name]' },
    bundles: { chunk: `[name][chunkhash:${length}]`, extract: `[name][contenthash:${length}]`, file: '[name]', script: `[name][hash:${length}]` },
    all: { chunk: `[name][chunkhash:${length}]`, extract: `[name][contenthash:${length}]`, file: `[hash:${length}]`, script: `[name][hash:${length}]` },
  };
  return hashFormats[option] || hashFormats['none'];
}