using System.Text.Json.Serialization;

namespace SEP490.Modules.Zalo.DTO
{
    public class LLMResponse
    {
        [JsonPropertyName("customer_name")]
        public string CustomerName { get; set; }

        [JsonPropertyName("items")]
        public List<RespondItem> Items { get; set; }

        [JsonPropertyName("total_quantity")]
        public int TotalQuantity { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; }
    }
    public class RespondItem
    {
        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("item_code")]
        public string ItemCode { get; set; }

        [JsonPropertyName("item_type")]
        public string ItemType { get; set; }

        [JsonPropertyName("height")]
        public double Height { get; set; }

        [JsonPropertyName("width")]
        public double Width { get; set; }

        [JsonPropertyName("thickness")]
        public double Thickness { get; set; }
    }
}
