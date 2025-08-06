namespace SEP490.Modules.Zalo.Models
{
    /// <summary>
    /// Zalo Dynamic API Response Format
    /// Based on: https://chatbot.zalo.me/oa/docs/advanced/dynamic-api-msg
    /// </summary>
    public class ZaloDynamicResponse
    {
        public string Version { get; set; } = "chatbot";
        public ZaloDynamicContent Content { get; set; } = new ZaloDynamicContent();
    }

    public class ZaloDynamicContent
    {
        public List<ZaloDynamicMessage> Messages { get; set; } = new List<ZaloDynamicMessage>();
    }

    public class ZaloDynamicMessage
    {
        public string Type { get; set; } = "text"; // text, image, list
        public string? Text { get; set; }
        public string? ImageUrl { get; set; }
        public string? Caption { get; set; }
        public List<ZaloDynamicButton>? Buttons { get; set; }
        public List<ZaloDynamicListElement>? Elements { get; set; } // For list type
    }

    public class ZaloDynamicButton
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "query"; // url, phone, query
        public string Payload { get; set; } = string.Empty;
        public string? Url { get; set; } // For type = "url"
    }

    public class ZaloDynamicListElement
    {
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? ImageUrl { get; set; }
        public ZaloDynamicAction? Action { get; set; }
    }

    public class ZaloDynamicAction
    {
        public string Type { get; set; } = "url";
        public string Url { get; set; } = string.Empty;
    }

    /// <summary>
    /// Helper class để tạo Dynamic Response
    /// </summary>
    public static class ZaloDynamicResponseBuilder
    {
        public static ZaloDynamicResponse CreateTextMessage(string text, List<ZaloDynamicButton>? buttons = null)
        {
            return new ZaloDynamicResponse
            {
                Content = new ZaloDynamicContent
                {
                    Messages = new List<ZaloDynamicMessage>
                    {
                        new ZaloDynamicMessage
                        {
                            Type = "text",
                            Text = text,
                            Buttons = buttons
                        }
                    }
                }
            };
        }

        public static ZaloDynamicResponse CreateMultipleMessages(List<ZaloDynamicMessage> messages)
        {
            return new ZaloDynamicResponse
            {
                Content = new ZaloDynamicContent
                {
                    Messages = messages
                }
            };
        }

        public static ZaloDynamicButton CreateButton(string name, string type, string payload, string? url = null)
        {
            return new ZaloDynamicButton
            {
                Name = name,
                Type = type,
                Payload = payload,
                Url = url
            };
        }

        public static ZaloDynamicMessage CreateOrderSummary(string orderCode, decimal totalAmount, List<string> itemsSummary)
        {
            var text = $@"✅ **ĐƠN HÀNG ĐÃ TẠO THÀNH CÔNG!**

🆔 **Mã đơn hàng:** {orderCode}
💰 **Tổng tiền:** {totalAmount:N0} VNĐ

📋 **Chi tiết sản phẩm:**
{string.Join("\n", itemsSummary.Select((item, index) => $"{index + 1}. {item}"))}

📞 **Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất!**";

            var buttons = new List<ZaloDynamicButton>
            {
                CreateButton("📋 Xem chi tiết", "query", $"chi tiết đơn hàng {orderCode}"),
                CreateButton("📞 Liên hệ hỗ trợ", "phone", "0123456789"),
                CreateButton("🛒 Đặt hàng mới", "query", "đặt hàng mới")
            };

            return new ZaloDynamicMessage
            {
                Type = "text",
                Text = text,
                Buttons = buttons
            };
        }
    }
} 