import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import { FaWifi } from "react-icons/fa";
import { FaNetworkWired } from "react-icons/fa";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";


function NetworkInfo({ title, wifiCount, wireCount }) {
  return (
    <ul>
      <li
        key={title}
        id={title}
        className="bg-theme-200/50 dark:bg-theme-900/20 rounded-sm m-1 flex-1 flex flex-col items-left justify-center text-center p-1 service-block"
        data-name={title}
      >
        <div className="flex-1 overflow-hidden flex items-center justify-between rounded-r-md">
          <div className="shrink truncate px-2 py-1 text-theme-500 dark:text-theme-300 text-xs">
            {title}
          </div>
          <div className="flex flex-wrap truncate px-2 py-1 items-center text-theme-500 dark:text-theme-300 text-xs">
            <FaWifi />
            <div className="px-2 text-xs">
              {wifiCount}
            </div>
            <FaNetworkWired/>
            <div className="px-2 text-xs">
              {wireCount}
            </div>
          </div>
        </div>
      </li>
    </ul>
  );
}


export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;


  const { data: hotspotData, error: hotspotError } = useWidgetAPI(widget, "hotspot");
  const { data: interfaceData, error: interfaceError } = useWidgetAPI(widget, "interface");
  const { data: systemData, error: systemError } = useWidgetAPI(widget, "system");

  let systemInfoElements =
    <>
      <Block label="keenetic.upTime" />
      <Block label="keenetic.cpu" />
      <Block label="keenetic.memory" />
    </>
  let hotspotElements = <></>;

  if (!systemError && systemData){
    const memory = (systemData.memtotal - systemData.memfree - systemData.membuffers - systemData.memcache) * 100 / systemData.memtotal;

    systemInfoElements =
      <>
        <Block label="keenetic.upTime" value={t("common.duration", { value: systemData.uptime })} />
        <Block label="keenetic.cpu" value={t("common.percent", { value: systemData.cpuload, maximumFractionDigits: 2 })} />
        <Block label="keenetic.memory" value={t("common.percent", { value: memory, maximumFractionDigits: 2 })} />
      </>
  }

  if (!hotspotError && hotspotData && hotspotData.host){

    let clientsData = []

    if (!interfaceError && interfaceData){
      for (let id in interfaceData){
        let iface = interfaceData[id];

        if (iface.type !== "Bridge"){
          continue;
        }

        clientsData.push({
          id: iface.id,
          name: iface.description,
          wifiClients: [],
          wireClients: [],
        });
      }
    }

    for (const host of hotspotData.host) {

      if (typeof host.ap !== "string" && typeof host.port !== "string") {
        continue;
      }

      let data = clientsData.find(hotspotData => hotspotData.id === host.interface.id);

      if (!data){
        data = {
          id: host.interface.id,
          name: host.interface.description,
          wifiClients: [],
          wireClients: [],
        }

        clientsData.push(data);
      }

      if (typeof host.ap === "string"){
        data.wifiClients.push(data);
      }
      else {
        data.wireClients.push(data);
      }

      hotspotElements = clientsData.map((clientData, i) => (
        <NetworkInfo
          key={`${clientData.id}-${i}`}
          title={clientData.name}
          wifiCount={clientData.wifiClients.length}
          wireCount={clientData.wireClients.length}
        />
      ))
    }
  }



  return (
    <>
      <Container service={service}>
        { systemInfoElements }
      </Container>
      { hotspotElements }
    </>
  );

}
