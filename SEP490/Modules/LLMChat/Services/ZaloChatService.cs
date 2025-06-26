using SEP490.Common.Services;
using System.Text;
using System.Text.Json;

namespace SEP490.Modules.LLMChat.Services
{
    public class ZaloChatService: BaseService
    {
        private readonly HttpClient _httpClient;

        public ZaloChatService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<HttpResponseMessage> SendZaloChatAsync(ZaloChatRequest request)
        {
            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("http://localhost:8000/process_zalo_chat", content);
            return response;
        }
    }

    public class ZaloChatRequest
    {
        public string conversation_id { get; set; }
        public List<Message> messages { get; set; }
    }

    public class Message
    {
        public string sender_id { get; set; }
        public string sender_type { get; set; }
        public string message_type { get; set; }
        public string content { get; set; }
        public string send_time { get; set; }
    }
}
