using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QuizHub.Dto.Live;
using QuizHub.Interfaces;
using System.Security.Claims;

namespace QuizHub.Live
{
    [Authorize]
    public class RoomHub : Hub
    {
        private readonly IRoomManager _rooms;

        public RoomHub(IRoomManager rooms) { _rooms = rooms; }

        public async Task JoinRoom(string roomCode)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            var userId = long.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var username = Context.User!.Identity!.Name ?? $"User{userId}";
            //await _rooms.AddParticipantAsync(roomCode, userId, username, isAdmin: false, connectionId: Context.ConnectionId);
            //await Clients.Group(roomCode).SendAsync("ParticipantJoined", new { userId, username });
			

		    var isRoleAdmin = Context.User!.IsInRole("Administrator");

    		var isAdmin = isRoleAdmin;

    		await _rooms.AddParticipantAsync(
	        	roomCode, userId, username, isAdmin, Context.ConnectionId);

    		await Clients.Group(roomCode)
        		.SendAsync("ParticipantJoined", new { userId, username, isAdmin });
  
        }

        public Task LeaveRoom(string roomCode) =>
            Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);

        public Task StartQuiz(string roomCode) =>
            _rooms.StartQuizAsync(roomCode, GetUserId());

        public Task SubmitAnswer(string roomCode, long questionId, object payload) =>
            _rooms.SubmitAsync(roomCode, GetUserId(), questionId, payload);

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Opciono: ako čuvaš roomCode u Context.Items možeš čistiti
            await base.OnDisconnectedAsync(exception);
        }

        private long GetUserId() =>
            long.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
