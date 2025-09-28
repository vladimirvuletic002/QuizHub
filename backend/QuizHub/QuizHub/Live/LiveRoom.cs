using QuizHub.Dto.Live;
﻿using System.Collections.Concurrent;

namespace QuizHub.Live
{
    public class LiveRoom
    {
        public string RoomCode { get; set; } = default!;
        public long QuizId { get; set; }

        public LiveRoomState State { get; set; } = LiveRoomState.Lobby;
        public int CurrentIndex { get; set; } = -1;

        public DateTimeOffset? QuestionStartedUtc { get; set; }
        public int QuestionTimeLimitSec { get; set; }
        public int RevealSeconds { get; set; } = 5;

		public List<LiveQuestionDto> Questions { get; set; } = new();

        public ConcurrentDictionary<long, Participant> Participants { get; } = new();
        public ConcurrentDictionary<long, int> Scores { get; } = new();
        public ConcurrentDictionary<long, bool> AnsweredThisQuestion { get; } = new();

        public CancellationTokenSource? TickCts { get; set; }

        public ConcurrentDictionary<long, long> SpeedTieMs { get; } = new();              // zbir vremena za tacne odgovore
        public ConcurrentDictionary<long, DateTimeOffset> LastAnswerAt { get; } = new();  // sekundarni tie-break
    }
}
