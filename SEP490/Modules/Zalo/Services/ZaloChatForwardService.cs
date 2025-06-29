using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Zalo.DTO;
using System.Text;
using System.Text.Json;

namespace SEP490.Modules.Zalo.Services
{
    public class ZaloChatForwardService : IZaloChatForwardService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly SEP490DbContext _context;

        public ZaloChatForwardService(IHttpClientFactory httpClientFactory, SEP490DbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        public async Task<LLMResponse> ForwardMessagesAsync(List<MessageResponse> messages)
        {
            // 1. Save messages to messagehistory
            foreach (var msg in messages)
            {
                var history = new HistoryMessage
                {
                    SenderId = msg.SenderId,
                    SenderType = msg.UserType,
                    MessageType = msg.MessageType,
                    Content = msg.MessageContent,
                    SendTime = msg.SendTime
                };
                _context.HistoryMessages.Add(history);
            }
            await _context.SaveChangesAsync();

            // 2. Prepare payload
            var conversationId = messages.FirstOrDefault()?.SenderId ?? "unknown";
            var payload = new
            {
                conversation_id = conversationId,
                messages = messages.Select(m => new
                {
                    sender_id = m.SenderId,
                    sender_type = m.UserType,
                    message_type = m.MessageType,
                    content = m.MessageContent,
                    send_time = m.SendTime.ToString("yyyy-MM-ddTHH:mm:ss")
                }).ToList()
            };

            var client = _httpClientFactory.CreateClient();
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("http://localhost:8000/process_zalo_chat", content);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<LLMResponse>(responseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result!;
        }
    }
}
