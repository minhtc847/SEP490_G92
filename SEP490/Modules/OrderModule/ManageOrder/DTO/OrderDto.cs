using SEP490.DB.Models;
using System.Text.Json.Serialization;

namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string OrderCode { get; set; }
        public DateTime OrderDate { get; set; }
        public Status? Status { get; set; }
        public decimal Discount { get; set; }
        public decimal OriginalTotalAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public DeliveryStatus? DeliveryStatus { get; set; }
        [JsonPropertyName("isUpdateMisa")]
        public bool isUpdateMisa { get; set; }
    }
}
