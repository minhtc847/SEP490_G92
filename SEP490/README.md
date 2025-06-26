
## Getting Started

First, run the update database:

```bash
dotnet ef database update
```

For migrate
```bash
./Scripts/migrate.bat AddTestTable
```

For rollback (Remove to this migration):
```bash
./Scripts/rollback.bat AddTestTable
```
