using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Services;

namespace SEP490.Modules.ZaloOrderModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ZaloConversationController : ControllerBase
    {
        private readonly IZaloConversationStateService _conversationService;
        private readonly SEP490DbContext _context;
        private readonly ILogger<ZaloConversationController> _logger;

        public ZaloConversationController(
            IZaloConversationStateService conversationService,
            SEP490DbContext context,
            ILogger<ZaloConversationController> logger)
        {
            _conversationService = conversationService;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get list of all conversations with pagination and filtering
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ConversationListResponse>> GetConversations(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? state = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                var query = _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory)
                    .Include(cs => cs.OrderItems)
                    .Include(cs => cs.Customer)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(cs => 
                        cs.ZaloUserId.Contains(searchTerm) ||
                        cs.UserName!.Contains(searchTerm) ||
                        cs.CustomerPhone!.Contains(searchTerm) ||
                        cs.LastUserMessage!.Contains(searchTerm));
                }

                if (!string.IsNullOrEmpty(state))
                {
                    query = query.Where(cs => cs.CurrentState == state);
                }

                if (isActive.HasValue)
                {
                    query = query.Where(cs => cs.IsActive == isActive.Value);
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(cs => cs.CreatedAt >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(cs => cs.CreatedAt <= toDate.Value);
                }

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination
                var conversations = await query
                    .OrderByDescending(cs => cs.LastActivity)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // Map to DTOs
                var conversationDtos = conversations.Select(cs => new ConversationListItem
                {
                    Id = cs.Id,
                    ZaloUserId = cs.ZaloUserId,
                    UserName = cs.UserName,
                    CustomerPhone = cs.CustomerPhone,
                    CurrentState = cs.CurrentState,
                    LastActivity = cs.LastActivity,
                    CreatedAt = cs.CreatedAt,
                    IsActive = cs.IsActive,
                    MessageCount = cs.MessageCount,
                    LastUserMessage = cs.LastUserMessage,
                    LastBotResponse = cs.LastBotResponse,
                    RetryCount = cs.RetryCount,
                    LastError = cs.LastError,
                    CustomerId = cs.CustomerId,
                    CustomerName = cs.Customer?.CustomerName,
                    OrderItemsCount = cs.OrderItems.Count
                }).ToList();

                var response = new ConversationListResponse
                {
                    Conversations = conversationDtos,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversations");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get detailed conversation by conversation ID
        /// </summary>
        [HttpGet("detail/{id}")]
        public async Task<ActionResult<ConversationState>> GetConversationDetail(int id)
        {
            try
                {
                var conversation = await _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory)
                    .Include(cs => cs.OrderItems)
                    .Include(cs => cs.Customer)
                    // .FirstOrDefaultAsync(cs => cs.Id == id && cs.IsActive);
                    .FirstOrDefaultAsync(cs => cs.Id == id );
                
                if (conversation == null)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Update last activity
                conversation.LastActivity = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var conversationState = new ConversationState
                {
                    Id = conversation.Id,
                    ZaloUserId = conversation.ZaloUserId,
                    CurrentState = conversation.CurrentState,
                    CurrentOrderId = conversation.CurrentOrderId,
                    LastActivity = conversation.LastActivity,
                    CreatedAt = conversation.CreatedAt,
                    IsActive = conversation.IsActive,
                    MessageCount = conversation.MessageCount,
                    LastUserMessage = conversation.LastUserMessage,
                    LastBotResponse = conversation.LastBotResponse,
                    RetryCount = conversation.RetryCount,
                    LastError = conversation.LastError,
                    UserName = conversation.UserName,
                    CustomerPhone = conversation.CustomerPhone,
                                         CustomerId = conversation.CustomerId,
                     CustomerName = conversation.Customer?.CustomerName,
                     ZaloOaId = "4582552177953221290", // Default Zalo OA ID
                     OrderItems = conversation.OrderItems.Select(oi => new OrderItem
                    {
                        ProductCode = oi.ProductCode,
                        ProductType = oi.ProductType,
                        Height = oi.Height,
                        Width = oi.Width,
                        Thickness = oi.Thickness,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList(),
                    MessageHistory = conversation.MessageHistory.Select(m => new ConversationMessage
                    {
                        Content = m.Content,
                        SenderType = m.SenderType,
                        MessageType = m.MessageType,
                        Timestamp = m.Timestamp
                    }).ToList()
                };

                return Ok(conversationState);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation detail for ID: {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get conversation statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<ConversationStatistics>> GetConversationStatistics()
        {
            try
            {
                var totalConversations = await _context.ZaloConversationStates.CountAsync();
                var activeConversations = await _context.ZaloConversationStates.CountAsync(cs => cs.IsActive);
                var todayConversations = await _context.ZaloConversationStates
                    .CountAsync(cs => cs.CreatedAt.Date == DateTime.UtcNow.Date);

                var stateStats = await _context.ZaloConversationStates
                    .GroupBy(cs => cs.CurrentState)
                    .Select(g => new StateStatistic
                    {
                        State = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                var statistics = new ConversationStatistics
                {
                    TotalConversations = totalConversations,
                    ActiveConversations = activeConversations,
                    TodayConversations = todayConversations,
                    StateStatistics = stateStats
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation statistics");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete a conversation
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteConversation(int id)
        {
            try
            {
                var conversation = await _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory)
                    .Include(cs => cs.OrderItems)
                    .FirstOrDefaultAsync(cs => cs.Id == id);

                if (conversation == null)
                {
                    return NotFound(new { message = "Conversation not found" });
                }

                // Remove related data first
                _context.ZaloConversationMessages.RemoveRange(conversation.MessageHistory);
                _context.ZaloConversationOrderItems.RemoveRange(conversation.OrderItems);
                
                // Remove the conversation itself
                _context.ZaloConversationStates.Remove(conversation);
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Conversation deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting conversation with ID: {Id}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }

    public class ConversationListResponse
    {
        public List<ConversationListItem> Conversations { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class ConversationListItem
    {
        public int Id { get; set; }
        public string ZaloUserId { get; set; } = string.Empty;
        public string? UserName { get; set; }
        public string? CustomerPhone { get; set; }
        public string CurrentState { get; set; } = string.Empty;
        public DateTime LastActivity { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public int MessageCount { get; set; }
        public string? LastUserMessage { get; set; }
        public string? LastBotResponse { get; set; }
        public int RetryCount { get; set; }
        public string? LastError { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public int OrderItemsCount { get; set; }
    }

    public class ConversationStatistics
    {
        public int TotalConversations { get; set; }
        public int ActiveConversations { get; set; }
        public int TodayConversations { get; set; }
        public List<StateStatistic> StateStatistics { get; set; } = new();
    }

    public class StateStatistic
    {
        public string State { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
