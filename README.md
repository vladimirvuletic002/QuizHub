# QuizHub

Full-stack web aplikacija (ASP.NET Core + React) sa live kvizovima (SignalR) i offline rešavanjem kvizova.

## Zahtevi i tehnologije

* Backend: .NET 8, ASP.NET Core Web API, EF Core, AutoMapper, JWT auth, SignalR
* Frontend: React (CRA), axios, @microsoft/signalr
* Baza: SQL Server (LocalDB ili pun SQL Server/Express)

## Konfiguracija

### Backend

1. Dopuni `backend/QuizHub/QuizHub/appsettings.json`:

   * `ConnectionStrings.QuizDatabase` – string ka SQL Serveru (lokalnoj bazi)
   * `Jwt:Issuer`, `Jwt:Audience`, `Jwt:Key`

2. (Prvi put) pokreni migracije:

```bash
   cd backend/QuizHub/QuizHub
   dotnet restore
   dotnet ef database update
3. Start: `dotnet run`

3. Start: `dotnet run`
   Po defaultu: https://localhost:7251

### Frontend

1. U `frontend/.env` navesti URL zadnje strane:
   REACT\_APP\_API\_URL=https://localhost:7251
2. Instalacija i start:
   cd frontend
   npm install
   npm start
   Aplikacija se otvara na http://localhost:3000
