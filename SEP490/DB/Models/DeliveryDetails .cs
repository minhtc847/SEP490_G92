using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class DeliveryDetail
    {
        public int DeliveryDetailId { get; set; }
        public int DeliveryId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Delivery Delivery { get; set; }
        public Product Product { get; set; }
    }
}
