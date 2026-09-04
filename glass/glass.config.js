self.__se$config = {
  prefix: "/service/glass/",
  encodeUrl: Selenite.codec.xor.encode,
  decodeUrl: Selenite.codec.xor.decode,
  handler: "/glass/glass.handler.js",
  client: "/glass/glass.client.js",
  bundle: "/glass/glass.bundle.js",
  config: "/glass/glass.config.js",
  sw: "/glass/glass.sw.js",
};
