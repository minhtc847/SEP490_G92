using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.SalesOrder.ManageSalesOrder.Services;
using SEP490.Modules.Zalo.Constants;
using SEP490.Modules.Zalo.DTO;
using SEP490.Modules.Zalo.Services;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;

namespace SEP490.Modules.Zalo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZaloController : ControllerBase
    {
        private readonly IZaloAuthService zaloAuthService;
        private readonly IZaloChatForwardService zaloChatForwardService;
        private readonly IGlassProductLookupService glassProductLookupService;
        private readonly IOrderService orderService;
        private readonly SEP490DbContext context;

        public ZaloController(IZaloAuthService _zaloAuthService, IZaloChatForwardService _zaloChatForwardService,
            IGlassProductLookupService _glassProductLookupService, SEP490DbContext _context, IOrderService _orderService)
        {
            zaloAuthService = _zaloAuthService;
            zaloChatForwardService = _zaloChatForwardService;
            glassProductLookupService = _glassProductLookupService;
            context = _context;
            orderService = _orderService;
        }
        [HttpPost]
        public ActionResult<string> StoreDevelopedZaloToken([FromBody]DevTokenRequest devTokenRequest)
        {
             
            try
            {
                zaloAuthService.StoreDevAccessToken(devTokenRequest.AccessToken, devTokenRequest.RefreshToken);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error saving token:");
            }

            return Ok("Token stored successfully.");
        }

        [HttpGet("get-message")]
        public async Task<IActionResult> GetMessages(string userId)
        {
            var messages = await zaloAuthService.getListMessageFromUser(userId);
            return Ok(messages);
        }

        [HttpPost("forward-message")]
        public async Task<IActionResult> ForwardMessages([FromBody] List<MessageResponse> messages)
        {
            var forwardResponse = await zaloChatForwardService.ForwardMessagesAsync(messages);

            var createProductDtos = new List<CreateProductDto>();


            foreach (var item in forwardResponse.Items)
            {
                var productCode = await glassProductLookupService.FindProductCodeAsync(
                    item.ItemCode, item.ItemType, item.Height, item.Width, item.Thickness
                );
                if (productCode != null)
                {
                    // Query product info from database
                    var product = await context.Products
                        .FirstOrDefaultAsync(p => p.ProductCode == productCode);

                    if (product != null)
                    {
                        createProductDtos.Add(new CreateProductDto
                        {
                            ProductId = product.Id,
                            ProductCode = product.ProductCode,
                            ProductName = product.ProductName,
                            Height = product.Height.ToString(),
                            Width = product.Width.ToString(),
                            Thickness = (int)product.Thickness,
                            Quantity = item.Quantity,
                            UnitPrice = (decimal)product.UnitPrice,
                            GlassStructureId = product.GlassStructureId
                        });
                    }
                }
            }

            // Build CreateOrderDto
            var createOrderDto = new CreateOrderDto
            {
                CustomerName = "Nguyễn Trường Tây",
                Address = "", // Fill with actual address if available
                Phone = "",   // Fill with actual phone if available
                OrderCode = null, // Or use your own order code generation logic
                OrderDate = DateTime.Now,
                Discount = 0, // Set discount if available
                Status = "Chưa thực hiện", // Or your default status
                Products = createProductDtos
            };

            //orderService.CreateOrder(createOrderDto);

            return Ok(forwardResponse);
        }
    }
}
