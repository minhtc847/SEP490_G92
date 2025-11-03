namespace SEP490.Selenium.Product.DTO
{
    public class InputSingleProduct
    {
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; } // e.g., "Hàng hóa". "Nguyên vật liệu", "Thành phẩm" Phai dung 1 trong 3
        public string Unit { get; set; } // e.g., "m3", "kg", "cái", etc. Phai co san trong misa
    }
}
