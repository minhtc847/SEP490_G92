
## Getting Started

First, run the update database:

```bash
dotnet ef database update
```

For migrate
```bash
./Scripts/migrate.sh AddTestTable
```

For rollback
```bash
./Scripts/migrate.sh RemoveTestTable
```