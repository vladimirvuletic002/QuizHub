using QuizHub.Interfaces;
using System.Collections.Concurrent;

namespace QuizHub.Live
{
    public class RoomRegistry : IRoomRegistry
    {
        private readonly ConcurrentDictionary<string, LiveRoom> _rooms = new();

        public LiveRoom GetOrCreate(string roomCode) =>
            _rooms.GetOrAdd(roomCode, _ => new LiveRoom { RoomCode = roomCode });

        public bool TryGet(string roomCode, out LiveRoom? room) =>
            _rooms.TryGetValue(roomCode, out room);

        public void Remove(string roomCode) => _rooms.TryRemove(roomCode, out _);
    }
}
