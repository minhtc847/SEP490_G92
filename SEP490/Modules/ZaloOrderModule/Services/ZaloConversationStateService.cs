using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Constants;
using ZaloLLMResponse = SEP490.Modules.Zalo.DTO.LLMResponse;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloConversationStateService
    {
        Task<ConversationState> GetOrCreateConversationAsync(string zaloUserId);
        Task<bool> UpdateConversationStateAsync(string zaloUserId, string newState);
        Task<bool> UpdateConversationDataAsync(string zaloUserId, Action<ConversationState> updateAction);
        Task<bool> DeleteConversationAsync(string zaloUserId);
        Task<ConversationState?> GetConversationAsync(string zaloUserId);
        Task<bool> IsConversationActiveAsync(string zaloUserId);
    }

    public class ZaloConversationStateService : BaseScopedService, IZaloConversationStateService
    {
        private readonly ILogger<ZaloConversationStateService> _logger;
        private readonly SEP490DbContext _context;

        public ZaloConversationStateService(ILogger<ZaloConversationStateService> logger, SEP490DbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<ConversationState> GetOrCreateConversationAsync(string zaloUserId)
        {
            try
            {
                var existingConversation = await _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory)
                    .Include(cs => cs.OrderItems)
                    .FirstOrDefaultAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);

                if (existingConversation != null)
                {
                    // Update last activity
                    existingConversation.LastActivity = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    return MapToConversationState(existingConversation);
                }

                // Create new conversation
                var newConversation = new ZaloConversationState
                {
                    ZaloUserId = zaloUserId,
                    CurrentState = UserStates.NEW,
                    LastActivity = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.ZaloConversationStates.Add(newConversation);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new conversation for user: {UserId}", zaloUserId);
                
                return MapToConversationState(newConversation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting or creating conversation for user: {UserId}", zaloUserId);
                
                // Return default conversation if database fails
                return new ConversationState
                {
                    ZaloUserId = zaloUserId,
                    CurrentState = UserStates.NEW,
                    LastActivity = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
            }
        }

        public async Task<bool> UpdateConversationStateAsync(string zaloUserId, string newState)
        {
            try
            {
                var conversation = await _context.ZaloConversationStates
                    .FirstOrDefaultAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);

                if (conversation != null)
                {
                    conversation.CurrentState = newState;
                    conversation.LastActivity = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Updated conversation state to {NewState} for user: {UserId}", newState, zaloUserId);
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating conversation state for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<bool> UpdateConversationDataAsync(string zaloUserId, Action<ConversationState> updateAction)
        {
            try
            {
                var conversation = await _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory)
                    .Include(cs => cs.OrderItems)
                    .FirstOrDefaultAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);

                if (conversation != null)
                {
                    var conversationState = MapToConversationState(conversation);
                    updateAction(conversationState);
                    
                    // Update the database entity
                    UpdateDatabaseEntity(conversation, conversationState);
                    conversation.LastActivity = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating conversation data for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<bool> DeleteConversationAsync(string zaloUserId)
        {
            try
            {
                var conversation = await _context.ZaloConversationStates
                    .FirstOrDefaultAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);

                if (conversation != null)
                {
                    conversation.IsActive = false;
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Deleted conversation for user: {UserId}", zaloUserId);
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting conversation for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<ConversationState?> GetConversationAsync(string zaloUserId)
        {
            try
            {
                var conversation = await _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory)
                    .Include(cs => cs.OrderItems)
                    .FirstOrDefaultAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);

                if (conversation != null)
                {
                    conversation.LastActivity = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    
                    return MapToConversationState(conversation);
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation for user: {UserId}", zaloUserId);
                return null;
            }
        }

        public async Task<bool> IsConversationActiveAsync(string zaloUserId)
        {
            try
            {
                return await _context.ZaloConversationStates
                    .AnyAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking conversation existence for user: {UserId}", zaloUserId);
                return false;
            }
        }

        private ConversationState MapToConversationState(ZaloConversationState dbConversation)
        {
            return new ConversationState
            {
                ZaloUserId = dbConversation.ZaloUserId,
                CurrentState = dbConversation.CurrentState,
                PreviousState = dbConversation.PreviousState,
                CurrentOrderId = dbConversation.CurrentOrderId,
                LastActivity = dbConversation.LastActivity,
                CreatedAt = dbConversation.CreatedAt,
                IsActive = dbConversation.IsActive,
                MessageCount = dbConversation.MessageCount,
                LastUserMessage = dbConversation.LastUserMessage,
                LastBotResponse = dbConversation.LastBotResponse,
                RetryCount = dbConversation.RetryCount,
                LastError = dbConversation.LastError,
                UserName = dbConversation.UserName,
                CustomerPhone = dbConversation.CustomerPhone,
                CustomerId = dbConversation.CustomerId,
                OrderItems = dbConversation.OrderItems.Select(MapToOrderItem).ToList(),
                MessageHistory = dbConversation.MessageHistory.Select(MapToConversationMessage).ToList(),
                LastLLMResponse = !string.IsNullOrEmpty(dbConversation.LastLLMResponseJson) 
                    ? System.Text.Json.JsonSerializer.Deserialize<ZaloLLMResponse>(dbConversation.LastLLMResponseJson) 
                    : null
            };
        }

        private OrderItem MapToOrderItem(ZaloConversationOrderItem dbOrderItem)
        {
            return new OrderItem
            {
                ProductCode = dbOrderItem.ProductCode,
                ProductType = dbOrderItem.ProductType,
                Height = dbOrderItem.Height,
                Width = dbOrderItem.Width,
                Thickness = dbOrderItem.Thickness,
                Quantity = dbOrderItem.Quantity,
                UnitPrice = dbOrderItem.UnitPrice,
                TotalPrice = dbOrderItem.TotalPrice
            };
        }

        private ConversationMessage MapToConversationMessage(ZaloConversationMessage dbMessage)
        {
            return new ConversationMessage
            {
                Content = dbMessage.Content,
                SenderType = dbMessage.SenderType,
                MessageType = dbMessage.MessageType,
                Timestamp = dbMessage.Timestamp
            };
        }

        private void UpdateDatabaseEntity(ZaloConversationState dbConversation, ConversationState conversationState)
        {
            dbConversation.CurrentState = conversationState.CurrentState;
            dbConversation.PreviousState = conversationState.PreviousState;
            dbConversation.CurrentOrderId = conversationState.CurrentOrderId;
            dbConversation.MessageCount = conversationState.MessageCount;
            dbConversation.LastUserMessage = conversationState.LastUserMessage;
            dbConversation.LastBotResponse = conversationState.LastBotResponse;
            dbConversation.RetryCount = conversationState.RetryCount;
            dbConversation.LastError = conversationState.LastError;
            dbConversation.CustomerPhone = conversationState.CustomerPhone;
            dbConversation.CustomerId = conversationState.CustomerId;
            dbConversation.LastLLMResponseJson = conversationState.LastLLMResponse != null 
                ? System.Text.Json.JsonSerializer.Serialize(conversationState.LastLLMResponse) 
                : null;

            // Update message history
            var newMessages = conversationState.MessageHistory
                .Where(m => !dbConversation.MessageHistory.Any(dm => 
                    dm.Content == m.Content && 
                    dm.SenderType == m.SenderType && 
                    dm.Timestamp == m.Timestamp))
                .Select(m => new ZaloConversationMessage
                {
                    ZaloConversationStateId = dbConversation.Id,
                    Content = m.Content,
                    SenderType = m.SenderType,
                    MessageType = m.MessageType,
                    Timestamp = m.Timestamp
                });

            foreach (var message in newMessages)
            {
                dbConversation.MessageHistory.Add(message);
            }

            // Update order items
            var newOrderItems = conversationState.OrderItems
                .Where(oi => !dbConversation.OrderItems.Any(doi => 
                    doi.ProductCode == oi.ProductCode && 
                    doi.ProductType == oi.ProductType &&
                    doi.Height == oi.Height &&
                    doi.Width == oi.Width &&
                    doi.Thickness == oi.Thickness &&
                    doi.Quantity == oi.Quantity))
                .Select(oi => new ZaloConversationOrderItem
                {
                    ZaloConversationStateId = dbConversation.Id,
                    ProductCode = oi.ProductCode,
                    ProductType = oi.ProductType,
                    Height = oi.Height,
                    Width = oi.Width,
                    Thickness = oi.Thickness,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                });

            foreach (var orderItem in newOrderItems)
            {
                dbConversation.OrderItems.Add(orderItem);
            }
        }
    }
}

