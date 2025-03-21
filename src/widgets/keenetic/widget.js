import keeneticProxyHandler from "utils/proxy/handlers/keenetic";


const widget = {
  api: "rci/show/{endpoint}",
  proxyHandler: keeneticProxyHandler,
  mappings: {
    hotspot: {
      endpoint: "ip/hotspot",
    },
    interface: {
      endpoint: "interface",
    },
    system: {
      endpoint: "system",
    }
  },
};

export default widget;
