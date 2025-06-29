namespace SEP490.Modules.Users.DTO
{
    public class LoginRequestDTO
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }
    public class LoginResponseDTO
    {
        public string Token { get; set; }
        public string UserName { get; set; }
        public string Role { get; set; }

    }
}
