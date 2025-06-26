using SEP490.Modules.Zalo.DTO;
using System.Text;
using System.Text.Json;

namespace SEP490.Modules.Zalo.Services
{
    public class ZaloChatForwardService : IZaloChatForwardService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ZaloChatForwardService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> ForwardMessagesAsync(List<MessageResponse> messages)
        {
            var client = _httpClientFactory.CreateClient();
            var json = JsonSerializer.Serialize(messages);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("http://localhost:8000/process_zalo_chat", content);
            return response.IsSuccessStatusCode;
        }
    }
}
