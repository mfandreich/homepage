import validateWidgetData from "utils/proxy/validate-widget-data";
import getServiceWidget from "utils/config/service-helpers";
import { formatApiCall, sanitizeErrorURL } from "utils/proxy/api-helpers";
import createLogger from "utils/logger";
import widgets from "widgets/widgets";
import KeeneticAPI from "utils/keenetic/keenetic-api";


const logger = createLogger("keeneticProxyHandler");

export default async function keeneticProxyHandler(req, res, map) {
  const { group, service, endpoint, index } = req.query;

  if (group && service) {
    const widget = await getServiceWidget(group, service, index);

    if (!widgets?.[widget.type]?.api) {
      return res.status(403).json({ error: "Service does not support API calls" });
    }

    if (widget) {

      if (typeof widget.host !== "string" ||
          typeof widget.user !== "string" ||
          typeof widget.password !== "string") {
        return res.status(400).json({ error: "Invalid configuration" });
      }

      try {

        const url = formatApiCall(widgets[widget.type].api, { endpoint, ...widget });
        const api = new KeeneticAPI(widget.host, widget.user, widget.password);

        let authenticated = await api.keenAuth();

        if (!authenticated) {
          return res.status(401).json({
            error: "Authentication failed",
          });
        }

        let data = await api.keenRequestData(url);

        if (!validateWidgetData(widget, endpoint, data)) {
          return res
            .status(500)
            .json({ error: { message: "Invalid data", url: sanitizeErrorURL(url), data: data } });
        }
        if (map) data = map(data);

        return res.status(200).json(data);
      }
      catch (e) {
        return res.status(400).json({
          error: e,
        });
      }
    }
  }
}
