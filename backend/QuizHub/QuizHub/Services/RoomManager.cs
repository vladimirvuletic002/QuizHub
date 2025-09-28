using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuizHub.Dto.Live;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;
using QuizHub.Live;
using QuizHub.Models;
using System.Text.Json;

namespace QuizHub.Services
{
    public class RoomManager : IRoomManager
    {
        private readonly IHubContext<RoomHub> _hub;
        private readonly QuizDbContext _db;
        private readonly IRoomRegistry _registry;

        public RoomManager(IHubContext<RoomHub> hub, QuizDbContext db, IRoomRegistry registry)
        {
            _hub = hub; _db = db; _registry = registry;
        }

        public async Task CreateRoomAsync(string roomCode, long quizId, long adminUserId, string adminName, int revealSeconds = 5)
        {
            var r = _registry.GetOrCreate(roomCode);

   			var quiz = await _db.Quizzes
        		.Include(q => q.Questions).ThenInclude(x => x.Options)
        		.FirstOrDefaultAsync(q => q.Id == quizId);
			if (quiz == null) throw new HubException("Quiz not found");

		    r.RoomCode = roomCode;
		    r.QuizId = quizId;
		    r.RevealSeconds = revealSeconds <= 0 ? 5 : revealSeconds;
		    r.State = LiveRoomState.Lobby;
		    r.CurrentIndex = -1;

		    r.Questions = quiz.Questions
		        .OrderBy(x => x.Order)
		        .Select((q, idx) => new LiveQuestionDto {
			        Id = q.Id,
		            Text = q.Text,
		            Type = q.Type,                         
		            TimeLimitSeconds = quiz.TimeLimitSeconds,
		            Order = q.Order == 0 ? (idx + 1) : q.Order,
		            Points = q.Points,
		            Options = q.Type == QuestionType.TextInput ? null :
		                q.Options.Select(o => new LiveOptionDto {
			                    Id = o.Id, Text = o.Text
		                }).ToList()
		        })
		        .ToList();


		    await _hub.Clients.Group(roomCode).SendAsync("StateChanged", new { state = "Lobby", index = -1 });
		                
		        
        }

        public async Task AddParticipantAsync(string roomCode, long userId, string username, bool isAdmin, string connectionId)
        {
            var r = _registry.GetOrCreate(roomCode);
            r.Participants[userId] = new Participant { UserId = userId, Username = username, IsAdmin = isAdmin, ConnectionId = connectionId };
            r.Scores.TryAdd(userId, 0);

            var lb = BuildLeaderboard(r);
			var adminConnIds = r.Participants.Values
			    .Where(p => p.IsAdmin && !string.IsNullOrEmpty(p.ConnectionId))
			    .Select(p => p.ConnectionId!);
			await _hub.Clients.Clients(adminConnIds).SendAsync("ScoresUpdated", new LeaderboardDto { Rows = lb });
            //await _hub.Clients.Client(connectionId).SendAsync("ScoresUpdated", new LeaderboardDto { Rows = lb });
        }

        public async Task RemoveConnectionAsync(string roomCode, string connectionId)
        {
            if (_registry.TryGet(roomCode, out var r) && r != null)
            {
                foreach (var kv in r.Participants)
                {
                    if (kv.Value.ConnectionId == connectionId)
                    {
                        kv.Value.ConnectionId = null; // ne brišemo usera, dozvoli reconnect
                        break;
                    }
                }
            }
            //return Task.CompletedTask;
			var lb = BuildLeaderboard(r);
        	await _hub.Clients.Group(roomCode).SendAsync("ScoresUpdated", new LeaderboardDto { Rows = lb });
        }


        public async Task StartQuizAsync(string roomCode, long adminUserId)
        {
            if (!_registry.TryGet(roomCode, out var r) || r == null) return;
            if (!r.Participants.TryGetValue(adminUserId, out var p) || !p.IsAdmin) return;

            r.CurrentIndex = 0;

            await _hub.Clients.Group(roomCode).SendAsync("ScoresUpdated", new LeaderboardDto { Rows = BuildLeaderboard(r) });

            await ShowQuestionAsync(r);
        }

        private async Task ShowQuestionAsync(LiveRoom r)
        {

			var qs = r.Questions;
		    if (qs == null || qs.Count == 0 || r.CurrentIndex < 0 || r.CurrentIndex >= qs.Count)
		    {
			        await FinishAsync(r);
		        	return;
		    }

		    var q = qs[r.CurrentIndex];
		    


            r.State = LiveRoomState.Question;
            r.AnsweredThisQuestion.Clear();
            r.QuestionStartedUtc = DateTimeOffset.UtcNow;
            //r.QuestionTimeLimitSec = (q.TimeLimitSeconds.HasValue && q.TimeLimitSeconds.Value > 0) ? q.TimeLimitSeconds.Value : 30;
            r.QuestionTimeLimitSec = q.TimeLimitSeconds / qs.Count;


			await _hub.Clients.Group(r.RoomCode).SendAsync("StateChanged", new { state = "Question", index = r.CurrentIndex });
            await _hub.Clients.Group(r.RoomCode).SendAsync("ShowQuestion", q);

            StartTicker(r);
        }

        private void StartTicker(LiveRoom r)
        {
            r.TickCts?.Cancel();
            r.TickCts = new CancellationTokenSource();

            _ = Task.Run(async () =>
            {
                try
                {
                    var end = r.QuestionStartedUtc!.Value.AddSeconds(r.QuestionTimeLimitSec);
                    while (DateTimeOffset.UtcNow < end && r.State == LiveRoomState.Question && !r.TickCts.IsCancellationRequested)
                    {
                        var left = (int)Math.Max(0, (end - DateTimeOffset.UtcNow).TotalSeconds);
                        await _hub.Clients.Group(r.RoomCode).SendAsync("Tick", new TickDto { Left = left });
                        await Task.Delay(1000, r.TickCts.Token);
                    }
                    if (!r.TickCts.IsCancellationRequested)
                        await RevealAndNextAsync(r);
                }
                catch (TaskCanceledException) { /* ok */ }
                catch (Exception ex)
                {
                    // barem završiti kviz da UI ne ostane u Reveal
                    await _hub.Clients.Group(r.RoomCode).SendAsync("Finished", new LeaderboardDto { Rows = BuildLeaderboard(r) });
                }
            });
        }

        private List<ScoresRowDto> BuildLeaderboard(LiveRoom r) =>
            r.Scores
             .Where(kv => r.Participants.TryGetValue(kv.Key, out var u) && !u.IsAdmin && !string.IsNullOrEmpty(u.ConnectionId))
             .OrderByDescending(kv => kv.Value)
             .ThenBy(kv =>                     // 2) manji zbir vremena za tacne odgovore
                r.SpeedTieMs.TryGetValue(kv.Key, out var t) ? t : long.MaxValue)
             .ThenBy(kv =>                     // 3) ko je ranije odgovorio (fallback)
                r.LastAnswerAt.TryGetValue(kv.Key, out var at) ? at : DateTimeOffset.MaxValue)
             .Select(kv =>
             {
                 var u = r.Participants[kv.Key];
                 return new ScoresRowDto { UserId = kv.Key, Username = u.Username, Score = kv.Value };
             })
             .ToList();

        public async Task SubmitAsync(string roomCode, long userId, long questionId, object payload)
        {
            if (!_registry.TryGet(roomCode, out var r) || r == null) return;
            if (r.State != LiveRoomState.Question) return;
            if (!r.Participants.ContainsKey(userId)) return;
            if (r.AnsweredThisQuestion.ContainsKey(userId)) return;

            // admin ne ucestvuje
            if (r.Participants.TryGetValue(userId, out var part) && part.IsAdmin)
                return;

            if (r.AnsweredThisQuestion.ContainsKey(userId)) return;

            var q = await _db.Questions
                .Include(x => x.Options)
                .Include(x => x.AcceptableAnswers)
                .FirstAsync(x => x.Id == questionId);

            var correct = Evaluate(q, payload);
            var basePoints = q.Points;

            var elapsed = (int)(DateTimeOffset.UtcNow - r.QuestionStartedUtc!.Value).TotalSeconds;
            var left = Math.Max(0, r.QuestionTimeLimitSec - elapsed);
            var bonus = (int)Math.Round(basePoints * 0.5 * (left / (double)r.QuestionTimeLimitSec));
            var awarded = correct ? basePoints + bonus : 0;

            var now = DateTimeOffset.UtcNow;
            var elapsedMs = (long)(now - r.QuestionStartedUtc!.Value).TotalMilliseconds;

            // beleži vreme poslednjeg odgovora (i za netačne – sekundarni tie-break)
            r.LastAnswerAt.AddOrUpdate(userId, now, (_, __) => now);

            // za primarni tie-break sabiramo vremena SAMO za tačne odgovore
            if (correct)
            {
                r.SpeedTieMs.AddOrUpdate(userId, elapsedMs, (_, old) => old + elapsedMs);
            }

            r.AnsweredThisQuestion[userId] = true;
            r.Scores.AddOrUpdate(userId, awarded, (_, old) => old + awarded);

            var lb = BuildLeaderboard(r);

            await _hub.Clients.Group(r.RoomCode).SendAsync("ScoresUpdated", new LeaderboardDto { Rows = lb });
        }

    

        private bool Evaluate(Question q, object payload)
        {
            if (payload is JsonElement je)
                return EvaluateJson(q, je);

            if (payload is IDictionary<string, object?> dict)
                return EvaluateDict(q, dict);

            return false;
        }

        private bool EvaluateJson(Question q, JsonElement je)
        {
            string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

            switch (q.Type)
            {
                case QuestionType.SingleChoice:
                    if (je.TryGetProperty("selectedOptionId", out var so) && so.ValueKind == JsonValueKind.Number)
                    {
                        var lid = so.GetInt64();
                        return q.Options.Any(o => o.Id == lid && o.IsCorrect);
                    }
                    break;

                case QuestionType.MultipleChoice:
                    if (je.TryGetProperty("selectedOptionIds", out var arr) && arr.ValueKind == JsonValueKind.Array)
                    {
                        var chosen = arr.EnumerateArray().Where(x => x.ValueKind == JsonValueKind.Number).Select(x => x.GetInt64()).ToHashSet();
                        var correct = q.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                        return chosen.SetEquals(correct);
                    }
                    break;

                case QuestionType.TrueFalse:
                    if (je.TryGetProperty("trueFalseAnswer", out var tfEl) && tfEl.ValueKind == JsonValueKind.True || tfEl.ValueKind == JsonValueKind.False)
                    {
                        var tf = tfEl.GetBoolean();
                        // ako ima eksplicitnih TF opcija:
                        var trueCorrect = q.Options.Any(o => o.IsCorrect && (string.Equals(o.Text, "Tačno", StringComparison.OrdinalIgnoreCase) || string.Equals(o.Text, "Tacno", StringComparison.OrdinalIgnoreCase)));
                        if (!q.Options.Any(o => string.Equals(o.Text, "Tačno", StringComparison.OrdinalIgnoreCase) || string.Equals(o.Text, "Tacno", StringComparison.OrdinalIgnoreCase)))
                        {
                            // fallback: bilo koja tačna
                            trueCorrect = q.Options.Any(o => o.IsCorrect);
                        }
                        return tf == trueCorrect;
                    }
                    break;

                case QuestionType.TextInput:
                    if (je.TryGetProperty("textAnswer", out var sEl) && sEl.ValueKind == JsonValueKind.String)
                    {
                        var val = sEl.GetString();
                        var set = q.AcceptableAnswers.Select(a => Norm(a.AnswerText)).ToHashSet();
                        return set.Contains(Norm(val));
                    }
                    break;
            }
            return false;
        }

        private bool EvaluateDict(Question q, IDictionary<string, object?> dict)
        {
            string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

            switch (q.Type)
            {
                case QuestionType.SingleChoice:
                    if (dict.TryGetValue("selectedOptionId", out var v) && v is long lid)
                        return q.Options.Any(o => o.Id == lid && o.IsCorrect);
                    break;

                case QuestionType.MultipleChoice:
                    if (dict.TryGetValue("selectedOptionIds", out var vv) && vv is IEnumerable<object?> arr)
                    {
                        var chosen = arr.Select(x => Convert.ToInt64(x)).ToHashSet();
                        var correct = q.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                        return chosen.SetEquals(correct);
                    }
                    break;

                case QuestionType.TrueFalse:
                    if (dict.TryGetValue("trueFalseAnswer", out var b) && b is bool tf)
                    {
                        var trueCorrect = q.Options.Any(o => o.IsCorrect && (o.Text.Equals("Tačno", StringComparison.OrdinalIgnoreCase) || o.Text.Equals("Tacno", StringComparison.OrdinalIgnoreCase)));
                        if (!q.Options.Any(o => o.Text.Equals("Tačno", StringComparison.OrdinalIgnoreCase) || o.Text.Equals("Tacno", StringComparison.OrdinalIgnoreCase)))
                            trueCorrect = q.Options.Any(o => o.IsCorrect);
                        return tf == trueCorrect;
                    }
                    break;

                case QuestionType.TextInput:
                    if (dict.TryGetValue("textAnswer", out var s) && s is string str)
                    {
                        var set = q.AcceptableAnswers.Select(a => Norm(a.AnswerText)).ToHashSet();
                        return set.Contains(Norm(str));
                    }
                    break;
            }
            return false;
        }

        private async Task RevealAndNextAsync(LiveRoom r)
        {
            r.State = LiveRoomState.Reveal;

            await _hub.Clients.Group(r.RoomCode).SendAsync("ScoresUpdated", new LeaderboardDto { Rows = BuildLeaderboard(r) });

            await _hub.Clients.Group(r.RoomCode).SendAsync("Reveal", new RevealDto());

            await Task.Delay(Math.Max(1, r.RevealSeconds) * 1000);
            var qs = r.Questions ?? new List<LiveQuestionDto>();

			if (r.CurrentIndex + 1 < qs.Count)
            {
                r.CurrentIndex++;
                await ShowQuestionAsync(r);
            }
            else
            {
                await FinishAsync(r);
            }
        }

        private async Task FinishAsync(LiveRoom r)
        {
            r.State = LiveRoomState.Finished;
            r.TickCts?.Cancel();

            var lb = BuildLeaderboard(r);

            await _hub.Clients.Group(r.RoomCode).SendAsync("Finished", new LeaderboardDto { Rows = lb });
        }
    }
}
