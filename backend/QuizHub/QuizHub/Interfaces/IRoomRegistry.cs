using QuizHub.Live;

namespace QuizHub.Interfaces
{
    public interface IRoomRegistry
    {
        LiveRoom GetOrCreate(string roomCode);
        bool TryGet(string roomCode, out LiveRoom? room);
        void Remove(string roomCode);
    }
}
