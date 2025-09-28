import * as signalR from "@microsoft/signalr";

export function buildRoomConnection() {
  const raw = localStorage.getItem("auth");
  let token = null;
  try { token = raw ? (JSON.parse(raw).token || JSON.parse(raw).Token) : null; } catch {}

  const base = (process.env.REACT_APP_API_URL || "").replace(/\/+$/,""); // npr. https://localhost:7251
  const hubUrl = `${base}/hubs/room`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      // VAŽNO: SignalR šalje Bearer za /negotiate u headeru;
      // tokom WebSocket faze šalje ga kao query ?access_token=
      accessTokenFactory: () => (token ? token : undefined),
      // Ne forsiraj skipNegotiation osim ako NEMAS reverse proxy i 100% znaš da WebSockets radi
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.ServerSentEvents |
        signalR.HttpTransportType.LongPolling,
      //withCredentials: true, // jer koristiš CORS + credentials
    })
    .withAutomaticReconnect()
    .build();

  return connection;
}