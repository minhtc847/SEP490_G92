# Use the official .NET 6.0 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["SEP490.csproj", "."]
RUN dotnet restore "SEP490.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "SEP490.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SEP490.csproj" -c Release -o /app/publish

# Final stage/image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variable for Railway
ENV ASPNETCORE_URLS=http://+:$PORT

# Entry point
ENTRYPOINT ["dotnet", "SEP490.dll"] 