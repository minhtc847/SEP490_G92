using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloCustomerService :BaseService, IZaloCustomerService
    {
        private readonly ILogger<ZaloCustomerService> _logger;
        private readonly SEP490DbContext _context;

        public ZaloCustomerService(ILogger<ZaloCustomerService> logger, SEP490DbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<Customer?> GetCustomerByPhoneAsync(string phoneNumber)
        {
            try
            {
                // Normalize phone number (remove spaces, dashes, etc.)
                var normalizedPhone = NormalizePhoneNumber(phoneNumber);
                
                if (string.IsNullOrEmpty(normalizedPhone))
                {
                    _logger.LogWarning("Invalid phone number format: {PhoneNumber}", phoneNumber);
                    return null;
                }

                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Phone != null && NormalizePhoneNumber(c.Phone) == normalizedPhone);

                if (customer != null)
                {
                    _logger.LogInformation("Found customer with phone {PhoneNumber}: {CustomerName}", phoneNumber, customer.CustomerName);
                }
                else
                {
                    _logger.LogInformation("No customer found with phone number: {PhoneNumber}", phoneNumber);
                }

                return customer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer by phone number: {PhoneNumber}", phoneNumber);
                return null;
            }
        }

        public async Task<bool> ValidatePhoneNumberAsync(string phoneNumber)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(phoneNumber))
                    return false;

                // B? kho?ng tr?ng và ký t? không c?n thi?t
                var cleaned = phoneNumber.Trim();

                // N?u b?t ??u b?ng +84 thì thay thành 0
                if (cleaned.StartsWith("+84"))
                    cleaned = "0" + cleaned.Substring(3);

                // N?u b?t ??u b?ng 84 và dài > 9 thì thay thành 0
                else if (cleaned.StartsWith("84") && cleaned.Length > 9)
                    cleaned = "0" + cleaned.Substring(2);

                // B? t?t c? ký t? không ph?i s?
                cleaned = Regex.Replace(cleaned, @"\D", "");

                // Regex: 10 s?, b?t ??u b?ng 03, 05, 07, 08, 09
                var pattern = @"^(03|05|07|08|09)\d{8}$";

                return Regex.IsMatch(cleaned, pattern);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating phone number: {PhoneNumber}", phoneNumber);
                return false;
            }
        }

        private string NormalizePhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return string.Empty;

            // Remove all non-digit characters
            var digitsOnly = Regex.Replace(phoneNumber, @"[^\d]", "");

            // If it starts with 84, convert to 0
            if (digitsOnly.StartsWith("84") && digitsOnly.Length == 11)
            {
                digitsOnly = "0" + digitsOnly.Substring(2);
            }

            // If it starts with +84, convert to 0
            if (digitsOnly.StartsWith("84") && digitsOnly.Length == 11)
            {
                digitsOnly = "0" + digitsOnly.Substring(2);
            }

            return digitsOnly;
        }
    }
}
