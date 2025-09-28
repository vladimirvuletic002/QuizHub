import * as signalR from "@microsoft/signalr";

let connection = null;

export function connectLive(token) {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${process.env.REACT_APP_API_URL}/hub/room`, {
      accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .build();

  return connection.start();
}

export function on(evt, handler) {
  if (!connection) return;
  connection.on(evt, handler);
}
export function off(evt, handler) {
  if (!connection) return;
  connection.off(evt, handler);
}

export function joinRoom(roomCode) {
  return connection.invoke("JoinRoom", roomCode);
}
export function leaveRoom(roomCode) {
  return connection.invoke("LeaveRoom", roomCode);
}

export function startQuiz(roomCode) {
  return connection.invoke("StartQuiz", roomCode);
}

export function submitAnswer(roomCode, questionId, payload) {
  // payload npr: { selectedOptionId } / { selectedOptionIds } / { trueFalseAnswer } / { textAnswer }
  return connection.invoke("SubmitAnswer", roomCode, questionId, payload);
}